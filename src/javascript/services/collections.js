import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import pluralize from 'pluralize'

class CollectionService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'collection'
    this.jsonApi.define('collection', modelData.collections)
    this.jsonApi.define('page', modelData.pages)
    this.jsonApi.define('content-position', modelData.contentPositions)
    this.jsonApi.define('meta-datum', modelData.metaData)
  }

  getSlugResource(slug, query) {
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, {
      ...query,
      filter: { slug }
    }).then((response) => {
      this.actions.receiveSlugResource(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  getSiteMap(query) {
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, {
      ...query
    }).then((response) => {
      this.actions.recievedSiteMap(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }
}

const service = new CollectionService
export default service
