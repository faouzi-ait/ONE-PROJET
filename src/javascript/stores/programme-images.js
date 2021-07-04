import { EventEmitter } from 'events'
import Dispatcher from 'javascript/dispatcher'

class ProgrammeImagesStore extends EventEmitter {

  constructor(props) {
    super(props)
    this.errors = null
  }

  getErrors() {
    return this.errors
  }

  handleActions(action) {
    switch (action.type) {
      case 'IMAGES_ERROR': {
        this.errors = action.errors
        this.emit('error')
        break
      }
      case 'IMAGES_UPLOADED': {
        this.emit('imagesUploaded')
        break
      }
    }
  }

}

const store = new ProgrammeImagesStore
Dispatcher.register(store.handleActions.bind(store))
export default store





