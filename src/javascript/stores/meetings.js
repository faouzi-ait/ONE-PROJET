import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class MeetingsStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'MEETING'
    })
  }

  UPDATED_MEETINGS = (action) => {
    this.emit('save')
  }

  MEETING_CHECKED_IN = (action) => {
    this.resource['checked-in'] = action.resource['checked-in']
    this.emit('checkIn')
  }

  DELETED_MEETING = (action) => {
    this.emit('deleted')
  }

}

const store = new MeetingsStore
Dispatcher.register(store.handleActions.bind(store))
export default store
