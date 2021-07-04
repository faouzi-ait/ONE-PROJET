import API from 'javascript/services/calendar-event-locations'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class LocationApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LOCATION'
  }
}

API.actions = new LocationApiActions

class LocationViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LOCATION'
    this.API = API
  }

  createAndAssociate(response, resource, callback) {
    const total = resource['calendar-event-locations'].length
    let count = 0
    if (total < 1) {
      callback()
    }
    resource['calendar-event-locations'].forEach(location => {
      location['calendar-event'] = { id: response.id }
      this.API.createResource(location, () => {
        count ++
        if (count === total) {
          callback()
        }
      })
    })
  }

  createOrUpdate(response, resource, callback) {
    const total = resource['calendar-event-locations'].length
    let count = 0
    if (total < 1) {
      callback()
    }
    resource['calendar-event-locations'].forEach(location => {
      if (location.id) {
        this.API.updateResource(location, () => {
          count ++
          if (count == total) {
            callback()
          }
        })
      } else {
        location['calendar-event'] = { id: response.id }
        this.API.createResource(location, () => {
          count ++ 
          if (count === total) {
            callback()
          }
        })
      }
    })
  }
}

const actions = new LocationViewActions
export default actions