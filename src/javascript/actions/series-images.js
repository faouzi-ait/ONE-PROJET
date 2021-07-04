import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/series-images'

class SeriesImageApiActions {
  imagesUploaded() {
    Dispatcher.dispatch({
      type: 'IMAGES_UPLOADED'
    })
  }
  imageDeleted() {
    Dispatcher.dispatch({
      type: 'IMAGE_DELETED'
    })
  }
  error(errors) {
    Dispatcher.dispatch({
      type: 'IMAGES_ERROR',
      errors: errors
    })
  }
}

API.actions = new SeriesImageApiActions

class SeriesImageViewActions {
  constructor() {
    this.API = API
  }
  uploadImages(resource, id) {
    this.API.uploadImages(resource, id)
  }
  deleteImage(id, index) {
    this.API.deleteImage(id, index)
  }
}

const actions = new SeriesImageViewActions
export default actions
