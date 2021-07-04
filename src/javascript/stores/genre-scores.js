import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class GenreScoreStore extends StoreHelper {
  constructor() {
    super({
      resourceName: 'GENRE_SCORE'
    })
  }
}

const store = new GenreScoreStore
Dispatcher.register(store.handleActions.bind(store))
export default store 
