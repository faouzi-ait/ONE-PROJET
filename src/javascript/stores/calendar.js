import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class CalendarStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'CALENDAR'
    })
  }

}

const store = new CalendarStore
Dispatcher.register(store.handleActions.bind(store))
export default store
