import API from 'javascript/services/quality-filters'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class QualityFilterApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'QUALITY_FILTER'
  }
}

API.actions = new QualityFilterApiActions

class QualityFilterViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'QUALITY_FILTER'
    this.API = API
  }
}

const actions = new QualityFilterViewActions
export default actions
