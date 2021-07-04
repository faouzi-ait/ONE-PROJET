import API from 'javascript/services/team-members'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'
import Dispatcher from 'javascript/dispatcher'

class TeamMembersApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TEAM_MEMBER'
  }

  imageUploaded = (resource) => {
    Dispatcher.dispatch({
      type: 'TEAM_MEMBER_IMAGE_UPLOADED',
      resource
    })
  }
}

API.actions = new TeamMembersApiActions

class TeamMembersViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TEAM_MEMBER'
    this.API = API
  }

  uploadImage = (id, image) => {
    this.API.uploadImage({ id, image })
  }
}

const actions = new TeamMembersViewActions
export default actions
