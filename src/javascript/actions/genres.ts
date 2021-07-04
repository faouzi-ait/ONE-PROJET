import API from 'javascript/services/genres'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'
import { GenreType } from 'javascript/types/ModelTypes'

class GenreApiActions extends ApiHelperActions<GenreType> {
  constructor() {
    super()
    this.resourceName = 'GENRE'
  }
}

API.actions = new GenreApiActions

class GenreViewActions extends ViewHelperActions<GenreType> {
  constructor() {
    super()
    this.API = API
  }
}

const actions = new GenreViewActions
export default actions
