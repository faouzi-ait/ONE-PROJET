import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class GenreStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'GENRE'
    })
  }

  CREATED_GENRE = (action) => {
    const parentId = action.resource['parent-id']
    if (parentId) {
      this.resources = this.resources.map(g => {
        if (g.id == parentId) {
          return {
            ...g,
            'sub-genres': [...g['sub-genres'], action.resource]
          }
        } else {
          return g
        }
      })
    } else {
      this.resources.push(action.resource)
    }
    this.emit('save')
  }

  UPDATED_GENRE = (action) => {
    const parentId = action.resource['parent-id']
    if (parentId) {
      this.resources = this.resources.map(g => {
        if (g.id == parentId) {
          return {
            ...g,
            'sub-genres': g['sub-genres'].map(s => {
              if (s.id === action.resource.id) {
                return {
                  ...s,
                  ...action.resource
                }
              } else {
                return s
              }
            })
          }
        } else {
          return g
        }
      })
    } else {
      this.resources = this.resources.map(g => {
        if (g.id === action.resource.id) {
          return {
            ...g,
            ...action.resource,
            'sub-genres': g['sub-genres']
          }
        } else {
          return g
        }
      })
    }
    this.emit('save')
  }

  DELETED_GENRE = (action) => {
    const parentId = action.resource['parent-id']
    if (parentId) {
      this.resources = this.resources.map(g => {
        if (g.id == parentId) {
          return {
            ...g,
            'sub-genres': g['sub-genres'].filter(s => s.id !== action.resource.id)
          }
        } else {
          return g
        }
      })

    } else {
      this.resources = this.resources.filter(g => g.id !== action.resource.id)
    }
    this.emit('delete')
    this.emit('change')
  }

}

const store = new GenreStore
Dispatcher.register(store.handleActions.bind(store))
export default store