import API from 'javascript/services/data-import'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ImportApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'DATA_IMPORT'
  }
}

API.actions = new ImportApiActions

class ImportViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'DATA_IMPORT'
    this.API = API
  }

  startImportType(type) {
    this.API.startImportType(type)
  }

  startImport() {
    this.API.startImport()
  }

}

const actions = new ImportViewActions
export default actions