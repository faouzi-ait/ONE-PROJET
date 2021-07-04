import axios from 'axios'

import apiConfig, { injectApiAuthHeaders } from 'javascript/config'
import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class VideoService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'video'
    this.jsonApi.define('video', modelData.videos)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('series', modelData.series)
    this.jsonApi.define('episode', modelData.episodes)
    this.jsonApi.define('user', modelData.users)
    this.jsonApi.define('language', modelData.languages)
    this.jsonApi.define('company', modelData.companies)
    this.jsonApi.define('private-video-access', modelData.privateVideoAccess)
    this.jsonApi.define('production-company', modelData.productionCompanies)
  }
  createResource(resource) {
    this.jsonApi.create(this.resourceName, resource).then((response) => {
      response.parent = resource.parent
      this.actions.resourceCreated(response)
    }).catch((error) => {
      this.actions.error(error)
    })
  }
  updateResource(resource) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      response.parent = resource.parent
      this.actions.resourceUpdated(response)
    }).catch((error) => {
      this.actions.error(error)
    })
  }
  saveResource(resource) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      response.parent = resource.parent
      this.actions.resourceSaved(response)
    }).catch((error) => {
      this.actions.error(error)
    })
  }

  deleteResource(resource, cb) {
    axios({
      url: `${apiConfig.apiUrl}/videos/${resource.id}`,
      method: 'DELETE',
      headers: injectApiAuthHeaders(apiConfig.headers)
    }).then((response) => {
      if (response.data && response.data.message) {
        cb(response.data)
      } else {
        this.actions.resourceDeleted(resource)
      }
    })
  }
}

const service = new VideoService
export default service

