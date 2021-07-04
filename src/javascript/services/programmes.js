import pluralize from 'pluralize'
import JsFileDownload from 'js-file-download'

import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import CustomAttributeActions from 'javascript/actions/custom-attributes'
import ProgrammeTalentActions from 'javascript/actions/programme-talents'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'

class ProgrammeService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'programme'
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
    this.jsonApi.define('programme-duplicate', modelData.programmeDuplicates)
    this.jsonApi.define('programme-alternative-title', modelData.programmeAlternativeTitles)
    this.jsonApi.define('meta-datum', modelData.metaData)
    this.jsonApi.define('programme-talent', modelData.programmeTalents)
    this.jsonApi.define('talent', modelData.talents)
    this.jsonApi.define('talent-type', modelData.talentTypes)
  }

  search(query, callback) {
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, query).then((response) => {
      callback(response)
    })
  }

  getResourceFiles(id, query) {
    this.jsonApi.find(this.resourceName, id, query).then((response) => {
      this.actions.recievedResourceFiles(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  createResource(resource, attributes, talents) {
    this.jsonApi.create(this.resourceName, resource).then((response) => {
      CustomAttributeActions.createAndAssociate(response, attributes, () => {
        this.actions.resourceCreated(response)
      })
      if(talents){
        ProgrammeTalentActions.createAndAssociate(response, talents, () => {
          this.actions.resourceCreated(response)
        })
      }
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  updateResource(resource, attributes, talents) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      CustomAttributeActions.createOrUpdate(attributes, () => {
        this.actions.resourceUpdated(response)
      })
      if (talents) {
        ProgrammeTalentActions.createOrUpdate(talents, () => {
          this.actions.resourceUpdated(response)
        })
      }
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  duplicateResource(resource) {
    this.jsonApi.create('programme-duplicate', { 'programme-id': resource.id }).then((response) => {
      this.actions.resourceDuplicated(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  exportCSV(fileName) {
    this.jsonApi.axios(`${apiConfig.apiUrl}/${pluralize(this.resourceName)}/export_csv`, {
      method: 'POST',
      responseType: 'blob',
      headers: {
        ...injectApiAuthHeaders(),
        'Accept': 'text/csv',
        'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key']
      }
    }).then(({ data }) => {
      JsFileDownload(data, `${fileName}.csv`)
      this.actions.resourceExported()
    })
  }
}

const service = new ProgrammeService
export default service
