import update, { resourceWithIdKey, arrayToIdObj } from 'javascript/utils/helper-functions/update-helpers'

const resourceHandlers = {
  initialState: {
    resourcesById: {},
    resourcesOrder: {},
  },
  actions: {
    setResources: (state, payload) => {
      let resources = []
      let relation = null
      if (Array.isArray(payload)) {
        resources = payload
        relation = { name: 'default', id: 0 }
      } else {
        resources = payload.resources || []
        relation = payload.relation ? payload.relation : { name: 'default', id: 0 }
      }
      const mapped = Array.isArray(resources) ? arrayToIdObj(resources) : arrayToIdObj([resources])
      return update(state, {
        resourcesById: { $merge: mapped.objsById },
        resourcesOrder: {
          $auto: { [relation.name]: {
            $auto: { [relation.id] : { $set: mapped.orderArr } }
          }}
        }
      })
    },
    setResource: (state, resource) => {
      return update(state, { resourcesById: { $merge: resourceWithIdKey(resource) } })
    },
    updateResources: (state, payload) => {
      const { relation = { name: 'default', id: 0 } } = payload
      const { lastAction, lastResource } = payload.resourceHook.mutationState
      switch (lastAction) {
        case 'createResource': {
          return update(state, {
            resourcesById: { $merge: resourceWithIdKey(lastResource) },
            resourcesOrder: {
              $auto: { [relation.name]: {
                $auto: { [relation.id] : {
                  $autoArray: { $unshift: [lastResource.id] }
                }}
              }}
            }
          })
        }
        case 'updateResource': {
          return update(state, {
            resourcesById: { $merge: resourceWithIdKey(lastResource) }
          })
        }
        case 'deleteResource': {
          return update(state, {
            resourcesById: {
              $apply: (allResourcesById) => {
                const copy = Object.assign({}, allResourcesById)
                delete copy[lastResource.id]
                return copy
              }
            },
            resourcesOrder: {
              [relation.name] : {
                [relation.id] : (resourceIds) => resourceIds.filter((id) => {
                  return id !== lastResource.id
                })
              }
            }
          })
        }
      }
      return state
    },
    unsetResources: (state, initialState) => {
      return initialState
    },
  },
  selectors: {
    getResourcesArray: (state, relation = { name: 'default', id: 0 } ) => {
      const { resourcesById, resourcesOrder } = state
      if (!(resourcesOrder[relation.name] && resourcesOrder[relation.name][relation.id])) {
        return null // have never fetched resources for this relation (name / id)
      }
      return resourcesOrder[relation.name][relation.id].map((id) => resourcesById[id])
    },
    getResource: (state, id) => {
      return state.resourcesById[id] || {}
    }
  }
}

export default resourceHandlers