import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/video-images'

class VideoImageApiActions {
  imagesUploaded() {
    Dispatcher.dispatch({
      type: 'IMAGES_UPLOADED'
    })
  }
  error(errors) {
    Dispatcher.dispatch({
      type: 'IMAGES_ERROR',
      errors: errors
    })
  }
}

API.actions = new VideoImageApiActions

class VideoImageViewActions {
  constructor() {
    this.API = API
  }
  uploadImages(resource, id) {
    this.API.uploadImages(resource, id)
  }
}

const actions = new VideoImageViewActions
export default actions



