import React from 'react'
import styled from 'styled-components'

import AttendeesPanel from 'javascript/views/virtual-screening/start-bar/chat/attendees-panel'
import ChatPanel from 'javascript/views/virtual-screening/start-bar/chat/chat-panel'
import Icon from 'javascript/components/icon'
import Tabs from 'javascript/components/tabs'

import { SocketConnectionType } from 'javascript/views/virtual-screening/use-sockets'

export type ActiveChatPanelType = 'messages' | 'attendees' | 'closed'
interface Props {
  chatEnabled: boolean
  activeChatPanel: ActiveChatPanelType
  setActiveChatPanel: (state: ActiveChatPanelType) => void
  socketConn: SocketConnectionType
}

const VirtualChatPanel: React.FC<Props> = ({
  activeChatPanel,
  chatEnabled,
  setActiveChatPanel,
  socketConn,
}) => {
  const chatClasses = [
    'virtual__chat',
    activeChatPanel !== 'closed' && 'open',
    socketConn.isHost && 'is-host',
    socketConn.meetingIsLive && 'meeting-is-live',
  ].filter(Boolean).join(' virtual__chat--')

  const renderTabs = () => {
    if (chatEnabled) {
      const activeTab = activeChatPanel === 'messages' ? 0 : 1
      return (
        <Tabs active={activeTab} onChange={({ value }) => {
          setActiveChatPanel(value ? 'attendees' : 'messages')
        }}>
          <div title={'Messages'}>
            <ChatPanel socketConn={socketConn} />
          </div>
          <div title={'Attendees'}>
            <AttendeesPanel attendees={socketConn.meetingAttendees} isHost={socketConn.isHost} />
          </div>
        </Tabs>
      )
    }
    return (
      <div className="virtual__attendee-tab-heading">
        <TabHeadingWrapper>
          <button className="tabs__item tabs__item--active" style={{cursor: 'unset'}}>Attendees</button>
        </TabHeadingWrapper>
        <AttendeesPanel attendees={socketConn.meetingAttendees} isHost={socketConn.isHost}/>
      </div>
    )
  }

  return (
    <div className={chatClasses}>
      <ChatHeader>
        <div style={{marginTop: '8px'}}>
          {renderTabs()}
        </div>
        <button className="modal__close" type="button" onClick={(e) => setActiveChatPanel('closed')} >
          <Icon id="i-close" />
        </button>
      </ChatHeader>
    </div>
  )
}

export default VirtualChatPanel

const ChatHeader = styled.div`
  height: 50px;
  padding-left: 10px;
`

const TabHeadingWrapper = styled.div`
  display: flex;
  justify-content: center;
`

