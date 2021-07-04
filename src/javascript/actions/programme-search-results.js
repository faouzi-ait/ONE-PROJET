import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/programme-search-results'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ProgrammeSearchResultApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME_SEARCH_RESULT'
  }

  saveQuery(query){
    Dispatcher.dispatch({
      type: 'SAVE_PROGRAMME_QUERY',
      query
    })
  }
}

API.actions = new ProgrammeSearchResultApiActions

class ProgrammeSearchResultViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME_SEARCH_RESULT'
    this.API = API
  }

  saveQuery(query){
    API.actions.saveQuery(query)
  }
}

const actions = new ProgrammeSearchResultViewActions
export default actions
