import API from 'javascript/services/custom-attribute-type-filters'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class CustomAttributeTypeFilterApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'CUSTOM_ATTRIBUTE_TYPE_FILTER'
  }
}

API.actions = new CustomAttributeTypeFilterApiActions

class CustomAttributeTypeFilterViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'CUSTOM_ATTRIBUTE_TYPE_FILTER'
    this.API = API
  }
}

const actions = new CustomAttributeTypeFilterViewActions
export default actions
