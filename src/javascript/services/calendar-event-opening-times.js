import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class CalendarEvenOpeningTimeService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'calendar-event-opening-time'
    this.jsonApi.define('calendar-event-opening-time', modelData.calendarEventOpeningTimes)
    this.jsonApi.define('calendar-event', modelData.calendarEvents)
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

const service = new CalendarEvenOpeningTimeService
export default service
