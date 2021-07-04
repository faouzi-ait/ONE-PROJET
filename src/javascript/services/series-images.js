import axios from 'axios'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'

class SeriesImagesService {
  constructor() {
    this.resourceCount = 0
    this.uploadCount = 0
    this.errorCount = 0
    this.errors = {}
  }
  checkCount() {
    this.uploadCount ++
    if (this.uploadCount === this.resourceCount) {
      this.actions.imagesUploaded()
    }
  }
  compileErrors(key, error) {
    this.errors[key] = error
    this.errorCount ++
    if (this.errorCount > 0 && (this.errorCount + this.uploadCount === this.resourceCount)) {
      this.actions.error(this.errors)
    }
  }
  uploadImages(resources, id) {
    this.resourceCount = 0
    this.uploadCount = 0
    Object.keys(resources).map((key) => {
      const resource = resources[key]
      if (resource.file) {
        this.resourceCount ++
      }
    })
    if (this.resourceCount < 1) {
      this.actions.imagesUploaded()
    }
    Object.keys(resources).map((key) => {
      const resource = resources[key]
      if (resource.file) {
        axios({
          url: `${apiConfig.apiUrl}/series/${id}/series-images`,
          method: 'POST',
          headers: {
            ...injectApiAuthHeaders(),
            'Content-Type': `image/${resource.file.name.split('.').pop().toLowerCase()}`,
            'X-Content-Length': resource.file.size,
            'X-File-Name': resource.file.name,
            'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key'],
            'X-Image-Type': 'image'
          },
          data: resource.file
        }).then(() => {
          this.checkCount()
        }).catch((error) => {
          this.compileErrors(key, error.response.data.message[0])
        })
      }
    })
  }

  deleteImage(id, index) {
    axios({
      url: `${apiConfig.apiUrl}/series/${id}/series-images/${index}`,
      method: 'DELETE',
      headers: injectApiAuthHeaders(apiConfig.headers)
    }).then(() => {
      this.actions.imageDeleted()
    })
  }
}

const service = new SeriesImagesService
export default service
