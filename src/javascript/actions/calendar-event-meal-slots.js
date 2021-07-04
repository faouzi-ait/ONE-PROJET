import API from 'javascript/services/calendar-event-meal-slots'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class MealSlotApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'MEAL_SLOT'
  }
}

API.actions = new MealSlotApiActions

class MealSlotViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'MEAL_SLOT'
    this.API = API
  }

  createAndAssociate(response, resource, callback) {
    const total = resource['calendar-event-meal-slots'].length
    let count = 0
    if (total < 1) {
      callback()
    }
    resource['calendar-event-meal-slots'].forEach(slot => {
      slot['calendar-event'] = { id: response.id }
      this.API.createResource(slot, () => {
        count ++
        if (count === total) {
          callback()
        }
      })
    })
  }

  createOrUpdate(response, resource, callback) {
    const total = resource['calendar-event-meal-slots'].length
    let count = 0
    if (total < 1) {
      callback()
    }
    resource['calendar-event-meal-slots'].forEach(slot => {
      if (slot.id) {
        this.API.updateResource(slot, () => {
          count ++
          if (count == total) {
            callback()
          }
        })
      } else {
        slot['calendar-event'] = { id: response.id }
        this.API.createResource(slot, () => {
          count ++ 
          if (count === total) {
            callback()
          }
        })
      }
    })
  }
}

const actions = new MealSlotViewActions
export default actions
