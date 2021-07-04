import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class NewsCategoryService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'news-category'
    this.jsonApi.define('news-category', modelData.newsCategories)
  }
}

const service = new NewsCategoryService
export default service
