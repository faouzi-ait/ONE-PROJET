import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'


class LocationRestrictionsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'calendar-event-location-restriction'
    this.jsonApi.define('calendar-event-location-restriction', modelData.calendarEventLocationRestrictions)
    this.jsonApi.define('calendar-event-location', modelData.calendarEventLocations)
    this.jsonApi.define('user', modelData.users)
  }
}

const service = new LocationRestrictionsService
export default service
