import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ProgrammeAlternativeTitlesStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PROGRAMME_ALTERNATIVE_TITLE'
    })
  }

  CREATED_PROGRAMME_ALTERNATIVE_TITLE = (action) => {
    this.resources = this.resources || []
    this.resources.unshift(action.resource)
    this.emit('save')
  }

  UPDATED_PROGRAMME_ALTERNATIVE_TITLE = (action) => {
      this.resources = (this.resources || []).map(resource => {
        if(resource.id !== action.resource.id){
          return resource
        }
        return {
          ...resource,
          ...action.resource
        }
      })

      this.resource = {
        ...(this.resource || {}),
        ...action.resource
      }
      this.emit('save')
    }

}

const store = new ProgrammeAlternativeTitlesStore
Dispatcher.register(store.handleActions.bind(store))
export default store
