import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ProgrammeHighlightService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'programme-highlight'
    this.jsonApi.define('programme-highlight', modelData.programmeHighlights)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('programme-highlight-category', modelData.programmeHighlightCategories)

    // mono-repo: Where is this definition coming from? is it used?
    // this.jsonApi.define('user')

  }

  createResource(resource) {
    this.jsonApi.create(this.resourceName, resource).then((response) => {
      this.actions.resourceCreated(response, resource)
    }).catch((error) => {
      this.actions.error(error)
    })
  }
}

const service = new ProgrammeHighlightService
export default service
