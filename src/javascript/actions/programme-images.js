import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/programme-images'

class ProgrammeImageApiActions {
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

API.actions = new ProgrammeImageApiActions

class ProgrammeImageViewActions {
  constructor() {
    this.API = API
  }
  uploadImages(resource, id) {
    this.API.uploadImages(resource, id)
  }
}

const actions = new ProgrammeImageViewActions
export default actions



