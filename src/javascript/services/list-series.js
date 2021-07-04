import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ListSeriesService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'list-sery'
    this.jsonApi.define('list-sery', modelData.listSeries)
    this.jsonApi.define('series', modelData.series)
    this.jsonApi.define('list', modelData.lists)
  }
}

const service = new ListSeriesService
export default service
