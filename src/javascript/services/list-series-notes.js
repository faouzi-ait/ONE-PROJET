import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ListSeriesNotesService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'list-series-note'
    this.jsonApi.define('list-series-note', modelData.listSeriesNotes)
    this.jsonApi.define('list-series', modelData.listSeries)
  }
}

export default new ListSeriesNotesService