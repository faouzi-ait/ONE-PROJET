import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/programmes'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ProgrammeApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME'
  }
  recievedResourceFiles(resource) {
    Dispatcher.dispatch({
      type: 'RECEIVED_PROGRAMME_PAGE_FILES',
      resource: resource
    })
  }

  saveQuery(query){
    Dispatcher.dispatch({
      type: 'SAVE_PROGRAMME_QUERY',
      query
    })
  }

  resourceDuplicated(resource){
    Dispatcher.dispatch({
      type: 'PROGRAMME_DUPLICATED',
      resource
    })
  }

  resourceExported() {
    Dispatcher.dispatch({
      type: 'PROGRAMME_EXPORTED'
    })
  }
}

API.actions = new ProgrammeApiActions

class ProgrammeViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME'
    this.API = API
  }

  getResourceFiles(id, query) {
    this.API.getResourceFiles(id, query)
  }

  saveQuery(query){
    API.actions.saveQuery(query)
  }

  updateResource(resource, attributes, talents) {
    this.API.updateResource(resource, attributes, talents)
  }

  createResource(resource, attributes, talents) {
    this.API.createResource(resource, attributes, talents)
  }

  duplicateResource(resource) {
    this.API.duplicateResource(resource)
  }

  exportCSV(fileName){
    this.API.exportCSV(fileName)
  }
}

const actions = new ProgrammeViewActions
export default actions
