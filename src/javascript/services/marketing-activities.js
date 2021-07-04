import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class MarketingActivityService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'marketing-activity'
    this.jsonApi.define('marketing-activity', modelData.marketingActivities)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('marketing-category', modelData.marketingCategories)
  }
}

const service = new MarketingActivityService
export default service