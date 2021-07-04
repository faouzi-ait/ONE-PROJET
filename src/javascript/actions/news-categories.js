import API from 'javascript/services/news-categories'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class NewsCategoriesApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'NEWS_CATEGORY'
  }
}

API.actions = new NewsCategoriesApiActions

class NewsCategoriesViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'NEWS_CATEGORY'
    this.API = API
  }
}

const actions = new NewsCategoriesViewActions
export default actions
