import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class GenreFilterStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'GENRE_FILTER'
    })
  }
}

const store = new GenreFilterStore
Dispatcher.register(store.handleActions.bind(store))
export default store
