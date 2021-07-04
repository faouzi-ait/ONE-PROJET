import APIHelper from 'javascript/services/helper'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'
import axios from 'axios'
import JsFileDownload from 'js-file-download'
import modelData from 'javascript/models'

class AssetAccessReportsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'asset-access-reports'
    this.jsonApi.define('asset-material', modelData.assetMaterials)
    this.jsonApi.define('asset-item', modelData.assetItems)
    this.jsonApi.define('asset-category', modelData.assetCategories)
    this.jsonApi.define('user', modelData.users)
    this.jsonApi.define('company', modelData.companies)
    this.jsonApi.define('role', modelData.roles)
  }
  exportResources(query, name){
    axios({
      url: `${apiConfig.apiUrl}/${this.resourceName}.csv?${query}`,
      method: 'GET',
      headers: injectApiAuthHeaders(apiConfig.headers),
      responseType: 'blob',
      data: {}
    }).then(({data}) => {
      JsFileDownload(data, `${name}.csv`)
    })
  }
}

const service = new AssetAccessReportsService
export default service
