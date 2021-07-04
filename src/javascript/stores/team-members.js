import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class TeamMembersStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'TEAM_MEMBER'
    })
  }

  CREATED_TEAM_MEMBER = () => {
    this.emit('update')
  }

  UPDATED_TEAM_MEMBER = () => {
    this.emit('update')
  }

  TEAM_MEMBER_IMAGE_UPLOADED = () => {
    this.emit('imageUploaded')
  }

}

const store = new TeamMembersStore
Dispatcher.register(store.handleActions.bind(store))
export default store
