import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import pluralize from 'pluralize'

class ProgrammeSearchResultService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'programme-search-result'
    this.jsonApi.define('programme-search-result', modelData.programmeSearchResults, {
      collectionPath: 'programmes/search',
    })
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('video', modelData.videos)
    this.jsonApi.define('genre', modelData.genres)
    this.jsonApi.define('quality', modelData.qualities)
    this.jsonApi.define('production-company', modelData.productionCompanies)
    this.jsonApi.define('series', modelData.series)
    this.jsonApi.define('episode', modelData.episodes)
    this.jsonApi.define('language', modelData.languages)
    this.jsonApi.define('user', modelData.users)
    this.jsonApi.define('company', modelData.companies)
    this.jsonApi.define('page-image', modelData.pageImages)
    this.jsonApi.define('custom-attribute', modelData.customAttributes)
    this.jsonApi.define('custom-attribute-type', modelData.customAttributeTypes)
    this.jsonApi.define('programme-duplicate', modelData.programmeDuplicates);
    this.jsonApi.define('programme-alternative-title', modelData.programmeAlternativeTitles)
    this.jsonApi.define('meta-datum', modelData.metaData)
  }

  search(query, callback) {
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, query).then((response) => {
      callback(response)
    })
  }

  getResources(query) {
    this.jsonApi.findAll('programme-search-result', query).then((response) => {
      this.actions.receiveResources(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }
}

const service = new ProgrammeSearchResultService
export default service
