import API from 'javascript/services/genre-scores'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class GenreScoreApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'GENRE_SCORE'
  }
}

API.actions = new GenreScoreApiActions

class GenreScoreViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'GENRE_SCORE'
    this.API = API
  }
}

const actions = new GenreScoreViewActions
export default actions