import { EventEmitter } from 'events'
import pluralize from 'pluralize'

export type StoreErrors = {
  [type: string]: any
}

type ResourceArray<ResourceType> = ResourceType[] & { links?: any; meta?: any }

export default class StoreHelper<ResourceType extends { id: any }> extends EventEmitter {
  resources: ResourceArray<ResourceType>
  resource: ResourceType
  errors: StoreErrors

  getDataResource: (id?: any) => ResourceType
  getDataResources: (ids?: any[]) => ResourceType[]

  constructor(props) {
    // @ts-ignore
    super(props)
    this.resources = null
    this.resource = null
    this.errors = null

    this[`${props.resourceName}_ERROR`] = action => {
      this.errors = action.errors
      this.emit('error')
    }

    this[`RECEIVED_${pluralize(props.resourceName)}`] = action => {
      this.resources = action.resources
      this.emit('change')
    }

    this[`RECEIVED_${props.resourceName}`] = action => {
      this.resource = action.resource
      this.emit('change')
    }

    this[`CREATED_${props.resourceName}`] = action => {
      this.resources = this.resources || []
      this.resources.unshift(action.resource)
      if (!this.resources.meta || !this.resources.meta['record-count']) {
        this.resources.meta = {
          ...(this.resources.meta || {}),
          'record-count': 0
        }
      }
      this.resources.meta['record-count'] += 1
      this.emit('change')
    }

    this[`UPDATED_${props.resourceName}`] = action => {
      this.resources = (this.resources || []).map(resource => {
        if (resource.id !== action.resource.id) {
          return resource
        }
        return {
          ...resource,
          ...action.resource,
        }
      })

      this.resource = {
        ...(this.resource || {}),
        ...action.resource,
      }
      this.emit('change')
    }

    this[`UPDATED_${props.resourceName}_POSITION`] = action => {
      this.resources = (this.resources || []).map(resource => {
        if (resource.id !== action.resource.id) {
          return resource
        }
        return {
          ...resource,
          ...action.resource,
        }
      })

      this.resource = {
        ...(this.resource || {}),
        ...action.resource,
      }
      this.emit('positionChange')
    }

    this[`DELETED_${props.resourceName}`] = action => {
      if (this.resources) {
        const resources: ResourceArray<ResourceType> = this.resources.filter(
          ({ id }) => id !== action.resource.id,
        )
        resources.links = this.resources.links || {}
        resources.meta = this.resources.meta || {}
        this.resources = resources
        if (!this.resources.meta['record-count']) {
          this.resources.meta['record-count'] = 0
        }
        if (this.resources.meta['record-count'] > 0) {
          this.resources.meta['record-count'] -= 1
        }
      }
      this.emit('change')
    }

    this[`RECEIVED_RELATIONSHIP_${pluralize(props.resourceName)}`] = action => {
      this.resources = action.resources
      this.emit('change')
    }

    this[`RECEIVED_NESTED_${pluralize(props.resourceName)}`] = action => {
      this.resources = action.nestedResources
      this.emit('nestedChange')
    }

    // New Data Format
    let resources = []
    let lastUpdatedResource = -1
    let lastUpdatedResources = []

    function updateResource(resource) {
      const index = resources.findIndex(a => a.id === resource.id)
      if (index > -1) {
        resources[index] = {
          ...resources[index],
          ...resource,
        }
      } else {
        resources = [...resources, resource]
      }
    }

    this[`RECEIVED_${props.resourceName}_DATA`] = ({ resource }) => {
      updateResource(resource)
      lastUpdatedResource = resource.id
      this.emit('dataChange')
    }

    this[`RECEIVED_${pluralize(props.resourceName)}_DATA`] = ({
      resources,
    }) => {
      lastUpdatedResources = []
      resources.map(resource => {
        updateResource(resource)
        lastUpdatedResources.push(resource.id)
      })
      this.emit('dataChange')
    }

    this.getDataResource = (id = lastUpdatedResource) => {
      return resources.find(a => a.id === id)
    }

    this.getDataResources = (ids = lastUpdatedResources) => {
      if(ids){
        return resources.filter(a => ids.includes(a.id))
      } else {
        return resources
      }
    }
  }

  getResources() {
    return this.resources
  }

  getResource() {
    return this.resource
  }

  unsetResource() {
    this.resource = null
    return this
  }

  unsetResources() {
    this.resources = null
    return this
  }

  getErrors() {
    return this.errors
  }

  handleActions(action) {
    if (this[action.type]) {
      this[action.type](action)
    }
  }
}
