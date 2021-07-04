import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class MeetingsNotesStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'MEETING_NOTE'
    })
  }

}

const store = new MeetingsNotesStore
Dispatcher.register(store.handleActions.bind(store))
export default store
