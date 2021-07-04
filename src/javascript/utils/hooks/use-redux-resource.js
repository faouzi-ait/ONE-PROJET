/*
*   @Params
*     resourceName: <string> must be provided
*     reduxKey: <string> must be provided
*     providedRelation: <object> optional - used to map state in redux - i.e. by objectId and relation keys
*                 Format: {
*                   name: <string>
*                   id: <number>
*                 }
*/

import useReduxState from 'javascript/utils/hooks/use-redux-state'
import resourceHandlers from 'javascript/utils/helper-functions/state-helpers'
import useResource from 'javascript/utils/hooks/use-resource'

const useReduxResource = (resourceName, reduxKey, providedRelation) => {

  // providedRelation - can be null
  const relation = providedRelation ? providedRelation : { name: 'default', id: 0 }

  const reduxState = useReduxState({
    key: reduxKey,
    initialState: Object.assign({}, resourceHandlers.initialState),
    actions: Object.assign({}, resourceHandlers.actions),
    selectors: Object.assign({}, resourceHandlers.selectors)
  })

  const apiResource = useResource(resourceName)

  const findAll = (queryParams) => {
    const updateState = (response) => reduxState.setResources({ resources: response, relation })
    return apiResource.findAll(queryParams, updateState)
  }


  const findOne = (id, queryParams) => {
    const updateState = (response) => reduxState.setResource(response)
    return apiResource.findOne(id, queryParams, updateState)
  }

  const findAllBatch = (pageSize, queryParams) => {
    const updateState = (response) => reduxState.setResources({ resources: response, relation })
    return apiResource.findAllBatch(pageSize, queryParams, updateState)
  }

  const createResource = (resource, params) => {
    const updateState = (response) => {
      reduxState.updateResources({
        relation,
        resourceHook: {
          mutationState: {
            lastAction: 'createResource',
            lastResource: response
          }
        }
      })
    }
    return apiResource.createResource(resource, params, updateState)
  }

  const createRelationships = (relation, resources) => {
    const updateState = ( response ) => { /* Not seen a use case for this yet. Will need implementing as and when */ }
    return apiResource.createRelationships(relation, resources, updateState)
  }

  const updateResource = (resource) => {
    const updateState = (response) => {
      reduxState.updateResources({
        relation,
        resourceHook: {
          mutationState: {
            lastAction: 'updateResource',
            lastResource: response
          }
        }
      })
    }
    return apiResource.updateResource(resource, updateState)
  }

  const deleteResource = (resource) => {
    const updateState = (response) => {
      reduxState.updateResources({
        relation,
        resourceHook: {
          mutationState: {
            lastAction: 'deleteResource',
            lastResource: resource
          }
        }
      })
    }
    return apiResource.deleteResource(resource, updateState)
  }

  const deleteRelationships = (relation, resources) => {
    const updateState = ( response ) => { /* Not seen a use case for this yet. Will need implementing as and when */ }
    return apiResource.deleteRelationships(relation, resources, updateState)
  }

  const findAllFromOneRelation = (relation, queryParams) => {
    const updateState = (response) => reduxState.setResources({ resources: response, relation })
    return apiResource.findAllFromOneRelation(relation, queryParams, updateState)
  }

  const findOneFromOneRelation = (relation, queryParams) => {
    const updateState = (response) => reduxState.setResources({ resources: response, relation })
    return apiResource.findOneFromOneRelation(relation, queryParams, updateState)
  }

  const findAllFromOneRelationBatch = (pageSize, relation, queryParams) => {
    const updateState = (response) => reduxState.setResources({ resources: response, relation })
    return apiResource.findAllFromOneRelationBatch(pageSize, relation, queryParams, updateState)
  }

  const findAllAndAllRelations = (relation, queryParams) => {
    const updateState = (response) => reduxState.setResources({ resources: response, relation })
    return apiResource.findAllAndAllRelations(relation, queryParams, updateState)
  }

  const findOneAndAllRelations = (relation, queryParams) => {
    const updateState = (response) => reduxState.setResources({ resources: response, relation })
    return apiResource.findOneAndAllRelations(relation, queryParams, updateState)
  }

  const getReduxResources = () => {
    return reduxState.getResourcesArray(relation)
  }

  const getReduxResource = (id) => {
    return reduxState.getResource(id)
  }

  const unsetReduxResources = () => {
    reduxState.unsetResources({...resourceHandlers.initialState})
  }

  const exposeApiResource = {
    ...apiResource
  }
  delete exposeApiResource.getDataById // remove - should not be accessing localState on redux resource
  delete exposeApiResource.getDataAsArray // remove - should not be accessing localState on redux resource

  return {
    ...exposeApiResource,
    findAll,
    findOne,
    findAllBatch,
    createResource,
    createRelationships,
    updateResource,
    deleteResource,
    deleteRelationships,
    findAllFromOneRelation,
    findOneFromOneRelation,
    findAllFromOneRelationBatch,
    findAllAndAllRelations,
    findOneAndAllRelations,
    getReduxResource,
    getReduxResources,
    unsetReduxResources,
  }
}

export default useReduxResource
