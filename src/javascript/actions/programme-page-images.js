import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/programme-page-images'

class ProgrammePageImageApiActions {
  imagesUploaded() {
    Dispatcher.dispatch({
      type: 'PROGRAMME_PAGE_IMAGES_UPLOADED'
    })
  }
  imageProgress(progress) {
    Dispatcher.dispatch({
      type: 'PROGRAMME_PAGE_IMAGES_PROGRESS',
      progress: progress
    })
  }
  imageDeleted() {
    Dispatcher.dispatch({
      type: 'PROGRAMME_PAGE_IMAGE_DELETED'
    })
  }
  error(errors) {
    Dispatcher.dispatch({
      type: 'PROGRAMME_PAGE_IMAGES_ERROR',
      errors: errors
    })
  }
}

API.actions = new ProgrammePageImageApiActions

class ProgrammePageImageViewActions {
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

const actions = new ProgrammePageImageViewActions
export default actions



