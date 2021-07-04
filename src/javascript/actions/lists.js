import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/lists'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ListApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST'
  }
  receiveFolder(folder, resources){
    Dispatcher.dispatch({
      type: 'RECEIVED_FOLDER',
      folder, resources
    })
  }
}

API.actions = new ListApiActions

class ListViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST'
    this.API = API
  }

  exportResource(id, type, name){
    this.API.exportResource(id, type, name)
  }

  getFolder(folder, query){
    this.API.getFolder(folder, query)
  }
}

const actions = new ListViewActions
export default actions
