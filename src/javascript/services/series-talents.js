import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class SeriesTalentsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'series-talent'
    this.jsonApi.define('series-talent', modelData.seriesTalents)
    this.jsonApi.define('talent', modelData.talents)
    this.jsonApi.define('talent-type', modelData.talentTypes)
    this.jsonApi.define('series', modelData.series)
  }

  updateResource(resource, callback) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      this.actions.resourceUpdated(response)
      if (callback) {
        callback()
      }
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  createResource(resource, callback) {
    this.jsonApi.create(this.resourceName, resource).then((response) => {
      this.actions.resourceCreated(response)
      if (callback) {
        callback()
      }
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }
}

const service = new SeriesTalentsService
export default service
