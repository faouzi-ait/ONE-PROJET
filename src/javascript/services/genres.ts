import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import { GenreType } from 'javascript/types/ModelTypes'

class GenreService extends APIHelper<GenreType> {
  constructor() {
    super()
    this.resourceName = 'genre'
    this.jsonApi.define('genre', modelData.genres)
    this.jsonApi.define('programme', modelData.programmes)
  }
}

const service = new GenreService
export default service
