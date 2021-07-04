import React from 'react'
import moment from 'moment'
import Form from 'javascript/views/meetings/form'

const NewMeeting = (props) => {
  const { theme } = props
  const meta = {
    title: `${theme.localisation.client} :: New Meeting`,
    meta: {
      description: 'Create a new meeting',
    }
  }

  const slot = props.location.state?.slot || null
  let defaultTime = slot
    ? moment.utc(slot?.date.replace('UTC', ''), 'YYYY-MM-DD HH:mm:ss')
    : moment()
  const slotTime = theme.features.users.meetings.slotTime
  defaultTime = defaultTime.minutes(('0' + Math.ceil(defaultTime.minutes() / slotTime) * slotTime).slice(-2))
  const initialState = {
    resource: {
      critical: false,
      title: '',
      timezone: 'Etc/Greenwich',
      'start-time': '',
      'end-time': '',
      description: '',
      location: '',
      owner: {},
      'calendar-event-location': {},
      'calendar-event': props.location.state?.event ? { id: props.location.state.event.id } : {},
      'meeting-attendees': [],
      'source-list-id': 0,
      'virtual': false,
      'chat-enabled': true,
      'conference': true,
    },
    meetingDate: slot ? moment.utc(slot?.date.replace('UTC', ''), 'YYYY-MM-DD HH:mm:ss') : moment.utc(),
    startTime: defaultTime.format('HH:mm'),
    endTime: defaultTime.add(theme.features.users.meetings.slotTime, 'm').format('HH:mm'),
    errors: {},
    locations: [],
    lists: [],
    type:
      props.location.state && props.location.state.event
        ? 'event'
        : 'meeting',
    times: [],
  }

  return (
    <Form
      isEdit={false}
      initialState={initialState}
      meetingResource={false}
      meta={meta}
    />
  )
}

export default NewMeeting
