import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'
import { SeriesType } from 'javascript/types/ModelTypes'

class SeriesStore extends StoreHelper<SeriesType> {

  constructor() {
    super({
      resourceName: 'SERIES'
    })
  }

  RECEIVED_SERIES = (action) => {
    this.resources = action.resources
    this.emit('change')
  }

  UPDATED_SERIES = (action) => {
    this.emit('save')
  }

  CREATED_SERIES = (action) => {
    this.emit('save')
  }

  RECEIVED_SERIES_BY_ID = (action) => {
    this.resource = action.resource
    this.emit('change')
  }

}

const store = new SeriesStore
Dispatcher.register(store.handleActions.bind(store))
export default store
