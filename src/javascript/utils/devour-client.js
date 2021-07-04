import JsonApi from 'devour-client'
import pluralize from 'pluralize'

JsonApi.prototype.relation = function(modelName) {
  const relationshipModelName = this.builderStack[this.builderStack.length - 1]?.model
  if (!relationshipModelName) {
    throw new Error(`api.relation - requires previous model. None Found`)
  }
  const model = this.modelFor(relationshipModelName)
  const relation = model?.attributes[modelName]
  if (!relation) {
    throw new Error(`api.relation - ${relationshipModelName} has no relationship with a model name: ${modelName}`)
  }
  this.builderStack.push({model: relation, path: modelName})
  return this
}

JsonApi.prototype.relationships = function (modelName) {
  const previousRelation = this.builderStack[this.builderStack.length - 1]
  const relationshipModelName = previousRelation?.model
  if (!relationshipModelName || !previousRelation.id) {
    throw new Error('api.relation - Relationships must be called with a preceeding model and id.')
  }
  this.builderStack.push({ path: 'relationships' })
  const model = this.modelFor(relationshipModelName)
  let existingModelName = modelName
  let relation = model?.attributes[existingModelName]
  if (!relation) {
    existingModelName = pluralize(modelName)
    relation = model?.attributes[existingModelName]
  }
  if (!relation) {
    throw new Error(`api.relation - ${relationshipModelName} has no relationship with a model name: ${modelName}/${pluralize(modelName)}`)
  }
  this.builderStack.push({model: modelName, path: pluralize(modelName)})
  return this
}

JsonApi.prototype.deleteRelationships = function (payload) {
  const lastRequest = this.builderStack[this.builderStack.length - 1]
  const req = {
    method: 'DELETE',
    url: this.urlFor(),
    model: lastRequest.model,
    deletePayload: payload.map((r) => ({ //cannot use data attribute - devour has middleware that removes it
      id: r.id,
      type: lastRequest.path //force typecasting to relationship type
    })),
  }
  if (this.resetBuilderOnCall) {
    this.resetBuilder()
  }
  return this.runMiddleware(req)
}

export default JsonApi
