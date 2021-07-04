import API from 'javascript/services/language-filters'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class LanguageFilterApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LANGUAGE_FILTER'
  }
}

API.actions = new LanguageFilterApiActions

class LanguageFilterViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LANGUAGE_FILTER'
    this.API = API
  }
}

const actions = new LanguageFilterViewActions
export default actions
