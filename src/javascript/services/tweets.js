import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class TweetsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'tweet'
    this.jsonApi.define('tweet', modelData.tweets)
    this.jsonApi.define('users', modelData.users)
  }
}

const service = new TweetsService
export default service
