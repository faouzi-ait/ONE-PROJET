import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { capitalize } from 'javascript/utils/generic-tools'

import useConferenceState from 'javascript/views/virtual-screening/jitsi/use-conference-state'
import useTheme from 'javascript/utils/theme/useTheme'
import { updateOneByModel } from 'javascript/utils/apiMethods'
import { UserDetailsType } from 'javascript/views/virtual-screening/use-sockets'
import Icon from 'javascript/components/icon'
import SlideToggle from 'javascript/components/slide-toggle'

interface Props {
  attendees: UserDetailsType[]
  isHost: boolean
}

const AttendeesPanel: React.FC<Props> = ({
  attendees,
  isHost,
}) => {
  const { features } = useTheme()
  const [meetingIsFullWarning, setMeetingIsFullWarning] = useState<number>(-1)
  const { hasJoinedConference } = useConferenceState()
  const displayToggles = isHost && hasJoinedConference()

  useEffect(() => {
    if (meetingIsFullWarning) {
      setTimeout(() => setMeetingIsFullWarning(-1), 2500)
    }
  }, [meetingIsFullWarning])

  const renderAttendeesList = () => {
    const attendeesList = [...attendees].filter(Boolean)
    if (attendeesList?.length) {
      let usedSeats = 0
      return attendeesList
        .map((att) => ({...att, label: att.label || 'N/A' }))
        .sort((a, b) => a.label.localeCompare(b.label))
        .reduce((acc, attendee) => {
          if (attendee.online && attendee.attendeeStatus === 'active') usedSeats += 1
          const attendees = [...acc]
          if (attendees[attendees.length - 1]?.label !== attendee.label) {
            attendees.push({
              ...attendee,
              isHeading: true
            })
          }
          attendees.push(attendee)
          return attendees
        }, [])
        .map((attendee) => {
          const tagClasses = [
            'tag', attendee.attendeeType === 'host' && 'internal'
          ].filter(Boolean).join(' tag--')
          const lockIconStyle = { fill: 'white', paddingLeft:  '5px'}
          let tagType = ''
          if (attendee.attendeeType !== 'user') {
            tagType = capitalize(attendee.attendeeType || '')
            delete lockIconStyle.paddingLeft
          }
          if (attendee.isHeading) {
            return (
              <li key={attendee.id + '_heading'} className="virtual__attendee-company">
                {attendee.label}
              </li>
            )
          }
          return (
            <li key={attendee.id} className="virtual__attendee-item">
              {displayToggles ? (
                <>
                  {attendee.online && attendee.attendeeType !== 'host' ? (
                    <SlideToggle
                      identifier={`inroom_${attendee.id}`}
                      checked={attendee.attendeeStatus === 'active'}
                      onChange={({ target }) => {
                        if (target.checked && usedSeats === features.virtualMeetings.maxAttendees) {
                          return setMeetingIsFullWarning(attendee.id)
                        }
                        updateOneByModel('virtual-meeting-attendee', {
                          id: attendee.id,
                          'attendee-status': target.checked ? 'active' : 'host_removed'
                        })
                      }}
                    />
                  ) : (
                    <HostOnlineStatus online={attendee.online}>&nbsp;</HostOnlineStatus>
                  )}
                </>
              ) : (
                <OnlineStatus online={attendee.online} >&nbsp;</OnlineStatus>
              )}
              {meetingIsFullWarning === attendee.id  ? (
                <FullCapacityWarning>Meeting is at full capacity!</FullCapacityWarning>
              ) : (
                <>
                  {attendee.name}
                  {tagType && <span className={tagClasses} style={{marginLeft: '8px'}}>{tagType}</span>}
                  {displayToggles && attendee.online && attendee.attendeeStatus === 'host_removed' && (
                    <Icon id="i-lock" style={lockIconStyle}/>
                  )}
                </>
              )}
            </li>
          )
        })
    }
    return (
      <NoAttendeeMsg>No Attendees have joined.</NoAttendeeMsg>
    )
  }
  return (
    <AttendeeList>
      {renderAttendeesList()}
    </AttendeeList>
  )
}

export default AttendeesPanel

const AttendeeList = styled.ul`
  list-style: none;
  padding-left: 0px;
  margin-right: 10px;
  height: 80vh;
  overflow-y: auto;
`

const FullCapacityWarning = styled.span`
  color: red;
`

const NoAttendeeMsg = styled.div`
  padding-top: 80px;
  width: 100%;
  text-align: center;
`
const HostOnlineStatus = styled.div<{ online: boolean }>`
  width: 20px;
  height: 10px
  line-height: 12px;
  display: inline-block;
  margin-right: 10px;
  border-radius: 18px;
  background-color: ${({online}) => online ? '#11d42a' : 'red'};
`

const OnlineStatus = styled.div<{ online: boolean }>`
  width: 9px;
  height: 9px
  line-height: 10px;
  display: inline-block;
  margin-right: 10px;
  border-radius: 50%;
  background-color: ${({online}) => online ? '#11d42a' : 'red'};
`