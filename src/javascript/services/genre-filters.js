import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class GenreFilterService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'genre'
    this.jsonApi.define('genre', modelData.genres)
    this.jsonApi.define('programme', modelData.programmes)
  }
}

const service = new GenreFilterService
export default service
