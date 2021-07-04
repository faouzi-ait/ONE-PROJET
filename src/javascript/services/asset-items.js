import apiConfig, { injectApiAuthHeaders } from 'javascript/config'
import axios from 'axios'
import Dispatcher from 'javascript/dispatcher'

export default class AssetItemsService {
  constructor(props) {
    this.onUpload = props.onUpload || function () {}
    this.onError = props.onError || function () {}
    this.onProgress = props.onProgress || function () {}
  }

  uploadAsset(asset, materialId, id) {
    axios({
      url: `${apiConfig.apiUrl}/asset-items?data[type]=asset-items&data[relationships][asset-material][data][id]=${materialId}`,
      method: 'POST',
      headers: {
        ...injectApiAuthHeaders(),
        'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key'],
        'Content-Type': asset.type,
        'X-Content-Length': asset.size,
        'X-File-Size': asset.size,
        'X-File-Name': asset.name.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, ''),
        'X-File-Type': asset.name.split('.').pop().toLowerCase()
      },
      data: asset,
      onUploadProgress: (e) => {
        const percent = (e.loaded / e.total) * 100
        this.onProgress(percent, id)
      }
    }).then(() => {
      this.onUpload()
    }).catch((error) => {
      if (error.response) {
        this.onError(error.response.data)
      } else {
        this.onError(error)
      }
    })
  }

  uploadAssets(assets, materialId) {
    const count = assets.length
    const errors = []
    const progress = []
    let uploaded = 0

    assets.map((asset, i) => {
      progress.push(0)
      axios({
        url: `${apiConfig.apiUrl}/asset-items?data[type]=asset-items&data[relationships][asset-material][data][id]=${materialId}`,
        method: 'POST',
        headers: {
          ...injectApiAuthHeaders(),
          'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key'],
          'Content-Type': asset.type,
          'X-Content-Length': asset.size,
          'X-File-Size': asset.size,
          'X-File-Name': asset.name.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, ''),
          'X-File-Type': asset.name.split('.').pop().toLowerCase()
        },
        data: asset,
        onUploadProgress: (e) => {
          progress[i] = (e.loaded / e.total) * 100
          const percent = Math.floor(progress.reduce((a, b) => a + b, 0) / count)
          this.onProgress(percent)
        }
      }).then(() => {
        uploaded++
        if (uploaded === count) {
          this.onUpload()
        }
      }).catch((error) => {
        if(!error.response){
          errors.push('Asset failed to upload due to invalid characters in the filename')
        } else {
          errors.push(error.response.data)
        }
        if (errors.length + uploaded === count) {
          this.onError(errors)
        }
      })
    })
  }

  deleteItem(id) {
    axios({
      url: `${apiConfig.apiUrl}/asset-items/${id}`,
      method: 'DELETE',
      headers: injectApiAuthHeaders(apiConfig.headers),
    }).then((response) => {
      Dispatcher.dispatch({
        type: 'ASSET_MATERIAL_MODIFIED'
      })
    })
  }

}
