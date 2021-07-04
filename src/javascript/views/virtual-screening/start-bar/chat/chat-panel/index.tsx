import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import useResource from 'javascript/utils/hooks/use-resource'
import useUnregisteredTokenState from 'javascript/views/virtual-screening/use-unregistered-token-state'
import withUser from 'javascript/components/hoc/with-user'
import { tint } from 'polished'

import allClientVariables from './variables'
import { ChatMessage, SocketConnectionType } from 'javascript/views/virtual-screening/use-sockets'
import { UserType } from 'javascript/types/ModelTypes'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'

interface Props {
  socketConn: SocketConnectionType
  user: UserType
}

const ChatPanel: React.FC<Props> = ({
  socketConn,
  user
}) => {
  const [msgTxt, setMsgTxt] = useState('')
  const msgHolderRef = useRef()
  const allMessages: ChatMessage[] = socketConn.chatMessages || []
  const chatMessageResource = useResource('virtual-meeting-chat-message')
  const token = useUnregisteredTokenState(user)
  const [attendeeColors, setAttendeeColors] = useState({})

  const { chatColors } = useClientVariables(allClientVariables)
  useEffect(() => {
    if (msgHolderRef.current) {
      //@ts-ignore
      msgHolderRef.current.scrollTop = msgHolderRef.current.scrollHeight
    }
  }, [allMessages])

  const chatMessagesWrapperClasses = [
    'virtual__chat-messages-wrapper',
    !socketConn.isHost && 'client',
    !socketConn.meetingIsLive && 'full-height'
  ].filter(Boolean).join(' virtual__chat-messages-wrapper--')

  if (!socketConn.meetingIsLive && allMessages.length === 0) {
    return (
      <MessagingDisabled>Messaging is not available before the meeting is started.</MessagingDisabled>
    )
  }

  const allocateAttendeeColor = (index) => {
    if (index >= chatColors.length) {
      return tint(0.5, chatColors[index - chatColors.length])
    }
    return chatColors[index]
  }

  const getAttendeeColor = (id) => {
    if (attendeeColors[id]) {
      return attendeeColors[id]
    }
    const totalAssignedColors = Object.keys(attendeeColors).length
    const index = totalAssignedColors % (chatColors.length * 2)
    const allocatedColor = allocateAttendeeColor(index)
    setAttendeeColors({
      ...attendeeColors,
      [id]: allocatedColor
    })
    return
  }

  const submitMessage = () => {
    if (msgTxt.trim().length) {
      chatMessageResource.createResource({
        'body': msgTxt,
        'virtual-meeting': { id: socketConn.meetingId },
        'attendee': { id: socketConn.userDetails.id }
      }, token.injectToken())
      .then((response) => {
        setMsgTxt('')
      })
    }
  }

  return (
    <>
      <div className={chatMessagesWrapperClasses} ref={msgHolderRef}>
        { allMessages.map((msg: ChatMessage, i) => {
          const color = getAttendeeColor(msg.attendee.id)
          return (
            <div className={'virtual__chat-message'} style={{borderColor: color}}>
              <Author>{msg.attendee.name}</Author>
              <Company>{msg.attendee.label}</Company>
              <div>{msg.body}</div>
            </div>
          )
        })}
      </div>
      {socketConn.meetingIsLive && (
        <div className="virtual__chat-inputs">
          <textarea
            value={msgTxt}
            onChange={({target}) => setMsgTxt(target.value)}
            onKeyDown={(e) => {
              if (e.ctrlKey || e.metaKey) {
                if (String.fromCharCode(e.which).toLowerCase() === 's') {
                  e.preventDefault()
                  submitMessage()
                }
              }
            }}
            className="form__input form__input--textarea"
            maxLength={255}
            autoFocus={true}
          />
          <button
            type="button"
            className="virtual__chat-submit"
            onClick={(e) => submitMessage()}
          >
            Send
          </button>
        </div>
      )}
    </>
  )
}

export default withUser(ChatPanel)

const Author = styled.div`
  font-weight: bold;
  padding-top: 3px;
`

const Company = styled.div`
  text-transform: uppercase;
  font-weight: normal;
  font-size: 10px;
  line-height: 11px;
  color: #d3d3d3;
`

const MessagingDisabled = styled.div`
  text-align: center;
  padding-top: 25px;
`