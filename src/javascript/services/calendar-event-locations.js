import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class CalendarEventLocationService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'calendar-event-location'
    this.jsonApi.define('calendar-event-location', modelData.calendarEventLocations)
    this.jsonApi.define('calendar-event', modelData.calendarEvents)
    this.jsonApi.define('calendar-event-location-restriction', modelData.calendarEventLocationRestrictions)
  }

  updateResource(resource, callback) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      this.actions.resourceUpdated(response)
      if (callback) {
        callback()
      }
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  createResource(resource, callback) {
    this.jsonApi.create(this.resourceName, resource).then((response) => {
      this.actions.resourceCreated(response)
      if (callback) {
        callback()
      }
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }
}

const service = new CalendarEventLocationService
export default service
