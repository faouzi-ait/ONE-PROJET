import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ProgrammeHighlightCategoryService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'programme-highlight-category'
    this.jsonApi.define('programme-highlight-category', modelData.programmeHighlightCategories)
    this.jsonApi.define('programme-highlight', modelData.programmeHighlights)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('genre', modelData.genres)
  }
}

const service = new ProgrammeHighlightCategoryService
export default service
