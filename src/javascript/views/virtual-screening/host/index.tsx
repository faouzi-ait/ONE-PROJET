import React, { useEffect, useState, useRef } from 'react'
import moment from 'moment'
import pluralize from 'pluralize'
import styled from 'styled-components'

import 'stylesheets/core/components/virtual.sass'

import compose from 'javascript/utils/compose'
import { createUserAlias } from 'javascript/views/virtual-screening/client'
import socketActions from 'javascript/views/virtual-screening/socket-actions'
import useAllVideosReady from 'javascript/views/virtual-screening/use-all-videos-ready'
import useConferenceState from 'javascript/views/virtual-screening/jitsi/use-conference-state'
import useResource from 'javascript/utils/hooks/use-resource'
import useSockets, { UserStatusType } from 'javascript/views/virtual-screening/use-sockets'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

// Components
import JitsiConference from 'javascript/views/virtual-screening/jitsi/conference'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import PdfPresentation from 'javascript/views/virtual-screening/pdf-presentation'
import RouteLeavingGuard from 'javascript/components/route-leaving-guard'
import SmallScreenMessage from 'javascript/components/small-screen-message'
import VideoPresentation from 'javascript/views/virtual-screening/video-presentation'
import VideoAssetSearch from 'javascript/views/virtual-screening/host/video-asset-search'
import VirtualStartBar from 'javascript/views/virtual-screening/start-bar'

// Types
import { RemoteControlStatusType } from 'javascript/views/virtual-screening/video-presentation'
import { RouteComponentProps } from 'react-router'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import { UserType } from 'javascript/types/ModelTypes'
import { ActiveChatPanelType } from 'javascript/views/virtual-screening/start-bar/chat'

const DEFAULT_WAITING_ROOM_TYPE = 'waiting'
export const KICK_OFFLINE_USER_DELAY_MS = 20000

interface MatchParams {
  id: string
}

interface Props extends RouteComponentProps<MatchParams>, WithPageHelperType {
  theme: ThemeType
  user: UserType
}

const VirtualScreeningHost: React.FC<Props> = ({
  history,
  match,
  modalState,
  pageIsLoading,
  theme,
  user,
}) => {

  const onMessageReceived = (message) => {
    switch(message.type) {
      case socketActions.PDF_PAGE_NUMBER: {
        setPdfPageNumber(message.payload?.pageNumber)
        break;
      }
      case socketActions.VIDEO_CLIENT_READY: {
        allVideosReadyState.receivedClientResponse(message.payload)
        break;
      }
      case socketActions.VIDEO_READY_PLAY: {
        updateRemoteControlStatus({ action: 'play' })
        break;
      }
      case socketActions.MEETING_STARTED_BY_HOST: {
        setMeetingDuration(message.payload['time_elapsed'])
        break;
      }
      case socketActions.MEETING_ENDED_BY_HOST: {
        setMeetingDuration(null)
        setMeetingStopped(true)
        break;
      }
      case socketActions.MEETING_ATTENDEES: {
        updateMeetingAttendees(message.payload?.attendees)
        break;
      }
    }
  }

  const virtualMeetingId = parseInt(match.params.id)
  const virtualMeetingsResource = useResource('virtual-meeting')
  const virtualMeetingAttendeeResource = useResource('virtual-meeting-attendee')
  const [activeChatPanel, setActiveChatPanel] = useState<ActiveChatPanelType>('closed')
  const [bgImage, setBgImage] = useState(null)
  const [meeting, setMeeting] = useState(null)
  const [meetingDuration, setMeetingDuration] = useState(null)
  const [meetingStopped, setMeetingStopped] = useState(false)
  const [meetingStopLoading, setMeetingStopLoading] = useState(false)
  const [pdfPageNumber, setPdfPageNumber] = useState(null)
  const [remoteControlStatus, setRemoteControlStatus] = useState<RemoteControlStatusType>({ action: 'idle' })
  const audioEnabledInterval = useRef(null)

  modalState.watchVariables({
    meetingStopLoading,
  })

  const conferenceState = useConferenceState()
  const socketConn = useSockets(virtualMeetingId as any, true, onMessageReceived)
  const {
    isHost,
    meetingIsLive,
    presentationPdf,
    presentationVideo,
    sendVideoReadyPlay
  } = socketConn

  const allVideosReadyState = useAllVideosReady(sendVideoReadyPlay)
  const updateRemoteControlStatus = (state: RemoteControlStatusType) => {
    setRemoteControlStatus({
      ...state,
      isHost
    })
  }

  useEffect(() => {
    let pdfTimer
    if (presentationPdf) {
      pdfTimer = setInterval(() => socketConn.sendPdfPageNumber(pdfPageNumber), 5000)
    }
    return () => {
      if (pdfTimer) clearInterval(pdfTimer)
    }
  }, [presentationPdf, pdfPageNumber])

  useEffect(() => {
    if (meeting) {
      const hostId = meeting.host['user-id']
      if (parseInt(hostId) !== parseInt(user.id)) {
        return history.push({
          pathname: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}/virtual/${virtualMeetingId}`,
          state: { meeting }
        })
      }
      socketConn.createMeetingAttendee(createUserAlias(user), user?.id)
      .then((response) => {
        pageIsLoading(false)
      })
      handleViewportChange(null)(null)
    }
  }, [user, meeting])

  useEffect(() => {
    virtualMeetingsResource.findOne(virtualMeetingId, {
      include: 'meeting,meeting.source-list,meeting.owner',
      fields: {
        'virtual-meetings': 'meeting,live,title,start-time,finished-at,host,chat-enabled,conference,started-at,time-elapsed,background-image,room-key',
        'meetings': 'source-list',
        'lists': 'name',
        'users': 'first-name,last-name'
      }
    })
    .then((response) => {
      setMeeting({
        ...response,
        'virtual-meeting': {
          id: response.id
        },
      })
      socketConn.setMeetingIsLive(response.live)
      setMeetingDuration(response.live ? getTimeElapsed(response) : null)
      setBgImage(response['background-image'])
    })
  }, [user])

  useEffect(() => {
    if (meetingStopped) {
      setMeetingStopped(false)
      updateAttendeesStatus(socketConn.meetingAttendees.filter((att) => att.attendeeStatus !== 'waiting'), 'waiting')
      .then((response) => {
        modalState.hideModal()
        history.push({
          pathname: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}`,
          state: meeting?.['start-time'] ? {
            date: moment(meeting['start-time']).format('DD/MM/YYYY'),
          } : {},
        })
      })
    }
  }, [meetingStopped])

  const fetchJitsiJwt = (attendeeId) => {
    return virtualMeetingAttendeeResource.findOne(attendeeId, {
      fields: {
        'virtual-meeting-attendees': 'jitsi-jwt'
      }
    })
  }

  let updateMeetingAttendeesTimer
  const updateMeetingAttendees = (attendees) => {
    clearTimeout(updateMeetingAttendeesTimer)
    updateMeetingAttendeesTimer = setTimeout(() => {
      let seatsUsed = 0
      let kickedUsers = 0
      const waitingAttendees = []
      attendees.forEach((attendee) => {
        if (attendee.attendeeStatus === 'active') {
          if (attendee.online) {
            seatsUsed += 1
          } else {
            kickedUsers += 1
            virtualMeetingAttendeeResource.updateResource({
              id: attendee.id,
              'attendee-status': DEFAULT_WAITING_ROOM_TYPE
            })
          }
        } else if (attendee.attendeeStatus !== 'active'
          && attendee.attendeeStatus !== 'host_removed'
          && attendee.attendeeType !== 'host'
          && attendee.online) {
          waitingAttendees.push(attendee)
        }
      })
      const spacesAvailable = theme.features.virtualMeetings.maxAttendees - (seatsUsed - kickedUsers)
      if (spacesAvailable > 0 && waitingAttendees.length) {
        updateAttendeesStatus(waitingAttendees.slice(0, spacesAvailable), 'active')
      }
    }, KICK_OFFLINE_USER_DELAY_MS)
  }

  const updateAttendeesStatus = (attendees, status: UserStatusType) => {
    return Promise.all(attendees.map((attendee, index) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          virtualMeetingAttendeeResource.updateResource({
            id: attendee.id,
            'attendee-status': status
          }).then(resolve).catch(reject)
        }, (index + 1) * 5000)
      })
    }))
  }


  const onStartStopMeeting = (cancelIsLoading = () => {}) => {
    const updateMeetingLiveState = (liveState) => {
      virtualMeetingsResource.updateResource({
        id: virtualMeetingId,
        live: liveState,
        viewport: null
      }).catch((error) => {
        console.error('onStartStopMeeting -> error: (user)', user, '(meeting) ', meeting, '(error) ', error)
      })
    }
    if (meetingIsLive) {
      modalState.showModal(({ state, hideModal }) => {
        const cancelModal = () => {
          hideModal()
          cancelIsLoading()
        }
        const btnClasses = ['button', state.meetingStopLoading && 'loading'].join(' button--')
        return (
          <Modal
            title={`Confirm Meeting Stop`}
            closeEvent={cancelModal}
          >
            <div className="modal__content">
              Stopping this meeting will end the meeting for all attendees and they will have to click to re-join?
              <div className="form__control form__control--actions">
                <button type="button" className="button button--filled" onClick={ cancelModal }>Cancel</button>
                <button type="button" className={ btnClasses }
                  onClick={() => {
                    setMeetingStopLoading(true)
                    updateMeetingLiveState(false)
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </Modal>
        )
      })
    } else {
      updateMeetingLiveState(true)
    }
  }

  const handleOnVideoPlay = (e, currentTime, currentAction) => {
    if (currentAction === 'play') {
      clearInterval(audioEnabledInterval.current)
      updateRemoteControlStatus({action: 'idle'})
      conferenceState.setIsAudioMutedForScreening(true)
    } else {
      socketConn.sendVideoTrackPosition(currentTime)
    }
    
  }

  const handleOnVideoPause = (e, currentAction) => {
    if (currentAction === 'pause') {
      updateRemoteControlStatus({ action: 'idle' })
      socketConn.sendVideoPause()
      conferenceState.setIsAudioMutedForScreening(false)
      clearInterval(audioEnabledInterval.current)
      audioEnabledInterval.current = setInterval(() => {
        socketConn.sendAudioEnabled()
      }, 5000)
    } else {
      updateRemoteControlStatus({ action: 'pause' })
    }    
  }

  const handleOnVideoProgress = (currentTime) => {
    socketConn.sendHostVideoPosition(currentTime)
  }

  const handleViewportChange = (type) => (viewportObj) => {
    updateRemoteControlStatus({ action: 'pause' })
    conferenceState.setIsAudioMutedForScreening(false)
    if (!type) socketConn.loadPresentationMedia(null)
    setTimeout(() => {
      const viewport = !type ? null : {
        type,
        [type]: viewportObj
      }
      virtualMeetingsResource.updateResource({
        id: virtualMeetingId,
        viewport
      })
    }, 200)
  }

  useEffect(() => {
    if (presentationVideo || presentationPdf) {
      setTimeout(() => scroll({ top: 200, behavior: 'smooth' }), 1000)
    }
  }, [presentationPdf, presentationVideo])

  const meetingEnded = Boolean(!meetingIsLive && meeting && meeting['finished-at'] && moment(meeting['finished-at']).isBefore(moment()))
  const bgStyle = {}
  if (bgImage?.url) {
    bgStyle['backgroundImage'] = `url(${bgImage.url})`
  }


  const meetingHasAttendees = (socketConn?.meetingAttendees || []).filter((att) => att.attendeeType !== 'host' && att.attendeeStatus === 'active').length > 0

  return (
    <Meta
      title={`${theme.localisation.client} :: Virtual Screening Host Manager`}
      meta={{
        description: `Virtual Meetings and Video Screenings`,
      }}
    >
      <RouteLeavingGuard
          when={meetingIsLive && meetingHasAttendees}
          renderModal={({
            stay,
            leave,
          }) => (
            <Modal
              title={'Screening in Progress'}
              closeEvent={ stay() }
              titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}
            >
              <div className="modal__content">
                <div>All attendees will be removed from the current session.</div>
                <div style={{paddingBottom: '20px'}}>
                  Are you sure you want to leave?
                </div>
                <div className="grid">
                  <button type="button" className="button " onClick={stay()} >
                    Cancel
                  </button>
                  <button type="button" className="button button--filled" onClick={leave()} >
                    Leave Anyway
                  </button>
                </div>
              </div>
            </Modal>
          )}
        />
      <div className="virtual">
        <div className="virtual__background" style={bgStyle}>
          <div className="virtual__overlay"></div>
        </div>
        <div className="virtual__container">
          <div className="virtual__host" >
            <div className="virtual__host-content">
              <VideoAssetSearch
                selectorProps={{
                  handleViewportChange,
                  meetingIsLive,
                  meetingId: meeting?.meeting?.id,
                  presentationPdf,
                  presentationVideo,
                  listId: meeting?.meeting['source-list']?.id
                }}
              />
              { meetingEnded ? (
                <MeetingEnded>{`This ${theme.localisation.meeting.upper} has already ended.`}</MeetingEnded>
              ) : (
                <div className="virtual__presentation-wrapper">
                  { presentationVideo && (
                    <div
                      className="virtual__presentation virtual__presentation--is-host"
                      data-title={`YOU ARE SCREENING THIS ${theme.localisation.video.lower.toUpperCase()}`}
                    >
                      {presentationVideo &&
                        <button className="virtual__stop-sharing-button" onClick={() => handleViewportChange(null)(null)}>Stop Sharing</button>
                      }
                      <VideoPresentation
                        remoteControl={remoteControlStatus}
                        video={presentationVideo}
                        socketConn={socketConn}
                        videoPlayerEventHandlers={{
                          onVideoPlay: handleOnVideoPlay,
                          onVideoPause: handleOnVideoPause,
                          onVideoProgress: handleOnVideoProgress,
                        }}
                      />
                      {allVideosReadyState.waitingStatus().stillWaiting && (
                        <div className="virtual__sync-loader virtual__sync-loader--small">
                          <div className="loader"></div>
                          <div className="virtual__sync-msg">{`Buffering attendee ${pluralize(theme.localisation.video.lower)}...`}</div>
                        </div>
                      )}
                    </div>
                  )}
                  { presentationPdf &&
                    <PdfPresentation
                      asset={presentationPdf}
                      isHostController={true}
                      socketConn={socketConn}
                      stopSharing={() => handleViewportChange(null)(null)}
                    />
                  }
                </div>
              )}
            </div>
            <JitsiConference meeting={meeting}
              userDetails={socketConn.userDetails}
              status={'host'}
              fetchJitsiJwt={fetchJitsiJwt}
              view={'side-panel'}
            />
          </div>
        </div>
        {/*@ts-ignore */}
        <SmallScreenMessage page="Virtual Meeting Host"/>
        <VirtualStartBar
          activeChatPanel={activeChatPanel}
          onStartStopMeeting={onStartStopMeeting}
          chatEnabled={meeting ? meeting['chat-enabled'] : false}
          setActiveChatPanel={setActiveChatPanel}
          socketConn={socketConn}
          meetingTitle={meeting?.title || ''}
          meetingDuration={meetingDuration}
        />
      </div>
    </Meta>
  )
}

const enhance = compose(
  withPageHelper,
)

export default enhance(VirtualScreeningHost)

const MeetingEnded = styled.div`
  font-size: 1.4rem;
  text-align: center;
  width: 100%;
  padding-top: 130px;
`

export const getTimeElapsed = ({
  'time-elapsed': timeElapsed,
  'started-at': startTime
}) => {
  const now = moment().utc()
  const start = moment(startTime)
  const timeDifference = now.diff(start, 'seconds')
  return timeDifference + timeElapsed
}