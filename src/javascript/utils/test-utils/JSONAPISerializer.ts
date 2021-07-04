import { JSONAPISerializer } from 'miragejs'
import kebabCase from 'lodash/kebabCase'

/* https://github.com/miragejs/miragejs/issues/247 - Mirage must use camelCased models/attributes */

export default JSONAPISerializer.extend({
  serialize(response, request) {
    //@ts-ignore
    const json = JSONAPISerializer.prototype.serialize.apply(this, arguments)
    if (Array.isArray(json.data)) {
      addMeta(json, request)
    }
    return json
  },
  typeKeyForModel(model) {
    return kebabCase(model.modelName);
  },
  keyForAttribute(key) {
    return kebabCase(key);
  },
  keyForRelationship(key) {
    return kebabCase(key);
  }
})

function addMeta(json, request) {
  const pageNumber = request.queryParams['page[number]'] || 1
  const pageSize = request.queryParams['page[size]']

  json.meta = json.meta || { 'record-count': json.data.length }

  if (!pageSize) {
    return
  }

  const minIndex = (pageNumber - 1) * pageSize
  const maxIndex = pageNumber * pageSize
  const totalRecords = json.data.length
  json.data = json.data.slice(minIndex, maxIndex)
  json.meta = json.meta || {}
  json.meta['page-count'] = json.meta['page-count'] || Math.ceil(totalRecords / pageSize)
}