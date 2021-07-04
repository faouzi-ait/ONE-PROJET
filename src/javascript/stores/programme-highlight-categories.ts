import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'
import { ProgrammeHighlightCategoryType } from 'javascript/types/ModelTypes'

class ProgrammeHighlightCategoryStore extends StoreHelper<ProgrammeHighlightCategoryType> {
  constructor() {
    super({
      resourceName: 'PROGRAMME_HIGHLIGHT_CATEGORY'
    })
  }

  UPDATED_PROGRAMME_HIGHLIGHT_CATEGORY = (action) => {
    this.emit('resourceUpdated')
  }
}

const store = new ProgrammeHighlightCategoryStore
Dispatcher.register(store.handleActions.bind(store))
export default store