import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'
import axios from 'axios'

class DataImportService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'data-import'
    this.jsonApi.define('data-import', modelData.dataImport)
  }

  startImportType(type = 'programmes_import') {
    axios({
      url: `${apiConfig.apiUrl}/data-import-reports?import-type=${type}`,
      method: 'POST',
      headers: {
        ...injectApiAuthHeaders(),
        'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key'],
        post: {
          'Content-type': 'application/vnd.api+json'
        }
      }
    })
  }
}

const service = new DataImportService
export default service

