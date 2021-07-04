import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import AttendeeService from 'javascript/services/meeting-attendees'

class MeetingsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'meeting'
    this.jsonApi.define('meeting', modelData.meetings)
    this.jsonApi.define('user', modelData.users)
    this.jsonApi.define('company', modelData.companies)
    this.jsonApi.define('list', modelData.lists)
    this.jsonApi.define('source-list', modelData.lists)
    this.jsonApi.define('meeting-note', modelData.meetingNotes)
    this.jsonApi.define('customer', modelData.companies)
    this.jsonApi.define('meeting-attendee', modelData.meetingAttendees)
    this.jsonApi.define('calendar-event', modelData.calendarEvents)
    this.jsonApi.define('calendar-event-location', modelData.calendarEventLocations)
    this.jsonApi.define('calendar-event-meal-slot', modelData.calendarEventMealSlots)
  }
  createResource(resource, attendees) {
    AttendeeService.createResources(attendees, (ids) => {
      if (ids.length > 0) {
        resource['meeting-attendees'] = ids
      }
      this.jsonApi.create(this.resourceName, resource).then(() => {
        this.actions.updatedMeetings()
      }).catch((error) => {
        this.actions.error(error)
      })
    })
  }
  updateResource(resource, attendees) {
    AttendeeService.createResources(attendees, (ids) => {
      resource['meeting-attendees'] = ids
      this.jsonApi.update(this.resourceName, resource).then(() => {
        this.actions.updatedMeetings()
      }).catch((error) => {
        this.actions.error(error)
      })
    })
  }
  checkIn(resource) {
    this.jsonApi.update(this.resourceName, resource).then((res) => {
      this.actions.checkedIn(res)
    }).catch((error) => {
      this.actions.error(error)
    })
  }
  search(query, callback) {
    this.jsonApi.findAll('meetings', query).then(callback)
  }
}

const service = new MeetingsService
export default service