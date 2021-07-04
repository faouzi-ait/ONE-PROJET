import Dispatcher from 'javascript/dispatcher'
import pluralize from 'pluralize'
import APIHelper from 'javascript/services/helper'

class ViewHelperActions<ResourceType> {
  API: APIHelper<ResourceType>
  getResources(query) {
    this.API.getResources(query)
  }
  getResource(id, query) {
    this.API.getResource(id, query)
  }
  createResource(resource, params = {}) {
    this.API.createResource(resource, params)
  }
  updateResource(resource: ResourceType) {
    this.API.updateResource(resource)
  }
  updateResourcePosition(resource: ResourceType) {
    this.API.updateResourcePosition(resource)
  }
  saveResource(resource) {
    this.API.updateResource(resource)
  }
  deleteResource(resource) {
    this.API.deleteResource(resource)
  }
  getRelationshipResource(relationship, query) {
    this.API.getRelationshipResource(relationship, query)
  }
  getRelationshipResources(relationship, query) {
    this.API.getRelationshipResources(relationship, query)
  }
  // nested resources - runs multiple server queries (array of results, matches array of queries)
  getNestedResources(queries) {
    this.API.getNestedResources(queries)
  }

  // New Data Format
  getDataResource(id, query){
    this.API.getDataResource(id, query)
  }
  getDataResources(query){
    this.API.getDataResources(query)
  }
}

class ApiHelperActions<ResourceType> {
  resourceName: string
  error(errors) {
    Dispatcher.dispatch({
      type: `${this.resourceName}_ERROR`,
      errors: errors
    })
  }
  receiveResources(resources: ResourceType[]) {
    Dispatcher.dispatch({
      type: `RECEIVED_${pluralize(this.resourceName)}`,
      resources: resources
    })
  }
  receiveResource(resource: ResourceType) {
    Dispatcher.dispatch({
      type: `RECEIVED_${this.resourceName}`,
      resource: resource
    })
  }
  resourceCreated(resource: ResourceType) {
    Dispatcher.dispatch({
      type: `CREATED_${this.resourceName}`,
      resource: resource
    })
  }
  resourceSaved(resource: ResourceType) {
    Dispatcher.dispatch({
      type: `${this.resourceName}_SAVED`
    })
  }
  resourceUpdated(resource: ResourceType) {
    Dispatcher.dispatch({
      type: `UPDATED_${this.resourceName}`,
      resource: resource
    })
  }
  resourcePositionUpdated(resource: ResourceType) {
    Dispatcher.dispatch({
      type: `UPDATED_${this.resourceName}_POSITION`,
      resource: resource
    })
  }
  resourceDeleted(resource: ResourceType) {
    Dispatcher.dispatch({
      type: `DELETED_${this.resourceName}`,
      resource: resource
    })
  }
  recievedRelationshipResources(resources: ResourceType[]) {
    Dispatcher.dispatch({
      type: `RECEIVED_RELATIONSHIP_${pluralize(this.resourceName)}`,
      resources
    })
  }
  recievedNestedResources(nestedResources: unknown) {
    Dispatcher.dispatch({
      type: `RECEIVED_NESTED_${pluralize(this.resourceName)}`,
      nestedResources
    })
  }

  // New Data Format
  receiveDataResource(resource: ResourceType) {
    Dispatcher.dispatch({
      type: `RECEIVED_${this.resourceName}_DATA`,
      resource
    })
  }
  receiveDataResources(resources: ResourceType[]) {
    Dispatcher.dispatch({
      type: `RECEIVED_${pluralize(this.resourceName)}_DATA`,
      resources
    })
  }
}

export {
  ViewHelperActions,
  ApiHelperActions
}
