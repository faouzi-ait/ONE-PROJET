import API from 'javascript/services/languages'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class LanguageApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LANGUAGE'
  }
}

API.actions = new LanguageApiActions

class LanguageViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LANGUAGE'
    this.API = API
  }
}

const actions = new LanguageViewActions
export default actions
