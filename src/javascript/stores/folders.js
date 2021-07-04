import { EventEmitter } from 'events'
import Dispatcher from 'javascript/dispatcher'
import pluralize from 'pluralize'

class FoldersStore extends EventEmitter {

  constructor(props) {
    super(props)
    this.resources = [{
      name: 'My',
      id: 'my',
      global: false,
      lists: []
    },{
      name: 'Global',
      id: 'global',
      global: true,
      lists: []
    }]
  }

  getResources(theme) {
    return this.resources.map((folder) => this.addLocalisation(folder, theme))
  }

  addLocalisation = (folder, theme) => ({
    ...folder,
    localizedName: `${folder.name} ${pluralize(theme.localisation.list.upper)}`,
    localizedId: `${folder.id}-${theme.variables.SystemPages.list.path}`,
  })

  getResource(urlSlug, theme) {
    const idFromSlug = urlSlug.split('-')[0]
    const folder =  this.resources.find(({id}) => id === idFromSlug)
    return this.addLocalisation(folder, theme)
  }

  handleActions(action) {
    switch(action.type){
      case 'RECEIVED_FOLDER': {
        this.resources.find(({id}) => id === action.folder.id).lists = action.resources
        this.emit('change')
        break
      }
    }
  }

}

const store = new FoldersStore
Dispatcher.register(store.handleActions.bind(store))
export default store