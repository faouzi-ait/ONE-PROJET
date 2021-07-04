import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class VideosStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'VIDEO'
    })
  }

  VIDEO_SAVED(){
    this.emit('save')
  }

  VIDEO_PERMISSION_UPDATED(action){ //cannot see this used anywhere (21/07/20) probably wants removing
 	  this.resources = (this.resources || []).map(resource => {
	    if(resource.id !== action.resource.id){
	      return resource
	    }
	    return {
	      ...resource,
        'restricted-users': action.resource['restricted-users'],
        'restricted-companies': action.resource['restricted-companies']
	    }
	  })

	  this.resource = {
	    ...(this.resource || {}),
	    ...action.resource
	  }
  	this.emit('save')
  }
}

const store = new VideosStore
Dispatcher.register(store.handleActions.bind(store))
export default store


