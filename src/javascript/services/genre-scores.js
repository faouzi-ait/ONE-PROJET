import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class GenreScoreService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'genre-score'
    this.jsonApi.define('genre-score', modelData.genreScores)
    this.jsonApi.define('genre', modelData.genres)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('quality', modelData.qualities)
  }
}

const service = new GenreScoreService
export default service
