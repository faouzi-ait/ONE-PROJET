import {
  belongsTo,
  hasMany,
  Model,
} from 'miragejs'
import camelCase from 'lodash/camelCase'
import pluralize from 'pluralize'

import { getApi } from 'javascript/utils/api'

const modelCache = {}

const debugLogging = false // model name or false (i.e. debugLogging = 'video', will display what video model looks like)

/* https://github.com/miragejs/miragejs/issues/247 - Mirage must use camelCased models/attributes */

export const extendModelFromDevourSchema = (modelName) => {
  const isLogging = modelName === debugLogging
  const loggingJson = { modelName, '------------------': '----------------------------------------------------------------' }
  if (!modelCache[modelName]) {
    const model = getApi().models[modelName].attributes
    if (!model) return null
    const mirageModel = Object.keys(model).reduce((mirageModel, key) => {
      if (typeof model[key] === 'object') {
        const relationship = model[key].jsonApi === 'hasMany' ? hasMany : belongsTo
        const inverseType = camelCase(model[key]?.mirage?.inverse) || null
        if (model[key].type) {
          const modelType = camelCase(pluralize.singular(model[key].type))

          if (isLogging) loggingJson[key] = `${relationship.name}('${modelType}', { inverse: ${inverseType} })`
          //@ts-ignore
          mirageModel[camelCase(key)] = relationship(modelType, { inverse: inverseType })
        } else {
          if (isLogging) loggingJson[key] = `${relationship.name}({ polymorphic: true })`
          //@ts-ignore
          mirageModel[camelCase(key)] = relationship({ polymorphic: true })
        }
      }
      return mirageModel
    }, {})
    if (isLogging) console.table(loggingJson)
    modelCache[camelCase(modelName)] = mirageModel
  }
  return modelCache[camelCase(modelName)]
}

export const getModelsFromJSONApiSchema = () => {
  const { models } = getApi()
  const createdModels = Object.keys(models).reduce((allModels, key) => {
    allModels[camelCase(key)] = Model.extend(extendModelFromDevourSchema(key) || {})
    return allModels
  }, {})
  return createdModels
}

const serverUtils = {
  extendModelFromDevourSchema,
  getModelsFromJSONApiSchema
}

export default serverUtils