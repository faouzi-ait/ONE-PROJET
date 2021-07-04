import { createServer } from 'miragejs'
import pluralize from 'pluralize'
import camelCase from'lodash/camelCase'
import { getModelsFromJSONApiSchema } from 'javascript/utils/test-utils/server/utils'
import JSONAPISerializer from 'javascript/utils/test-utils/JSONAPISerializer'

const clientApiKeyOverrides = {
}

const insertRelationshipModels = (schema, relationships = {}) => {
  const relations = Object.keys(relationships).reduce((acc, key) => {
    if (relationships[key].data?.id) {
      return {
        ...acc,
        [key]: schema[pluralize(camelCase(key))].find(relationships[key].data.id)
      }
    } else if (Array.isArray(relationships[key].data) && relationships[key].data.length) {
      const typeIds = `${pluralize.singular(relationships[key].data[0].type)}Ids`
      return {
        ...acc,
        [typeIds]: relationships[key].data.map((r) => r.id)
      }
    }
  }, {})
  return relations
}

const addCrudFunctionality = (that) => (resource) => {
  const model = camelCase(resource)
  that.get(`/${resource}/:id`, (schema, request) => { // findOne
    return schema[model].find(request.params.id)
  })
  that.get(`/${resource}`, (schema, request) => { // findAll
    if (Object.keys(request.queryParams).length > 0) {
      const filters = Object.keys(request.queryParams).reduce((acc, param) => {
        if (param.includes('filter[')) {
          const filter = param.replace(/(filter\[|\])/g, '')
          if (schema.db[model][0]?.hasOwnProperty(filter)) {
            acc[filter] = request.queryParams[param]
          }
        }
        return acc
      }, {})
      if (Object.keys(filters).length) {
        return schema[model].where(filters)
      }
    }
    return schema[model].all()
  })
  that.post(`/${resource}`, (schema, request) => {
    const body = JSON.parse(request.requestBody)
    const createdDBResource = schema[model].create({
      ...body.data.attributes,
      ...insertRelationshipModels(schema, body.data.relationships)
    })
    return createdDBResource
  })
  that.patch(`/${resource}/:id`, (schema, request) => {
    const body = JSON.parse(request.requestBody)
    const updatedDBResource =  schema[model]
      .find(request.params.id)
      .update({
        ...body.data.attributes,
        ...insertRelationshipModels(schema, body.data.relationships)
      })
    return updatedDBResource
  })
  that.delete(`/${resource}/:id`, (schema, request) => {
    const item = schema[model].find(request.params.id)
    schema.db[model].remove(request.params.id)
    return item
  })
}

const makeServer = (environment = 'test') => {
  const {
    npm_config_CLIENT: client,
    npm_config_PRODUCTION: isProduction,
  } = process.env
  if (!client) throw Error('Cannot create server. No client defined (/javascript/utils/test-utils/server.ts)')

  const apiName = clientApiKeyOverrides[client]

  return createServer({
    environment,
    urlPrefix: `https://api-${apiName || client}${!!isProduction ? '' : '.staging'}.rawnet.one/`,
    serializers: {
      application: JSONAPISerializer
    },
    models: getModelsFromJSONApiSchema(),
    routes() {

      /****************** KEEP ROUTES ALPHABETICAL PLEASE *********************/

      const crudRoutes = [
        'broadcasters',
        'custom-attribute-types',
        'genres',
        'pages',
        'production-companies-programmes',
        'programmes',
        'programme-broadcasters',
        'programme-types',
        'series',
        'series-broadcasters',
        'territories',
        'users',
        'video-types',
        'weighted-words'
      ]
      crudRoutes.forEach(addCrudFunctionality(this))

      this.get('/countries', (schema, request) => {
        if (request.queryParams.priority === 'GB,US') {
          return {
            'priority_countries': [['United Kingdom', 'GB'], ['United States', 'US']],
            'countries_with_codes': [['Antarctica', 'AQ' ], ['Swaziland', 'SZ']]
          }
        }
        return {
          'countries_with_codes': [['Antarctica', 'AQ' ], ['Swaziland', 'SZ'], ['United Kingdom', 'GB'], ['United States', 'US']]
        }
      })

      this.get('/programmes/:id/production-companies-programmes', (schema, request) => {
        return schema.productionCompaniesProgrammes.all()
      })

      this.get('/programmes/:id/weighted-words', (schema, request) => {
        return schema.weightedWords.all()
      })

      this.get('/series/search', (schema, request) => {
        return schema.seriesSearchResults.all()
      })
    },
  })
}

export default makeServer

