import pluralize from 'pluralize'
import { ApiHelperActions } from 'javascript/actions/helper';
import jsonApi from 'javascript/utils/api'

export default class APIHelper<ResourceType> {
  jsonApi: any
  actions: ApiHelperActions<ResourceType>
  resourceName: string
  constructor() {
    this.jsonApi = jsonApi
  }

  getResources(query) {
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, query).then((response) => {
      this.actions.receiveResources(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  getResource(id, query) {
    this.jsonApi.find(this.resourceName, id, query).then((response) => {
      this.actions.receiveResource(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  createResource(resource, params) {
    this.jsonApi.create(this.resourceName, resource, params).then((response) => {
      this.actions.resourceCreated(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  deleteResource(resource) {
    this.jsonApi.destroy(this.resourceName, resource.id).then(() => {
      this.actions.resourceDeleted(resource)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  updateResource(resource) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      this.actions.resourceUpdated(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  updateResourcePosition(resource) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      this.actions.resourcePositionUpdated(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  getRelationshipResources(options, query) {
    this.jsonApi.all(options.resourceName).all(options.relationName).get(query).then((response) => {
      this.actions.recievedRelationshipResources(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  getRelationshipResource(options, query) {
    this.jsonApi.one(options.resourceName, options.resourceId).all(options.relationName).get(query).then((response) => {
      this.actions.recievedRelationshipResources(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  getNestedResources(queries) {
    const apiFetches = queries.map((q) => {
      if (q.queryType === 'relationship') {
        return this.jsonApi.one(q.resourceName, q.resourceId).all(q.relationName).get(q.query)
      }
      return this.jsonApi.findAll(pluralize(this.resourceName), q)
    })
    Promise.all(apiFetches).then((responses) => {
      this.actions.recievedNestedResources(responses)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  // New Data Format
  getDataResource(id, query){
    this.jsonApi.find(this.resourceName, id, query).then((response) => {
      this.actions.receiveDataResource(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  getDataResources(query) {
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, query).then((response) => {
      this.actions.receiveDataResources(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  saveResource(resource) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      response.parent = resource.parent
      this.actions.resourceSaved(response)
    }).catch((error) => {
      this.actions.error(error)
    })
  }
}
