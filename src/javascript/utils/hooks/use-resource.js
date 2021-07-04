import { getApi } from 'javascript/utils/api'
import useApiLogic from  'javascript/utils/hooks/use-api-logic'

const useResource = (resourceName) => {

  const api = getApi()
  const query = useApiLogic()
  const mutation = useApiLogic()

  const findAll = (queryParams, callback = () => {}) => new Promise((resolve, reject) => {
    query.reportStarted()
    api
      .findAll(resourceName, queryParams)
        .then((response) => {
          callback(response)
          const meta = response ? response.meta : null
          query.reportSucceeded({ response, action: 'findAll', resource: null, queryParams, meta })
          resolve(response)
        })
        .catch((errors) => {
          query.reportFailed({ errors, action: 'findAll', resource: null})
          reject(errors)
        })
  })

  const findAllBatch = (pageSize, queryParams, callback = () => {}) => {
    const apiRequest = (requestsQueryParams) => new Promise(async (resolve, reject) => {
      api.findAll(resourceName, requestsQueryParams)
        .then(resolve)
        .catch(reject)
    })
    return runAsBatch(pageSize, queryParams, apiRequest, callback, 'findAllBatch')
  }

  const findOne = (id, queryParams, callback = () => {}) => new Promise((resolve, reject) => {
    query.reportStarted()
    api
      .find(resourceName, id, queryParams)
        .then((response) => {
          callback(response)
          const meta = response ? response.meta : null
          query.reportSucceeded({ response, action: 'findOne', resource: null, queryParams, meta})
          resolve(response)
        })
        .catch((errors) => {
          query.reportFailed({ errors, action: 'findOne', resource: null})
          reject(errors)
        })
  })

  const createResource = (resource, params, callback = () => {}) => new Promise((resolve, reject) => {
    mutation.reportStarted()
    api
      .create(resourceName, resource, params)
        .then((response) => {
          const createdResource = {...resource, ...response }
          // merges response/resource to keep associated include relationships intact (but add new `id`)
          callback(createdResource)
          mutation.reportSucceeded({ response, action: 'createResource', resource: createdResource })
          resolve(createdResource)
        })
        .catch((errors) => {
          mutation.reportFailed({ errors, action: 'createResource', resource})
          reject(errors)
        })
  })

  const createRelationships = (relation, resources, callback = () => {}) => new Promise((resolve, reject) => {
    mutation.reportStarted()
    api
      .one(relation.name, relation.id)
      .relationships(resourceName)
      .post(resources)
        .then((response) => {
          callback(response)
          mutation.reportSucceeded({ response, action: 'createRelationships', resource: null })
          resolve(response)
        })
        .catch((errors) => {
          query.reportFailed({ errors, action: 'createRelationships', resource: null})
          reject(errors)
        })
  })

  const updateResource = (resource, callback = () => {}) => new Promise((resolve, reject) => {
    mutation.reportStarted()
    api
      .update(resourceName, resource)
        .then((response) => {
          const updatedResource = {...resource, ...response }
          // merges response/resource to keep associated include relationships intact
          callback(updatedResource)
          mutation.reportSucceeded({ response, action: 'updateResource', resource: updatedResource })
          resolve(updatedResource)
        })
        .catch((errors) => {
          mutation.reportFailed({ errors, action: 'updateResource', resource})
          reject(errors)
        })
  })

  const deleteResource = (resource, callback = () => {}) => new Promise((resolve, reject) => {
    mutation.reportStarted()
    api
      .destroy(resourceName, resource.id)
        .then((response) => {
          callback(response)
          mutation.reportSucceeded({ response, action: 'deleteResource', resource})
          resolve(response)
        })
        .catch((errors) => {
          mutation.reportFailed({ errors, action: 'deleteResource', resource })
          reject(errors)
        })
  })

  const deleteRelationships = (relation, resources, callback = () => {}) => new Promise((resolve, reject) => {
    mutation.reportStarted()
    api
      .one(relation.name, relation.id)
      .relationships(resourceName)
      .deleteRelationships(resources)
        .then((response) => {
          callback(response)
          mutation.reportSucceeded({ response, action: 'deleteRelationships', resource: null })
          resolve(response)
        })
        .catch((errors) => {
          query.reportFailed({ errors, action: 'deleteRelationships', resource: null})
          reject(errors)
        })
  })

  const findAllFromOneRelation = (relation, queryParams, callback = () => {}) => new Promise((resolve, reject) => {
    query.reportStarted()
    api
      .one(relation.name, relation.id)
      .all(resourceName)
      .get(queryParams)
      .then((response) => {
        callback(response)
        const meta = response ? response.meta : null
        query.reportSucceeded({ response, action: 'findAllFromOneRelation', resource: null, queryParams, meta })
        resolve(response)
      })
      .catch((errors) => {
        query.reportFailed({ errors, action: 'findAllFromOneRelation', resource: null})
        reject(errors)
      })
  })

  const findOneFromOneRelation = (relation, queryParams, callback = () => {}) => new Promise((resolve, reject) => {
    query.reportStarted()
    api
      .one(relation.name, relation.id)
      .relation(resourceName)
      .get(queryParams)
      .then((response) => {
        callback(response)
        const meta = response ? response.meta : null
        query.reportSucceeded({ response, action: 'findOneFromOneRelation', resource: null, queryParams, meta })
        resolve(response)
      })
      .catch((errors) => {
        query.reportFailed({ errors, action: 'findOneFromOneRelation', resource: null})
        reject(errors)
      })
  })

  const findAllFromOneRelationBatch = (pageSize, relation, queryParams, callback = () => {}) => {
    const apiRequest = (requestsQueryParams) => new Promise(async (resolve, reject) => {
      api.one(relation.name, relation.id)
        .all(resourceName)
        .get(requestsQueryParams)
        .then(resolve)
        .catch(reject)
    })
    return runAsBatch(pageSize, queryParams, apiRequest, callback, 'findAllFromOneRelationBatch')
  }

  const findAllAndAllRelations = (relation, queryParams, callback = () => {}) => new Promise((resolve, reject) => {
    query.reportStarted()
    api
      .all(resourceName)
      .all(relation.name)
      .get(queryParams)
      .then((response) => {
        callback(response)
        const meta = response ? response.meta : null
        query.reportSucceeded({ response, action: 'findAllAndAllRelations', resource: null, queryParams, meta })
        resolve(response)
      })
      .catch((errors) => {
        query.reportFailed({ errors, action: 'findAllAndAllRelations', resource: null})
        reject(errors)
      })
  })

  const findOneAndAllRelations = (relation, queryParams, callback = () => {}) => new Promise((resolve, reject) => {
    query.reportStarted()
    api
      .one(resourceName, relation.id)
      .all(relation.name)
      .get(queryParams)
      .then((response) => {
        callback(response)
        const meta = response ? response.meta : null
        query.reportSucceeded({ response, action: 'findOneAndAllRelations', resource: null, queryParams, meta })
        resolve(response)
      })
      .catch((errors) => {
        query.reportFailed({ errors, action: 'findOneAndAllRelations', resource: null})
        reject(errors)
      })
  })

  const runAsBatch = (pageSize, queryParams, apiRequest, callback, action) => new Promise(async (resolve, reject) => {
    query.reportStarted()
    const firstQuery = {
      ...queryParams,
      'page[number]': 1,
      'page[size]': pageSize
    }
    try {
      const firstResults = await apiRequest(firstQuery)
      const remainingRecords = firstResults.meta['record-count'] - pageSize
      const numberOfRequests = Math.ceil(remainingRecords / pageSize)
      const requests = []
      for (let pageNumber = 2; pageNumber <= numberOfRequests + 1; pageNumber += 1) {
        const requestQuery = {
          ...queryParams,
          'page[number]': pageNumber,
          'page[size]': pageSize
        }
        requests.push(apiRequest(requestQuery))
      }
      const restResults = await Promise.all(requests)
      const allResults = firstResults.concat(...restResults)
      callback(allResults)
      query.reportSucceeded({ response: allResults, action, resource: null, queryParams, meta: firstResults.meta})
      resolve(allResults)
    } catch (errors) {
      query.reportFailed({ errors, action, resource: null})
      reject(errors)
    }
  })

  const unsetResources = () => {
    mutation.reset()
    query.reset()
  }


  return {
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
    queryState: query.state,
    resetMutation: mutation.reset,
    mutationState: mutation.state,
    getDataById: query.getDataById,
    getDataAsArray: query.getDataAsArray,
    unsetResources,
    useApi: () => api,
  }
}

export default useResource