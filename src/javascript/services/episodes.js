import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class EpisodeService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'episode'
    this.jsonApi.define('episode', modelData.episodes)
    this.jsonApi.define('series', modelData.series)
    this.jsonApi.define('programme', modelData.programmes)
  }

  createResource(resource) {
    this.jsonApi.create(this.resourceName, resource).then((response) => {
      response.series = resource.series
      this.actions.resourceCreated(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  updateResource(resource) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      response.series = resource.series
      this.actions.resourceUpdated(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }
}

const service = new EpisodeService
export default service