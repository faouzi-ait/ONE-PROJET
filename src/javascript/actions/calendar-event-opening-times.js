import API from 'javascript/services/calendar-event-opening-times'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class OpeningTimeApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'OPENING_TIME'
  }
}

API.actions = new OpeningTimeApiActions

class OpeningTimeViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'OPENING_TIME'
    this.API = API
  }

  createAndAssociate(response, resource, callback) {
    const total = resource['calendar-event-opening-times'].length
    let count = 0
    if (total < 1) {
      callback()
    }
    resource['calendar-event-opening-times'].forEach(time => {
      const create = {
        'calendar-event': { id: response.id },
        'start-time': `${time.date} ${time['start-time']}`,
        'end-time': `${time.date} ${time['end-time']}`
      }
      this.API.createResource(create, () => {
        count ++
        if (count === total) {
          callback()
        }
      })
    })
  }

  createOrUpdate(response, resource, callback) {
    const total = resource['calendar-event-opening-times'].length
    let count = 0
    if (total < 1) {
      callback()
    }
    resource['calendar-event-opening-times'].forEach(time => {
      if (time.id) {
        const create = {
          ...time,
          'start-time': `${time.date} ${time['start-time']}`,
          'end-time': `${time.date} ${time['end-time']}`
        }
        this.API.updateResource(create, () => {
          count ++
          if (count == total) {
            callback()
          }
        })
      } else {
        const create = {
          'calendar-event': { id: response.id },
          'start-time': `${time.date} ${time['start-time']}`,
          'end-time': `${time.date} ${time['end-time']}`
        }
        this.API.createResource(create, () => {
          count ++ 
          if (count === total) {
            callback()
          }
        })
      }
    })
  }
}

const actions = new OpeningTimeViewActions
export default actions
