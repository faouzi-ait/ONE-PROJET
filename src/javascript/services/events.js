import axios from 'axios'
import JsFileDownload from 'js-file-download'
import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'

import CalendarEventMealSlotActions from 'javascript/actions/calendar-event-meal-slots'
import CalendarEventOpeningTimeActions from 'javascript/actions/calendar-event-opening-times'
import CalendarEvenLocationActions from 'javascript/actions/calendar-event-locations'

class EventService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'calendar-event'
    this.jsonApi.define('calendar-event', modelData.calendarEvents)
    this.jsonApi.define('calendar-event-location', modelData.calendarEventLocations)
    this.jsonApi.define('calendar-event-meal-slot', modelData.calendarEventMealSlots)
    this.jsonApi.define('calendar-event-opening-time', modelData.calendarEventOpeningTimes)
    this.jsonApi.define('calendar', modelData.calendar)
    this.jsonApi.define('user', modelData.users)
    this.jsonApi.define('calendar-event-location-restriction', modelData.calendarEventLocationRestrictions)
  }

  createResource = (resource) => {
    this.jsonApi.create(this.resourceName, {
      'title': resource.title,
      'start-time': resource['start-time'],
      'end-time': resource['end-time'],
      'timezone': resource.timezone,
      'calendar': resource.calendar,
      'active': resource.active,
      'contact': resource.contact
    }).then(response => {
      let count = 0
      const callback = () => {
        count ++
        if (count === 3) {
          this.actions.resourceCreated(response)
        }
      }
      response['calendar-event'] = response['calendar-event']
      CalendarEventMealSlotActions.createAndAssociate(response, resource, callback)
      CalendarEventOpeningTimeActions.createAndAssociate(response, resource, callback)
      CalendarEvenLocationActions.createAndAssociate(response, resource, callback)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  updateResource = (resource) => {
    this.jsonApi.update(this.resourceName, {
      'id': resource.id,
      'title': resource.title,
      'start-time': resource['start-time'],
      'end-time': resource['end-time'],
      'timezone': resource.timezone,
      'calendar': resource.calendar,
      'active': resource.active,
      'closed': resource.closed,
      'contact': resource.contact
    }).then(response => {
      let count = 0
      const callback = () => {
        count ++
        if (count === 3) {
          this.actions.resourceUpdated(response)
        }
      }
      response['calendar-event'] = response['calendar-event']
      CalendarEventMealSlotActions.createOrUpdate(response, resource, callback)
      CalendarEventOpeningTimeActions.createOrUpdate(response, resource, callback)
      CalendarEvenLocationActions.createOrUpdate(response, resource, callback)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  sendInvites = (resource) => {
    this.jsonApi.update(this.resourceName, resource).then(response => {
      this.actions.resourceUpdated(response)
    }).catch(errors => {
      this.actions.error(errors)
    })
  }

  exportResource(id, ext, type, name){
    axios({
      url: `${apiConfig.apiUrl}/calendar-events/${id}/export.${ext}?export=${type}`,
      method: 'GET',
      headers: injectApiAuthHeaders(apiConfig.headers),
      responseType: 'blob',
      data: {}
    }).then(({data}) => {
      JsFileDownload(data, `${name}.${ext}`)
    })
  }

  generateReport(id, type) {
    return axios({
      url: `${apiConfig.apiUrl}/calendar-events/${id}/report?report=${type}`,
      method: 'GET',
      headers: injectApiAuthHeaders(apiConfig.headers),
      data: {}
    })
  }

  duplicate(id) {
    axios({
      url: `${apiConfig.apiUrl}/calendar-events/${id}/duplicate`,
      method: 'GET',
      headers: injectApiAuthHeaders(apiConfig.headers),
      data: {}
    }).then(() => {
      this.actions.eventDuplicated()
    })
  }
}

const service = new EventService
export default service
