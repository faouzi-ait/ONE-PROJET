import API from 'javascript/services/episodes'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'
import { EpisodeType } from 'javascript/types/ModelTypes'

class EpisodeApiActions extends ApiHelperActions<EpisodeType> {
  constructor() {
    super()
    this.resourceName = 'EPISODE'
  }
}

API.actions = new EpisodeApiActions

class CompanyViewActions extends ViewHelperActions<EpisodeType> {
  constructor() {
    super()
    this.API = API
  }
}

const actions = new CompanyViewActions
export default actions

