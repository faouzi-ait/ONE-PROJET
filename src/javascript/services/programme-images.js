import axios from 'axios'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'

class ProgrammeImagesService {
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
    this.errorCount = 0
    const endpoint = `${apiConfig.apiUrl}/programme-images/${id}`

    Object.keys(resources).map((key) => {
      const resource = resources[key]
      if (resource.file) {
        this.resourceCount++
        axios({
          url: endpoint,
          method: 'PATCH',
          headers: {
            ...injectApiAuthHeaders(),
            'Content-Type': `image/${resource.path.split('.').pop().toLowerCase()}`,
            'X-Image-Type': key,
            'X-Content-Length': resource.file.size,
            'X-File-Name': resource.file.name,
            'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key']
          },
          data: resource.file
        }).then(() => {
          this.checkCount()
        }).catch((error) => {
          this.compileErrors(key, error.response.data.message[0])
        })
      }
    })

    if (this.resourceCount === 0) { this.actions.imagesUploaded() }
  }
}

const service = new ProgrammeImagesService
export default service
