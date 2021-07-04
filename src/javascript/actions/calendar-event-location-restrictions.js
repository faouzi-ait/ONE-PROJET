import API from 'javascript/services/calendar-event-location-restrictions'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class LocationRestrictionsApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LOCATION_RESTRICTION'
  }
}

API.actions = new LocationRestrictionsApiActions

class LocationRestrictionsViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LOCATION_RESTRICTION'
    this.API = API
  }
}

const actions = new LocationRestrictionsViewActions
export default actions
