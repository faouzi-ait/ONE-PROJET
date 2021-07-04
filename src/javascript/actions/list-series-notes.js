import API from 'javascript/services/list-series-notes'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ListSeriesNotesApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_SERIES_NOTE'
  }
}

API.actions = new ListSeriesNotesApiActions

class ListSeriesNotesActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_SERIES_NOTE'
    this.API = API
  }
}

const actions = new ListSeriesNotesActions
export default actions
