import {useState, useEffect} from 'react'
import ActionCable from 'action-cable-react-jwt'
import jwtDecode from 'jwt-decode'
import uuid from 'uuid/v4'

import apiConfig from 'javascript/config'
import socketActions from 'javascript/views/virtual-screening/socket-actions'
import useAllVideosReady from 'javascript/views/virtual-screening/use-all-videos-ready'
import useResource from 'javascript/utils/hooks/use-resource'
import useUnregisteredTokenState from 'javascript/views/virtual-screening/use-unregistered-token-state'
import UserStore from 'javascript/stores/user'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'

import { AssetPreviewType } from 'javascript/views/virtual-screening/host/pdf-selector'
import { VideoType, VirtualMeetingAttendeeType } from 'javascript/types/ModelTypes'

export interface ChatMessage {
  id: number
  body: string
  attendee: UserDetailsType
}

export type UserAliasType = {
  name: string
  label: string
}

export type UserStatusType = 'host' | 'active' | 'waiting'

export interface UserDetailsType {
  id: string
  name: string
  label: string
  attendeeStatus?: UserStatusType
  attendeeType: 'host' | 'user' | 'guest'
  online?: boolean
}

type CreateMeetingAttendeeType = { userStatus: UserStatusType }

export type ViewportMediaType = {
  type: 'video' | 'pdf'
  media: any
} | null

export interface SocketConnectionType {
  chatMessages: ChatMessage[]
  createMeetingAttendee: (userAlias: UserAliasType, userId: number) => Promise<CreateMeetingAttendeeType>
  existingAttendee: boolean
  isHost: boolean
  loadPresentationMedia: (viewportMedia: ViewportMediaType) => void
  meetingAttendees: UserDetailsType[]
  meetingId: number
  meetingIsLive: boolean
  newMessageCount: number
  presentationPdf: AssetPreviewType
  presentationVideo: VideoType
  resetNewMessageCount: () => void
  sendHostVideoPosition: (timeElapsed) => void
  sendPdfPageNumber: (pageNumber: number) => void
  sendVideoClientReady: () => void
  sendVideoPause: () => void
  sendVideoReadyPlay: () => void
  sendVideoTrackPosition: (time: number) => void
  setMeetingIsLive: (newState: boolean) => void
  sendAudioEnabled: () => void
  userDetails: UserDetailsType
  USER_DETAILS_STORAGE_KEY: string
}

const USER_DETAILS_EXPIRATION_MINUTES = 240
const USER_DETAILS_STORAGE_KEY = 'virtualMeetingAttendeeDetails'
const EXISTING_ATTENDEES_STORAGE_KEY = 'virtualMeetingExistingAttendees'

const useSockets: (meetingId: any, isHost: boolean, onMessageReceived: (payload: any) => void) => SocketConnectionType = (meetingId, isHost, onMessageReceived) => {
  const allVideosReadyState = useAllVideosReady()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessageCount, setNewMessageCount] = useState(0)
  const [existingAttendee, setExistingAttendee] = useState(false)
  const [meetingAttendees, setMeetingAttendees] = useState<UserDetailsType[]>([])
  const [meetingIsLive, setMeetingIsLive] = useState(false)
  const [presentationPdf, setPresentationPdf] = useState(null)
  const [presentationVideo, setPresentationVideo] = useState(null)
  const [socketConnection, setSocketConnection] = useState(null)
  const [userDetails, setUserDetails] = useState<UserDetailsType>(null)

  const virtualMeetingAttendeeResource = useResource('virtual-meeting-attendee')
  const virtualChatMessagesResource = useResource('virtual-meeting-chat-message')

  const user = UserStore.getUser()
  const token = useUnregisteredTokenState(user)
  const webSocketToken = token.attendeeSocketToken()

  useEffect(() => {
    let cableSocket
    if (!socketConnection && userDetails && webSocketToken) {
      const clientUuid = uuid()
      cableSocket = ActionCable.createConsumer(`${apiConfig.apiUrl}/cable?client-uuid=${clientUuid}`, webSocketToken)
      const socketConn = cableSocket.subscriptions.create({
        channel: 'VirtualMeetingChannel',
        room: meetingId
      }, {
        connected: () => {
          console.info('Socket Connection -> has been opened')
        },
        disconnected: () => {
          console.info('Socket Connection -> has been closed', webSocketToken)
        },
        received: (message) => {
          switch(message.type) {
            case socketActions.CHAT_MESSAGE: {
              setChatMessages((messages) => {
                const update = [...messages]
                update.push(message.payload.chatMessage)
                return update
              })
              setNewMessageCount((count) => count += 1)
              break;
            }
            case socketActions.PDF_LOAD: {
              if (message.payload?.pdf) {
                loadPresentationMedia({
                  type: 'pdf',
                  media: message.payload?.pdf
                })
              }
              break;
            }
            case socketActions.MEETING_ATTENDEES: {
              setMeetingAttendees(message.payload.attendees)
              allVideosReadyState.setOnlineClientsStatus({ attendees: message.payload.attendees })
              onMessageReceived(message)
              break;
            }
            case socketActions.MEETING_STARTED_BY_HOST: {
              setMeetingIsLive(true)
              onMessageReceived(message)
              break;
            }
            case socketActions.MEETING_ENDED_BY_HOST: {
              setMeetingIsLive(false)
              loadPresentationMedia(null)
              onMessageReceived(message)
              break;
            }
            case socketActions.VIDEO_LOAD: {
              if (message.payload?.video) {
                loadPresentationMedia({
                  type: 'video',
                  media: message.payload?.video
                })
              }
              onMessageReceived(message)
              break;
            }
            case socketActions.VIEWPORT_RESET: {
              loadPresentationMedia(null)
              onMessageReceived(message)
              break;
            }
            default: {
              onMessageReceived(message)
              break;
            }
          }
        }
      })
      setSocketConnection(socketConn)
    }
    return () => {
      setSocketConnection(null)
      cableSocket?.disconnect()
    }
  }, [webSocketToken, userDetails])

  const loadPresentationMedia = (viewportMedia: ViewportMediaType) => {
    setPresentationPdf(null)
    setPresentationVideo(null)
    if (!viewportMedia) return
    setTimeout(() => {
      switch (viewportMedia.type) {
        case 'video': {
          setPresentationVideo(viewportMedia.media)
          break
        }
        case 'pdf': {
          setPresentationPdf(viewportMedia.media)
          break
        }
      }
    }, 300) //timeout is important. need presentationVideo to be null between videos to force brightcove player to reload
  }

  const sendPdfPageNumber = (pageNumber) => {
    if (!socketConnection) return
    const message = {
      attendeeId: userDetails?.id,
      type: socketActions.PDF_PAGE_NUMBER,
      payload: {
        pageNumber
      }
    }
    socketConnection.send(message)
  }

  const sendVideoPause = () => {
    if (!socketConnection) return
    const message = {
      attendeeId: userDetails?.id,
      type: socketActions.VIDEO_PAUSE,
    }
    socketConnection.send(message)
  }

  const sendVideoTrackPosition = (timeElapsed = 0) => {
    if (!socketConnection) return
    const message = {
      attendeeId: userDetails?.id,
      type: socketActions.VIDEO_TRACK_POSITION,
      payload: {
        timeElapsed
      }
    }
    allVideosReadyState.startWaitingForClientResponses()
    socketConnection.send(message)
  }

  const sendHostVideoPosition = (timeElapsed = 0) => {
    if (!socketConnection) return
    const message = {
      attendeeId: userDetails?.id,
      type: socketActions.VIDEO_HOST_POSITION,
      payload: {
        timeElapsed
      }
    }
    socketConnection.send(message)
  }

  const sendVideoClientReady = () => {
    if (!socketConnection) return
    const message = {
      attendeeId: userDetails?.id,
      type: socketActions.VIDEO_CLIENT_READY,
      payload: {
        userDetails: userDetails
      }
    }
    socketConnection.send(message)
  }

  const sendVideoReadyPlay = () => {
    if (!socketConnection) return
    const message = {
      attendeeId: userDetails?.id,
      type: socketActions.VIDEO_READY_PLAY,
    }
    socketConnection.send(message)
  }

  const sendAudioEnabled = () => {
    if (!socketConnection) return
    const message = {
      attendeeId: userDetails?.id,
      type: socketActions.AUDIO_ENABLED,
    }
    socketConnection.send(message)
  }

  const getNewOrStoredMeetingAttendee = (userAlias, storedUserDetails, userId) => new Promise<VirtualMeetingAttendeeType & { userAlias?: UserAliasType}>((resolve, reject) => {
    const userDetailsFromStorage = storedUserDetails[meetingId] || false
    if (!userId && userDetailsFromStorage) {
      virtualMeetingAttendeeResource.findOne(userDetailsFromStorage.id, token.injectToken({
        fields: {
          'virtual-meeting-attendees': 'jitsi-jwt,jwt,attendee-status'
        }
      }))
      .then((jwtResponse) => {
        return resolve({
          ...userDetailsFromStorage,
          ...jwtResponse
        })
      })
    } else {
      return resolve(virtualMeetingAttendeeResource.createResource({
        'name': userAlias.name,
        'label': userAlias.label,
        'virtual-meeting': { id: meetingId },
      }, token.injectToken()))
    }
  })

  const createMeetingAttendee = (userAlias, userId) => new Promise<CreateMeetingAttendeeType>((resolve, reject) => {
    const storedUserDetails = safeLocalStorage.getItemWithExpiration(USER_DETAILS_STORAGE_KEY) || {}
    getNewOrStoredMeetingAttendee(userAlias, storedUserDetails, userId)
    .then((response) => {
      if (!userId) {
        const updateStorage = {
          ...storedUserDetails,
          [meetingId]: {
            ...response,
            userAlias
          }
        }
        safeLocalStorage.setItemWithExpiration(USER_DETAILS_STORAGE_KEY, updateStorage, USER_DETAILS_EXPIRATION_MINUTES)
      }
      const rememberedAttendees = (safeLocalStorage.getItemWithExpiration(EXISTING_ATTENDEES_STORAGE_KEY) || {})[meetingId] || []
      if (rememberedAttendees.includes(response.id)) {
        setExistingAttendee(true)
      } else {
        const allExistingUsers = {
          [meetingId]: [
            ...rememberedAttendees,
            response.id
          ]
        }
        safeLocalStorage.setItemWithExpiration(EXISTING_ATTENDEES_STORAGE_KEY, allExistingUsers, USER_DETAILS_EXPIRATION_MINUTES)
      }
      setUserDetails({
        id: response.id,
        name: response.userAlias?.name || userAlias?.name,
        label: response.userAlias?.label || userAlias?.label,
        attendeeType: response['attendee-type'],
      })
      const savedToken = token.attendeeSocketToken() && jwtDecode(token.attendeeSocketToken()) || {}
      if (jwtDecode(response.jwt).sub !== savedToken.sub) {
        token.setAttendeeSocketToken(response.jwt)
      }
      resolve({ userStatus: response['attendee-status'] })
    })
    .catch((error) => {
      console.error("createMeetingAttendee -> error", error)
      /* logged in User is not allowed - not a registered attendee? */
      reject(error)
    })

    virtualChatMessagesResource.findAll(token.injectToken({
      include: 'attendee',
      fields: {
        'virtual-meeting-chat-messages': 'body,attendee',
        'virtual-meeting-attendees': 'name,label,attendee-type'
      },
      'filter[virtual-meeting]': meetingId,
    })).then((response) => {
      setChatMessages(response)
    })
  })

  return {
    chatMessages,
    createMeetingAttendee,
    existingAttendee,
    isHost,
    loadPresentationMedia,
    meetingAttendees,
    meetingId,
    meetingIsLive,
    newMessageCount,
    presentationPdf,
    presentationVideo,
    resetNewMessageCount: () => setNewMessageCount(0),
    sendHostVideoPosition,
    sendPdfPageNumber,
    sendVideoClientReady,
    sendVideoPause,
    sendVideoReadyPlay,
    sendVideoTrackPosition,
    setMeetingIsLive,
    sendAudioEnabled,
    userDetails,
    USER_DETAILS_STORAGE_KEY,
  }
}

export default useSockets


