import React, { useEffect, useState } from 'react'
import moment from 'moment'

import Form from 'javascript/views/meetings/form'
import MeetingActions from 'javascript/actions/meetings'
import MeetingStore from 'javascript/stores/meetings'

const MeetingsEdit = (props) => {
  const { theme } = props
  const initialState = {
    resource: {
      'id': '',
      'title': '',
      'meeting-attendees': [],
    },
    type: 'meeting',
    lists: [],
    errors: {},
  }

  const [meetingResource, setMeetingResource] = useState({})
  const meta = {
    title: `${theme.localisation.client} :: Edit ${meetingResource.resource?.title || ''}`,
    meta: {
      description: 'Edit Meeting',
    }
  }

  useEffect(() => {
    MeetingStore.on('dataChange', setMeeting)

    MeetingActions.getDataResource(props.match.params.id, {
      include: 'calendar-event,calendar-event-location,calendar-event-meal-slot,owner,list,meeting-attendees',
    })

    return () => {
      MeetingStore.removeListener('dataChange', setMeeting)
    }
  }, [])

  const setMeeting = () => {
    const meeting = MeetingStore.getDataResource(props.match.params.id)
    setMeetingResource({
      resource: {
        ...meeting,
        'start-time': moment.utc(meeting['start-time']),
        'end-time': moment.utc(meeting['end-time']),
        'source-list-id': meeting['source-list-id'].toString(),
      },
      meetingDate: moment.utc(meeting['start-time']),
      startTime: moment.utc(meeting['start-time']).format('HH:mm'),
      endTime: moment.utc(meeting['end-time']).format('HH:mm'),
      type: meeting['is-event-meeting'] ? 'event' : 'meeting',
      meetingLocation: meeting['calendar-event-location'],
      initialCount: meeting['meeting-attendees-count'],
    })
  }

  return (
    <Form
      isEdit={true}
      initialState={initialState}
      meetingResource={meetingResource}
      meta={meta}
    />
  )
}

export default MeetingsEdit
