import API from 'javascript/services/programme-search-suggestions'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ProgrammeSearchSuggestionApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME_SEARCH_SUGGESTION'
  }
}

API.actions = new ProgrammeSearchSuggestionApiActions

class ProgrammeSearchSuggestionViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME_SEARCH_SUGGESTION'
    this.API = API
  }
}

const actions = new ProgrammeSearchSuggestionViewActions
export default actions
