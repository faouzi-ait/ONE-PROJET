import React, { useEffect, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import styled from 'styled-components'

import Icon from 'javascript/components/icon'
import VirtualChatPanel, { ActiveChatPanelType } from 'javascript/views/virtual-screening/start-bar/chat'
import { SocketConnectionType } from 'javascript/views/virtual-screening/use-sockets'
import useConferenceState from 'javascript/views/virtual-screening/jitsi/use-conference-state'


interface Props extends RouteComponentProps {
  activeChatPanel: ActiveChatPanelType
  chatEnabled: boolean
  clientHasInteracted?: boolean
  meetingDuration: number
  meetingTitle: string
  onStartStopMeeting?: () => void
  setActiveChatPanel: (state: ActiveChatPanelType) => void
  socketConn: SocketConnectionType
}

const VirtualStartBar: React.FC<Props> = ({
  activeChatPanel,
  chatEnabled,
  clientHasInteracted,
  history,
  meetingDuration = null,
  meetingTitle,
  onStartStopMeeting = (cancelIsLoading: () => void) => {},
  setActiveChatPanel,
  socketConn,
}) => {

  const conferenceState = useConferenceState()
  const [isLoading, setIsLoading] = useState(false)
  const {
    meetingIsLive,
  } = socketConn
  const startMeetingButtonClasses =  ['virtual__start-button', meetingIsLive && 'meeting-is-live', isLoading && 'loading'].filter(Boolean).join(' virtual__start-button--')

  useEffect(() => {
    setIsLoading(false)
  }, [meetingIsLive])

  useEffect(() => {
    if (activeChatPanel === 'messages') {
      socketConn.resetNewMessageCount()
    }
  }, [activeChatPanel, socketConn.newMessageCount])

  const [currentTime, setCurrentTime] = useState<number>(meetingDuration)
  useEffect(() => {
    if (meetingDuration !== null && currentTime === null) {
      setCurrentTime(meetingDuration)
    } else if (meetingIsLive && currentTime !== null) {
      // setTimeout(() => setCurrentTime((time) => time + 1), 1000)
      // see comment below (no timer implementation currently)
    }
  }, [meetingDuration, currentTime])

  if (!socketConn.isHost && (!meetingIsLive || !clientHasInteracted)) {
    return null
  }

  return (
    <div
      className={['virtual__start-bar', socketConn.isHost && meetingIsLive && 'meeting-is-live'].filter(Boolean).join(' virtual__start-bar--')}
      data-title="YOU ARE SCREENING LIVE"
    >
      <MeetingInfo>
        <MeetingHeading>{meetingTitle}</MeetingHeading>

        { false && meetingIsLive && currentTime !== null && (
            /*
              This is hidden as requires more messaging (STOP_TIMER) from websockets to work. Namely
              tracking of attendees (host in particular) in order to cancel the meeting in the event
              of attendees no longer being present.  Ideally, this time would just be sent through
              websockets. Instead of the current implementation that has each client running its
              own timer. We cannot just make virtual-meeting.live = false when host leaves as this
              stops meetings if host has poor connection.
            */
            <ClockIcon>
              <Icon id={`i-clock`} style={{fill: '#11d42a'}}/>
              <span style={{paddingLeft: '5px'}}>{new Date(currentTime * 1000).toISOString().substr(11, 8)}</span>
            </ClockIcon>
        )}
      </MeetingInfo>
      <StartActions>
        {socketConn.isHost ? (
          <button type="button" className={startMeetingButtonClasses} onClick={() => {
            setIsLoading(true)
            onStartStopMeeting(() => setIsLoading(false))
          }}>
            {meetingIsLive ? 'Stop Meeting' : 'Start Meeting'}
          </button>
        ) : (
          <button type="button" className={startMeetingButtonClasses} onClick={() => {
            history.push('/')
          }}>
            Leave Meeting
          </button>
        )}
        {conferenceState.hasJoinedConference() &&
          <>
            <button type="button"
              className={['virtual__conference-button', conferenceState.isAudioMuted() && 'muted'].filter(Boolean).join(' virtual__conference-button--')}
              onClick={(e) => conferenceState.toggleAudioMuted()}
            >
              <Icon id={`i-microphone${conferenceState.isAudioMuted() ? '-mute' : ''}`} />
            </button>
            <button type="button"
              className={['virtual__conference-button', conferenceState.isVideoMuted() && 'muted'].filter(Boolean).join(' virtual__conference-button--')}
              onClick={(e) => conferenceState.toggleVideoMuted()}
            >
              <Icon id={`i-video${conferenceState.isVideoMuted() ? '-mute' : ''}`} />
            </button>
          </>
        }
      </StartActions>
      <ChatIcons>
        {chatEnabled && (
          <button type="button"
            className={`virtual__chat-icon ${socketConn.newMessageCount ? 'badge' : ''}`}
            {...(socketConn.newMessageCount && {'data-badge-content': socketConn.newMessageCount})}
            onClick={() => setActiveChatPanel(activeChatPanel === 'messages' ? 'closed' : 'messages')}
          >
            <Icon id="i-chat" className="button__icon"/>
          </button>
        )}
        <button type="button" className="virtual__chat-icon virtual__chat-icon--attendees" onClick={() => setActiveChatPanel(activeChatPanel === 'attendees' ? 'closed' : 'attendees')}>
          <Icon id="i-attendees" className="button__icon"/>
        </button>
        <VirtualChatPanel
          chatEnabled={chatEnabled}
          setActiveChatPanel={setActiveChatPanel}
          activeChatPanel={activeChatPanel}
          socketConn={socketConn}
        />
      </ChatIcons>
    </div>
  )
}

export default withRouter(VirtualStartBar)


const StartActions = styled.div`
  width: 300px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`

const MeetingInfo = styled.div`
  padding-left: 20px;
  width: calc(50% - 160px);
`

const MeetingHeading = styled.div`
  font-size: 18px;
  font-weight: bold;
  height: 28px;
  overflow: hidden;
  word-break: break-all;
`

const ChatIcons = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 15px;
  width: calc(50% - 160px);
`

const ClockIcon = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  top: -6px;
`
