import { EventEmitter } from 'events'
import Dispatcher from 'javascript/dispatcher'

class PageImagesStore extends EventEmitter {

  constructor(props) {
    super(props)
    this.errors = null
  }

  getErrors() {
    return this.errors
  }

  getProgress() {
    return this.progress
  }

  handleActions(action) {
    switch (action.type) {
      case 'PAGE_IMAGES_ERROR': {
        this.errors = action.errors
        this.emit('error')
        break
      }
      case 'PAGE_IMAGES_UPLOADED': {
        this.emit('imagesUploaded')
        this.emit('change')
        break
      }
      case 'PAGE_IMAGES_PROGRESS': {
        this.progress = action.progress
        this.emit('progress')
        break
      }
      case 'PAGE_IMAGE_DELETED': {
        this.emit('change')
        break
      }
    }
  }

}

const store = new PageImagesStore
Dispatcher.register(store.handleActions.bind(store))
export default store





