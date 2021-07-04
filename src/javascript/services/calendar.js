import axios from 'axios'
import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import apiConfig from 'javascript/config'

class CalendarService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'calendar'
    this.jsonApi.define('calendar', modelData.calendar)
    this.jsonApi.define('meeting', modelData.meetings)
    this.jsonApi.define('user', modelData.users)
    this.jsonApi.define('company', modelData.companies)
    this.jsonApi.define('list', modelData.lists)
    this.jsonApi.define('meeting-note', modelData.meetingNotes)
    this.jsonApi.define('customer', modelData.customers)
    this.jsonApi.define('calendar-event-opening-time', modelData.calendarEventOpeningTimes)
    this.jsonApi.define('calendar-event-location', modelData.calendarEventLocations)
    this.jsonApi.define('meeting-attendee', modelData.meetingAttendees)
  }

  getFirstResource = async (query) => {
    try {
      const response = await axios({
        url: `${apiConfig.apiUrl}/calendars?fields[calendars]=id`,
        method: 'GET',
        headers: {
          ...apiConfig.headers,
        },
      })
      const calendarArr = response.data.data
      if (calendarArr.length) {
        return this.getResource(calendarArr[0].id, query)
      }
      return this.actions.receiveResource(null)
    } catch (err) {
      console.warn("CalendarService -> getFirstResource -> err: ", err)
    }
  }

}

const service = new CalendarService
export default service
