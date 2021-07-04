import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class AssetMaterialStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'ASSET_MATERIAL'
    })
    this.type = 'series'
    this.id = false
    this.requestCount = {
      programmes: 0,
      series: 0
    }
  }

  unsetResources() {
    this.resources = null
  }

  getType() {
    return this.type
  }

  getId() {
    return this.id
  }

  DELETED_ASSET_MATERIALS = (action) => {
    const resources = (this.resources || []).filter(({id}) => !action.resources.includes(id))
    this.resources = resources
    this.emit('delete')
  }

  CREATED_ASSET_MATERIAL = (action) => {
    this.progress = null
    this.resources = this.resources || []
    if (action.resource) {
      this.resources.push(action.resource)
    }
    this.emit('create')
  }

  ASSET_MATERIAL_UPLOAD_PROGRESS = (action) => {
    this.progress = action.percent
    this.emit('progress')
  }

  ASSET_MATERIAL_DOWNLOAD_PROGRESS = (action) => {
    this.progress = action.loaded
    this.emit('progress')
  }

  ASSET_MATERIAL_DOWNLOADED = (action) => {
    this.emit('downloaded')
  }

  ASSET_MATERIAL_SAVED = (action) => {
    this.emit('save')
  }

  ASSET_MATERIAL_MODIFIED = (action) => {
    this.emit('refresh')
  }

  getProgress() {
    return this.progress
  }

  RECEIVED_ASSET_MATERIALS = (action) => {
    if(!action.id) {
      this.resources = action.resources
      this.id = action.id
      this.emit('change')
    } else {
      if(action.requestCount >= this.requestCount[action.id]){
        this.resources = action.resources
        this.id = action.id
        this.requestCount[action.id] = action.requestCount
        this.emit('change')
      }
    }
  }

  RECEIVED_ASSET_MATERIAL = (action) => {
    this.resource = action.resource
    this.emit('singularChange')
  }

  ASSET_MATERIAL_PERMISSION_UPDATED(action){
    this.resources = (this.resources || []).map(resource => {
      if(resource.id !== action.resource.id){
        return resource
      }
      return {
        ...resource,
        'restricted-users': action.resource['restricted-users'],
        'restricted-companies': action.resource['restricted-companies']
      }
    })

    this.resource = {
      ...(this.resource || {}),
      ...action.resource
    }
    this.emit('save')
  }

  UPDATED_ASSET_MATERIAL = (action) => {
    this.resources = (this.resources || []).map(resource => {
      if (resource.id === action.resource.id) {
        resource.name = action.resource.name
        this.resource = resource
      }
      return resource
    })
    this.emit('change')
  }
}

const store = new AssetMaterialStore
Dispatcher.register(store.handleActions.bind(store))
export default store
