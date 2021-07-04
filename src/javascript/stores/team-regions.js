import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class TeamRegionsStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'TEAM_REGION'
    })
  }

}

const store = new TeamRegionsStore
Dispatcher.register(store.handleActions.bind(store))
export default store
