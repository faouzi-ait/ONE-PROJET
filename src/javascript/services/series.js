import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import CustomAttributeActions from 'javascript/actions/custom-attributes'
import SeriesTalentActions from 'javascript/actions/series-talents'
class SeriesService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'series'
    this.jsonApi.define('series', modelData.series)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('episode', modelData.episodes)
    this.jsonApi.define('user', modelData.users)
    this.jsonApi.define('company', modelData.companies)
    this.jsonApi.define('custom-attribute', modelData.customAttributes)
    this.jsonApi.define('custom-attribute-type', modelData.customAttributeTypes)
    this.jsonApi.define('series-talent', modelData.seriesTalents)
    this.jsonApi.define('talent', modelData.talents)
    this.jsonApi.define('talent-type', modelData.talentTypes)
    this.jsonApi.define('series-image', modelData.seriesImages)
  }

  createResource(resource, attributes, talents) {
    this.jsonApi.create(this.resourceName, resource).then((response) => {
      response.programme = resource.programme
      CustomAttributeActions.createAndAssociate(response, attributes, () => {
        this.actions.resourceCreated(response)
      })
      if(talents){
        SeriesTalentActions.createAndAssociate(response, talents, () => {
          this.actions.resourceCreated(response)
        })
      }
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  updateResource(resource, attributes, talents) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      response.programme = resource.programme
      CustomAttributeActions.createOrUpdate(attributes, () => {
        this.actions.resourceUpdated(response)
      })
      if(talents){
        SeriesTalentActions.createOrUpdate(talents, () => {
          this.actions.resourceUpdated(response)
        })
      }
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  updateResourcePosition(resource) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      response.programme = resource.programme
      this.actions.resourcePositionUpdated(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }
}

const service = new SeriesService
export default service
