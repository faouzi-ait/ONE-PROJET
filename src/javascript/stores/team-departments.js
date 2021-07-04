import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class TeamDepartmentsStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'TEAM_DEPARTMENT'
    })
  }

}

const store = new TeamDepartmentsStore
Dispatcher.register(store.handleActions.bind(store))
export default store
