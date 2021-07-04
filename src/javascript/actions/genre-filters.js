import API from 'javascript/services/genre-filters'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class GenreFilterApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'GENRE_FILTER'
  }
}

API.actions = new GenreFilterApiActions

class GenreFilterViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'GENRE_FILTER'
    this.API = API
  }
}

const actions = new GenreFilterViewActions
export default actions
