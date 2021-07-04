import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'
import axios from 'axios'
import JsFileDownload from 'js-file-download'
import pluralize from 'pluralize'

class ListsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'list'
    this.jsonApi.define('list', modelData.lists)
    this.jsonApi.define('user', modelData.users)
    this.jsonApi.define('meeting', modelData.meetings)
    this.jsonApi.define('list-programme', modelData.listProgrammes)
    this.jsonApi.define('list-video', modelData.listVideos)
    this.jsonApi.define('list-sery', modelData.listSeries)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('video', modelData.videos)
    this.jsonApi.define('series', modelData.series)
    this.jsonApi.define('episode', modelData.episodes)
    this.jsonApi.define('list-programme-note', modelData.listProgrammeNotes)
    this.jsonApi.define('list-series-note', modelData.listSeriesNotes)
    this.jsonApi.define('list-video-note', modelData.listVideoNotes)
    this.jsonApi.define('genre', modelData.genres)
    this.jsonApi.define('like', modelData.likes)
  }

  exportResource(id, type, name) {
    axios({
      url: `${apiConfig.apiUrl}/lists/${id}.${type}`,
      method: 'GET',
      headers: injectApiAuthHeaders(apiConfig.headers),
      responseType: 'blob',
      data: {},
    }).then(({ data }) => {
      JsFileDownload(data, `${this.filename(name)}.${type}`)
    })
  }

  getFolder(folder, query) {
    this.jsonApi
      .findAll(pluralize(this.resourceName), query)
      .then(response => {
        this.actions.receiveFolder(folder, response)
      })
      .catch(errors => {
        this.actions.error(errors)
      })
  }

  filename(name) {
    return name.toLowerCase().replace(/ /g, '_')
  }
}

const service = new ListsService()
export default service
