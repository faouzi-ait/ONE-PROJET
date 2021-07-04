import API from 'javascript/services/programme-highlight-categories'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'
import { ProgrammeHighlightCategoryType } from 'javascript/types/ModelTypes'

class ProgrammeHighlightCategoryApiActions extends ApiHelperActions<ProgrammeHighlightCategoryType> {
  constructor() {
    super()
    this.resourceName = 'PROGRAMME_HIGHLIGHT_CATEGORY'
  }
}

API.actions = new ProgrammeHighlightCategoryApiActions

class ProgrammeHighlightCategoryViewActions extends ViewHelperActions<ProgrammeHighlightCategoryType> {
  constructor() {
    super()
    this.API = API
  }
}

const actions = new ProgrammeHighlightCategoryViewActions
export default actions

