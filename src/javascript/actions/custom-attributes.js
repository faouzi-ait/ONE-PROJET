import API from 'javascript/services/custom-attributes'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class CustomAttributeApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'CUSTOM_ATTRIBUTE'
  }
}

API.actions = new CustomAttributeApiActions

class CustomAttributeViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'CUSTOM_ATTRIBUTE'
    this.API = API
  }

  createAndAssociate(response, attributes, callback) {
    const total = attributes.length
    let count = 0
    if (total < 1) {
      callback()
    }
    attributes.forEach((a,i) => {
      if (!a['custom-attribute-type'].id) {
        return false
      }
      a.related.id = response.id
      this.API.createResource({...a, position: i+1}, () => {
        count++
        if (count === total) {
          callback()
        }
      })
    })
  }

  createOrUpdate(attributes = [], callback) {
    const total = attributes.length
    let count = 0
    if (total < 1) {
      callback()
    }
    attributes.forEach((a,i) => {
      if (!a['custom-attribute-type'].id) {
        count ++
        if (count === total) {
          callback()
        }
        return false
      }
      if (a.id) {
        this.API.updateResource(a, () => {
          count++
          if (count === total) {
            callback()
          }
        })
      } else {
        this.API.createResource({...a, position: i+1}, () => {
          count++
          if (count === total) {
            callback()
          }
        })
      }
    })
  }
}

const actions = new CustomAttributeViewActions
export default actions
