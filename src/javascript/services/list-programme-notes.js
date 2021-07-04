import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ListProgrammeNotesService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'list-programme-note'
    this.jsonApi.define('list-programme-note', modelData.listProgrammeNotes)
    this.jsonApi.define('list-programme', modelData.listProgrammes)
    // mono-repo: What is this doing? Where is definition coming from.
    // this.jsonApi.define('list-programmes')
  }
}

export default new ListProgrammeNotesService