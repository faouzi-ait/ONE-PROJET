import API from 'javascript/services/marketing-categories'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class MarketingCategoryApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'MARKETING_CATEGORY'
  }
}

API.actions = new MarketingCategoryApiActions

class MarketingCategoryViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'MARKETING_CATEGORY'
    this.API = API
  }
}

const actions = new MarketingCategoryViewActions
export default actions