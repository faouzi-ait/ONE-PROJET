import React, { useEffect, useState, useRef } from 'react'
import moment from 'moment'
import pluralize from 'pluralize'
import styled from 'styled-components'
import queryString from 'query-string'

import compose from 'javascript/utils/compose'
import { requestFullscreen, closeFullscreen } from 'javascript/utils/helper-functions/request-full-screen'
import socketActions from 'javascript/views/virtual-screening/socket-actions'
import useConferenceState from 'javascript/views/virtual-screening/jitsi/use-conference-state'
import useResource from 'javascript/utils/hooks/use-resource'
import useSockets, { UserAliasType, UserDetailsType, UserStatusType } from 'javascript/views/virtual-screening/use-sockets'
import useUnregisteredTokenState from 'javascript/views/virtual-screening/use-unregistered-token-state'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'
import { getTimeElapsed } from 'javascript/views/virtual-screening/host'

// Components
import Icon from 'javascript/components/icon'
import JitsiConference, { ConferenceViewType } from 'javascript/views/virtual-screening/jitsi/conference'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import NameInputForm from 'javascript/views/virtual-screening/client/name-input'
import PdfPresentation from 'javascript/views/virtual-screening/pdf-presentation'
import SmallScreenMessage from 'javascript/components/small-screen-message'
import VideoControls from 'javascript/views/virtual-screening/client/video-controls'
import VideoPresentation from 'javascript/views/virtual-screening/video-presentation'
import VirtualStartBar from 'javascript/views/virtual-screening/start-bar'

// Types
import { ActiveChatPanelType } from 'javascript/views/virtual-screening/start-bar/chat'
import { RemoteControlStatusType } from 'javascript/views/virtual-screening/video-presentation'
import { RouteComponentProps } from 'react-router'
import { WithThemeType } from 'javascript/utils/theme/withTheme'
import { WithUserType } from 'javascript/components/hoc/with-user'

import 'stylesheets/core/components/virtual.sass'

import { KICK_OFFLINE_USER_DELAY_MS } from 'javascript/views/virtual-screening/host'

interface MatchParams {
  id: string
}

interface Props extends RouteComponentProps<MatchParams>, WithPageHelperType, WithThemeType, WithUserType {
}

interface VideoJoinPositionType {
  clientIsJoiningMovingVideo: boolean
  joinAttempt: number
  joinPosition: number
  videoIsTracked: boolean
}

const initialVideoJoinPosition = {
  clientIsJoiningMovingVideo: false,
  joinAttempt: 0,
  joinPosition: 0,
  videoIsTracked: false
}

const VirtualScreeningClient: React.FC<Props> = ({
  history,
  location,
  match,
  pageIsLoading,
  pageReceivedError,
  modalState,
  theme,
  user,
}) => {

  const onMessageReceived = (message) => {
    switch(message.type) {
      case socketActions.PDF_PAGE_NUMBER: {
        setJitsiView('cinema')
        setPdfControlledPageNumber(message.payload?.pageNumber)
        break;
      }
      case socketActions.VIDEO_LOAD: {
        setJitsiView('cinema')
        setHostHasPlayingVideo(0)
        setClientRecievedPlayCommand(false)
        /* clientRecievedPlayCommand - is used for keeping tabs on wether a client was in the meeting at the beginning of the meeting.
           i.e. do not need to run auto-sync from the off
        */
        break;
      }
      case socketActions.VIDEO_PAUSE: {
        updateRemoteControlStatus({ action: 'pause' })
        break;
      }
      case socketActions.VIDEO_TRACK_POSITION: {
        updateRemoteControlStatus({ action: 'trackTime', payload: message.payload?.timeElapsed || 0})
        break;
      }
      case socketActions.VIDEO_READY_PLAY: {
        setClientRecievedPlayCommand(true)
        updateRemoteControlStatus({ action: 'play' })
        break;
      }
      case socketActions.VIDEO_HOST_POSITION: {
        setJitsiView('cinema')
        conferenceState.setIsAudioMutedForScreening(true)
        setHostHasPlayingVideo(message.payload.timeElapsed)
        break;
      }
      case socketActions.VIEWPORT_RESET: {
        resetConferenceView()
        break;
      }
      case socketActions.MEETING_STARTED_BY_HOST: {
        resetConferenceView()
        setMeetingDuration(message.payload['time_elapsed'])
        break;
      }
      case socketActions.MEETING_ENDED_BY_HOST: {
        resetConferenceView()
        setMeetingDuration(null)
        break;
      }
      case socketActions.MEETING_ATTENDEES: {
        setUpdatedMeetingAttendees(message.payload?.attendees)
        break;
      }
      case socketActions.AUDIO_ENABLED: {
        setAudioEnabled(true)
        break;
      }
    }
  }

  const resetConferenceView = () => {
    setJitsiView((currentView) => {
      return 'conference'
    })
    conferenceState.setIsAudioMutedForScreening(false)
  }

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  const virtualMeetingId = parseInt(match.params.id)
  const virtualMeetingsResource = useResource('virtual-meeting')
  const virtualMeetingAttendeeResource = useResource('virtual-meeting-attendee')
  const [activeChatPanel, setActiveChatPanel] = useState<ActiveChatPanelType>('closed')
  const [bgImage, setBgImage] = useState(null)
  const [clientHasInteracted, setClientHasInteracted] = useState(false)
  const [clientRecievedPlayCommand, setClientRecievedPlayCommand] = useState(false)
  const [clientVideoPosition, setClientVideoPosition] = useState(0)
  const [forceClientVideoInteraction, setForceClientVideoInteraction] = useState({ showPrompt: false, hasContinued: false})
  const [displayMaxCapacityMsg, setDisplayMaxCapacityMsg] = useState<boolean>(false)
  const [hostHasPlayingVideo, setHostHasPlayingVideo] = useState(0)
  const [jitsiView, setJitsiView] = useState<ConferenceViewType>('conference')
  const [maxCapacityTimer, setMaxCapacityTimer] = useState<any>()
  const [meeting, setMeeting] = useState(null)
  const [meetingDuration, setMeetingDuration] = useState(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [pdfControlledPageNumber, setPdfControlledPageNumber] = useState(1)
  const [remoteControlStatus, setRemoteControlStatus] = useState<RemoteControlStatusType>({ action: 'idle' })
  const [userAlias, setUserAlias] = useState<UserAliasType>(null)
  const [updatedMeetingAttendees, setUpdatedMeetingAttendees] = useState<UserDetailsType[]>([])
  const [userStatus, setUserStatus] = useState<UserStatusType>(null)
  const [audioEnabled, setAudioEnabled] = useState(false)

  const conferenceState = useConferenceState()
  const socketConn = useSockets(virtualMeetingId as any, false, onMessageReceived)
  const {
    isHost,
    meetingIsLive,
    presentationPdf,
    presentationVideo,
    userDetails
  } = socketConn

  const fullScreenWrapperRef = useRef<HTMLDivElement>()
  const [volume, setVolume] = useState(0.8)
  const updateRemoteControlStatus = (state: RemoteControlStatusType) => {
    setRemoteControlStatus({
      ...state,
      isHost
    })
  }

  const urlToken = queryString.parse(location.search)['virtual-meeting-token'] as string
  const token = useUnregisteredTokenState(user, urlToken)

  useEffect(() => {
    //componentDidMount
    const exitHandler = () => {
      //@ts-ignore
      if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        setFullscreen(false)
      } else {
        setFullscreen(true)
      }
    }
    document.addEventListener('fullscreenchange', exitHandler)
    document.addEventListener('webkitfullscreenchange', exitHandler)
    document.addEventListener('mozfullscreenchange', exitHandler)
    document.addEventListener('MSFullscreenChange', exitHandler)

    return () => {
      document.removeEventListener('fullscreenchange', exitHandler)
      document.removeEventListener('webkitfullscreenchange', exitHandler)
      document.removeEventListener('mozfullscreenchange', exitHandler)
      document.removeEventListener('MSFullscreenChange', exitHandler)
    }
  }, [])

  useEffect(() => {
    conferenceState.setIsAudioMutedForScreening(false)
  }, [audioEnabled])

  useEffect(() => {
    token.setUrlToken(urlToken)
  }, [urlToken])

  useEffect(() => {
    if (!clientHasInteracted) setPdfControlledPageNumber(1)
  }, [pdfControlledPageNumber])

  useEffect(() => {
    if (meeting) {
      if (user) {
        const hostId = meeting.host['user-id']
        if (parseInt(hostId) === parseInt(user.id)) {
          return history.push({
            pathname: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}/virtual-host/${virtualMeetingId}`,
            state: { meeting }
          })
        } else {
          setUserAlias(createUserAlias(user))
        }
      } else if (!userAlias) {
        const storedUserDetails = safeLocalStorage.getItemWithExpiration(socketConn.USER_DETAILS_STORAGE_KEY) || {}
        const userDetailsFromStorage = storedUserDetails[meeting.id] || false
        if (userDetailsFromStorage && userDetailsFromStorage.userAlias) {
          setUserAlias(userDetailsFromStorage.userAlias)
        } else {
          pageIsLoading(false)
          modalState.showModal(({ hideModal }) => (
            <Modal
              closeButton={false}
              title={'Enter your details'}
              wrapperStyling={{ overflow: 'visible' }}
            >
              <div className="modal__content">
                <NameInputForm labels={meeting.labels || []} onSubmit={(providedAlias) => {
                  pageIsLoading(true)
                  setUserAlias(providedAlias)
                  hideModal()
                }} />
              </div>
            </Modal>
          ))
        }
      }
    }
  }, [user, meeting])

  useEffect(() => {
    fetchMeeting()
  }, [user])

  useEffect(() => {
    updatedMeetingAttendees.forEach((attendee) => {
      if (attendee.id?.toString() === userDetails.id?.toString()) {
        if (attendee.attendeeStatus === 'waiting') {
          setMaxCapacityTimer(setTimeout(() => {
            setDisplayMaxCapacityMsg(true)
          }, KICK_OFFLINE_USER_DELAY_MS + 6000))
        }
        if (userStatus !== 'active' && attendee.attendeeStatus === 'active') {
          clearTimeout(maxCapacityTimer)
          setDisplayMaxCapacityMsg(false)
          setTimeout(() => {
            setUserStatus(attendee.attendeeStatus)
            setActiveStatus()
          }, 1000)
        } else {
          setUserStatus(attendee.attendeeStatus)
        }
      }
    })
  }, [updatedMeetingAttendees])


  /* testing the ability to have a user still view videos/pdf's even when not allowed in conference */
  // useEffect(() => {
  //   if (userStatus === null) return
  //   setMeeting((meeting) => ({
  //     ...meeting,
  //     conference: userStatus === 'active'
  //   }))
  // }, [userStatus])

  const fetchMeeting = () => {
    virtualMeetingsResource.findOne(virtualMeetingId, token.injectToken({
      fields: {
        'virtual-meetings': 'live,title,start-time,host,chat-enabled,conference,finished-at,viewport,time-elapsed,started-at,background-image,token,labels,room-key',
      },
    }))
    .then((response) => {
      if (user && response.token) {
        token.setUrlToken(response.token)
      }
      setMeeting({
        ...response,
        'virtual-meeting': { id: response.id },
      })
      socketConn.setMeetingIsLive(response.live)
      setMeetingDuration(response.live ? getTimeElapsed(response) : null)
      setBgImage(response['background-image'])
      socketConn.loadPresentationMedia(!response.viewport ? null : {
        type: response.viewport.type,
        media: response.viewport[response.viewport.type]
      })
      autoSyncRef.current = {...initialVideoJoinPosition}
    })
    .catch((error) => {
      if (user) {
        pageReceivedError(error)
      } else {
        history.push(`/${theme.variables.SystemPages.login.path}?from=${location.pathname}`)
      }
    })
  }

  useEffect(() => {
    if (userAlias) {
      autoSyncRef.current = {...initialVideoJoinPosition}
      socketConn.createMeetingAttendee(userAlias, user?.id)
      .then((response) => {
        setUserStatus(response.userStatus)
        pageIsLoading(false)
      })
      .catch((error) => {
        pageReceivedError(error)
      })
    }
  }, [userAlias])

  const renderWaitingForMeeting = () => {
    if (meeting && Object.keys(meeting).length && userAlias) {
      const meetingName = meeting.title
      const startTime = moment(meeting['start-time']).utc()
      const finishedTime = moment(meeting['finished-at']).utc()
      const meetingEnded = Boolean(!meetingIsLive && meeting?.['finished-at'] && moment(meeting['finished-at']).isBefore(moment()))
      const time = meetingEnded ? finishedTime : startTime
      const meetingDate = time.format(theme.features.formats.shortDate)
      const meetingTime = time.format('h:mma')
      const meetingText = meetingEnded ? `The host ‘${meeting.host?.name}’ has stopped the meeting` : `Waiting for the host ‘${meeting.host?.name}’ to start the meeting`
      return (
        <WaitingWrapper>
          <MeetingHeading>{meetingName}</MeetingHeading>
          {clientHasInteracted ? (
            <>
              <MeetingText>{meetingText}</MeetingText>
              <MeetingText>
                {`This meeting ${ meetingEnded ? 'ended' : 'is scheduled to start'} on ${meetingDate} at ${meetingTime}`}
              </MeetingText>
            </>
          ) : (
            <>
              <MeetingText>
                {time.format(theme.features.formats.longDate)}
                <MeetingTextDivider>|</MeetingTextDivider>
                {meetingTime}
                <MeetingTextDivider>|</MeetingTextDivider>
                {`Host: ${meeting.host?.name}`}
              </MeetingText>
              <button className="button virtual__join-button" onClick={() => {
                setClientHasInteracted(true)
                updateRemoteControlStatus({ action: 'idle' })
              }}>
                {`${socketConn.existingAttendee ? 'Rejoin' : 'Join'} Meeting`}
              </button>
            </>
          )}
        </WaitingWrapper>
      )
    }
    return null
  }

  const setAutoSync = (state: boolean) => {
    autoSyncRef.current = {
      ...initialVideoJoinPosition,
      clientIsJoiningMovingVideo: state
    } as VideoJoinPositionType
    setForceClientVideoInteraction({ showPrompt: false, hasContinued: false })
  }

  useEffect(() => {
    if (clientRecievedPlayCommand) {
      setAutoSync(false)
      if (!clientHasInteracted) {
        setClientRecievedPlayCommand(false)
      }
    }
    if (clientHasInteracted && !clientRecievedPlayCommand) {
      setAutoSync(true)
    }
  }, [clientRecievedPlayCommand, clientHasInteracted])

  const autoSyncRef = useRef<VideoJoinPositionType>({...initialVideoJoinPosition})

  useEffect(() => {
    if (!meetingIsLive || !clientHasInteracted) return
    let videoJoinPositionThisTick = {}
    let autoSyncVideoIsAligned = false
    if (hostHasPlayingVideo && autoSyncRef.current.clientIsJoiningMovingVideo) {
      const newAttempt = hostHasPlayingVideo > (autoSyncRef.current.joinPosition + 1)
      if (newAttempt) {
        const joinAttempt = autoSyncRef.current.joinAttempt += 1
        videoJoinPositionThisTick = {
          clientIsJoiningMovingVideo: joinAttempt < 8, // if you cannot catch up in a 7 sec gap - stop trying.
          joinAttempt,
          joinPosition: hostHasPlayingVideo + (1 * joinAttempt) + 2,
          videoIsTracked: false
        }
        autoSyncRef.current = videoJoinPositionThisTick as VideoJoinPositionType
      }
      if (autoSyncRef.current.videoIsTracked) {
        /* start video playing */
        autoSyncVideoIsAligned = autoSyncRef.current.joinPosition - hostHasPlayingVideo < 0.51
        if (autoSyncVideoIsAligned) {
          updateRemoteControlStatus({ action: 'play' })
          setAutoSync(false)
        }
      } else {
        /* track video into next position ahead of time */
        if (autoSyncRef.current.joinAttempt > 3) {
          setForceClientVideoInteraction((state) => ({
            ...state,
            showPrompt: true,
          }))
        }
        setClientVideoPosition(autoSyncRef.current.joinPosition)
        updateRemoteControlStatus({ action: 'trackTime', payload:  autoSyncRef.current.joinPosition })
      }
    }
    if (clientVideoPosition && Math.abs(hostHasPlayingVideo - clientVideoPosition) > 1.5) {
      if (!autoSyncRef.current.clientIsJoiningMovingVideo && !autoSyncVideoIsAligned) {
        /* videos out of sync with host. force client to reset video position */
        updateRemoteControlStatus({ action: 'pause' })
        setAutoSync(true)
      }
    }
  }, [hostHasPlayingVideo])

  const handleOnVideoTracked = () => {
    if (autoSyncRef.current.clientIsJoiningMovingVideo) {
      autoSyncRef.current = {
        ...autoSyncRef.current,
        videoIsTracked: true
      }
    } else {
      socketConn.sendVideoClientReady()
    }
  }

  const fetchJitsiJwt = (attendeeId) => {
    return virtualMeetingAttendeeResource.findOne(attendeeId, token.injectToken({
      fields: {
        'virtual-meeting-attendees': 'jitsi-jwt'
      }
    }))
  }

  const setActiveStatus = () => {
    setClientRecievedPlayCommand(false)
    setPdfControlledPageNumber(1)
    updateRemoteControlStatus({action: 'idle'})

    virtualMeetingsResource.findOne(virtualMeetingId, token.injectToken({
      fields: {
        'virtual-meetings': 'viewport',
      },
    }))
    .then((response) => {
      socketConn.loadPresentationMedia(!response.viewport ? null : {
        type: response.viewport.type,
        media: response.viewport[response.viewport.type]
      })
      autoSyncRef.current = {...initialVideoJoinPosition}
    })
  }

  const handleOnVideoPlay = (e, currentTime, currentAction) => {
    conferenceState.setIsAudioMutedForScreening(true)
    if (remoteControlStatus.action === 'play') {
      updateRemoteControlStatus({action: 'idle'})
    }
  }

  const handleOnVideoPause = (e, currentAction) => {
    if (remoteControlStatus.action === 'pause') {
      updateRemoteControlStatus({ action: 'idle' })
    }
    if (remoteControlStatus.action !== 'play') {
      conferenceState.setIsAudioMutedForScreening(false)
    }    
  }

  const displaySafariHelp = () => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={hideModal}
        title={'Troubleshooting'}>
        <div className="modal__content">
          <span>{`If you're having trouble viewing ${pluralize(theme.localisation.video.lower)} in this meeting, follow the steps below to edit your browser video preferences.`}</span>
          <ul>
            <li>Click Safari &gt; Settings for this website. This will bring up a window that allows you to toggle site-specific preferences, including autoplaying videos.</li>
            <li>Click the dropdown next to "Auto-play" and select 'Allow All Auto-Play</li>
          </ul>
          <span>{`You're done! Now you'll be able to view ${pluralize(theme.localisation.video.lower)} shared by the host.`}</span>
        </div>
      </Modal>
    ))
  }

  const renderFullCapacityInfo = () => {
    return (
      <WaitingWrapper>
        {displayMaxCapacityMsg ? (
          <>
            <MeetingText>This meeting has reached capacity, you will be unable to join unless another attendee leaves.</MeetingText>
            {meeting?.['chat-enabled'] && (
              <MeetingText>( You can still contact the host via chat messaging. )</MeetingText>
            )}
          </>
        ) : (
          <MeetingText>Available seats are being assigned, you will join shortly.</MeetingText>
        )}
      </WaitingWrapper>
    )
  }

  const [moveForChatPanel, setMoveForChatPanel] = useState(true)
  const calculateContentWidth = () => {
    const waitForOffsetWidth = () => new Promise<number>((resolveOffsetWidth, rejectOffsetWidth) => {
      const waitForIt = (i = 0) => {
        if (i > 15) return rejectOffsetWidth(0)
        setTimeout(() => {
          const mainTrack = document.getElementsByClassName('jitsi__main-track')?.[0]
          if (mainTrack) {
            //@ts-ignore
            return resolveOffsetWidth(mainTrack?.offsetWidth || 0)
          }
          waitForIt(i + 1)
        }, 800)
      }
      waitForIt()
    })
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    waitForOffsetWidth().then((mainTrackWidth) => {
      if (activeChatPanel === 'closed') {
        setMoveForChatPanel(false)
      } else if (vw - mainTrackWidth > 330) {
        setMoveForChatPanel(false)
      } else {
        setMoveForChatPanel(true)
      }
    })
    .catch(() => setMoveForChatPanel(true))
  }

  useEffect(() => {
    calculateContentWidth()
  }, [activeChatPanel])

  const bgStyle = {}
  if (bgImage?.url) {
    bgStyle['backgroundImage'] = `url(${bgImage.url})`
  }

  return (
    <Meta
      title={`${theme.localisation.client} :: Virtual Screening`}
      meta={{
        description: `Virtual Meetings and Video Screenings`,
      }}
    >
      <div className="virtual__background" style={bgStyle}>
        <div className="virtual__overlay"></div>
      </div>
      <main>
        <div className="virtual__client">
          {(!meetingIsLive || !clientHasInteracted) &&
            <div className="container" style={{ marginTop: '20px' }}>
              {renderWaitingForMeeting()}
            </div>
          }
          {meetingIsLive && clientHasInteracted && (
            <>
              <div className={[
                  'virtual__presentation-wrapper',
                  'virtual__presentation-wrapper--client',
                  moveForChatPanel
                    ? 'virtual__presentation-wrapper--left'
                    : 'virtual__presentation-wrapper--center',
                ].filter(Boolean).join(' ')}
              >
                <JitsiConference meeting={meeting}
                  status={userStatus}
                  fetchJitsiJwt={fetchJitsiJwt}
                  userDetails={socketConn.userDetails}
                  view={jitsiView}
                  waitingRoomMessage={renderFullCapacityInfo}
                >
                  {presentationVideo && (
                    <div className="virtual__presentation-wrapper--video">
                      {isSafari && (
                        <HavingTroubleWrapper>
                          <div className="text-button" onClick={displaySafariHelp}>
                            {`Having trouble viewing ${pluralize(theme.localisation.video.lower)}?`}
                          </div>
                        </HavingTroubleWrapper>
                      )}
                      <div
                        ref={fullScreenWrapperRef}
                        className={`virtual__client-video-wrapper virtual__presentation virtual__presentation--${fullscreen ? 'fullscreen' : 'large'}`}
                      >
                        <VideoPresentation
                          remoteControl={remoteControlStatus}
                          socketConn={socketConn}
                          video={presentationVideo}
                          videoPlayerEventHandlers={{
                            onVideoTracked: handleOnVideoTracked,
                            onVideoPlay: handleOnVideoPlay,
                            onVideoPause: handleOnVideoPause,
                            onVideoProgress: setClientVideoPosition,
                          }}
                          volume={volume}
                        />
                        {/* css sibling rule exists between these two components - virtual.sass (.inline-video + .video-controls) */}
                        <VideoControls
                          volume={volume}
                          onVolumeChanged={setVolume}
                          fullscreen={fullscreen}
                          onFullscreenToggle={(fullscreen) => {
                            fullscreen ? requestFullscreen(fullScreenWrapperRef.current) : closeFullscreen()
                          }}
                        />
                        {autoSyncRef.current?.clientIsJoiningMovingVideo && (
                          <div className="virtual__sync-loader">
                            <div className="virtual__sync-msg">{`Synchronizing with live event...`}</div>
                            {forceClientVideoInteraction.showPrompt && !forceClientVideoInteraction.hasContinued ? (
                              <ContinueButton onClick={() => setForceClientVideoInteraction((state) => ({
                                ...state,
                                hasContinued: true,
                              }))}>
                                <Icon id="i-play"/>
                                <div>Continue</div>
                              </ContinueButton>
                            ) : (
                              <div className="loader"></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  { presentationPdf &&
                    <PdfPresentation
                      asset={presentationPdf}
                      isHostController={socketConn.isHost}
                      remoteControlPageNumber={pdfControlledPageNumber}
                    />
                  }
                  {!meeting?.conference && !presentationVideo && !presentationPdf && userAlias && (
                    <>
                      <WaitingMessage>{`Waiting for your host to share content.`}</WaitingMessage>
                      <div className="loader"/>
                    </>
                  )}
                </JitsiConference>
              </div>
            </>
          )}
          {activeChatPanel !== 'closed' && (
            <div className="virtual__chat-panel-blank"></div>
          )}
          {/*@ts-ignore */}
          <SmallScreenMessage page="Virtual Meeting"/>
        </div>
        <VirtualStartBar
          activeChatPanel={activeChatPanel}
          clientHasInteracted={clientHasInteracted}
          meetingTitle={meeting?.title || ''}
          setActiveChatPanel={setActiveChatPanel}
          socketConn={socketConn}
          chatEnabled={meeting?.['chat-enabled']}
          meetingDuration={meetingDuration}
        />
      </main>
    </Meta>
  )
}

const enhance = compose(
  withPageHelper,
)

export default enhance(VirtualScreeningClient)

const WaitingWrapper = styled.div`
  padding-top: calc(50vh - 115px);
  padding-bottom: 25vh;
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
`

const MeetingHeading = styled.div`
  font-size: 40px;
`

const WaitingMessage = styled.div`
  font-size: 1.4rem;
  text-align: center;
  width: 100%;
  position: relative;
  bottom: 150px;
`

const MeetingText = styled.div`
  font-size: 20px;
  margin-bottom: 15px;
`
const MeetingTextDivider = styled.div`
  display: inline-block;
  padding: 0px 10px;
  font-size: 15px;
  font-weight: bold;
  color: #7a7979;
  margin-bottom: 15px;
`

const ContinueButton = styled.button`
  position: absolute;
  padding: 10px;
  z-index: 20;
  cursor: pointer;
  top: calc(50% - 50px);
  left: calc(50% - 60px);
  font-size: 15px;
  color: white;
  width: 120px;
  background: gray;
  border: 2px solid white;
  border-radius: 5px;
  svg {
    fill: white;
    width: 35px;
    height: 35px;
  }
`

const HavingTroubleWrapper = styled.div`
  position: absolute;
  top: -60px;
  left: calc(50% - 140px);
  width: 280px;
  text-align: center;
`

export const createUserAlias = (user) => ({
  name: `${user['first-name']} ${user['last-name']}`,
  label: user.company?.name || ''
})
