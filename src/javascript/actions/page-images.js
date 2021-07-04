import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/page-images'

class PageImageApiActions {
  imagesUploaded() {
    Dispatcher.dispatch({
      type: 'PAGE_IMAGES_UPLOADED'
    })
  }
  imageProgress(progress) {
    Dispatcher.dispatch({
      type: 'PAGE_IMAGES_PROGRESS',
      progress: progress
    })
  }
  imageDeleted() {
    Dispatcher.dispatch({
      type: 'PAGE_IMAGE_DELETED'
    })
  }
  error(errors) {
    Dispatcher.dispatch({
      type: 'PAGE_IMAGES_ERROR',
      errors: errors
    })
  }
}

API.actions = new PageImageApiActions

class PageImageViewActions {
  constructor() {
    this.API = API
  }
  uploadImages(resources, id) {
    this.API.uploadImages(resources, id)
  }
  patchUploadImages(resources, id) {
    this.API.patchUploadImages(resources, id)
  }
  deleteImage(id) {
    this.API.deleteImage(id)
  }
}

const actions = new PageImageViewActions
export default actions



