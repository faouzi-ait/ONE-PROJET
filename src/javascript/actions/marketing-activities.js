import API from 'javascript/services/marketing-activities'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class MarketingActivityApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'MARKETING_ACTIVITY'
  }
}

API.actions = new MarketingActivityApiActions

class MarketingActivityViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'MARKETING_ACTIVITY'
    this.API = API
  }
}

const actions = new MarketingActivityViewActions
export default actions