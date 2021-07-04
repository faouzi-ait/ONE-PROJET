import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class VideoDownloadStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'VIDEO_DOWNLOAD_LINK'
    })
  }

  CREATED_VIDEO_DOWNLOAD_LINK = (action) => {
    this.generatedLink = action.resource.uid
    this.emit('generatedLink')
  }

  UPDATED_VIDEO_DOWNLOAD_LINK = (action) => {
    this.resources = (this.resources || []).map(resource => {
      if(resource.id !== action.resource.id){
        return resource
      }
      return {
        ...resource,
        'downloaded-at': action.resource['downloaded-at']
      }
    })
    this.emit('change')
  }

  getGeneratedLink() {
    return this.generatedLink
  }

}

const store = new VideoDownloadStore
Dispatcher.register(store.handleActions.bind(store))
export default store
