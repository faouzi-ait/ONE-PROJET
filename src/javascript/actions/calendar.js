import API from 'javascript/services/calendar'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class CalendarApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'CALENDAR'
  }
}

API.actions = new CalendarApiActions

class CalendarViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'CALENDAR'
    this.API = API
  }

  getFirstResource = (query) => {
    this.API.getFirstResource(query)
  }
}

const actions = new CalendarViewActions
export default actions
