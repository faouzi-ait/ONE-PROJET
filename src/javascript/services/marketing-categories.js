import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class MarketingCategoryService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'marketing-category'
    this.jsonApi.define('marketing-category', modelData.marketingCategories)
  }
}

const service = new MarketingCategoryService
export default service