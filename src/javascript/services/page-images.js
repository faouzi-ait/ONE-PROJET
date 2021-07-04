import axios from 'axios'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'

class PageImagesService {
  constructor() {
    this.resourceCount = 0
    this.uploadCount = 0
    this.errorCount = 0
    this.errors = {}
  }

  uploadImages(assets, id) {
    const count = assets.length
    const errors = []
    const progress = []
    let uploaded = 0
    assets.map((asset, i) => {

      const file = new Blob([asset], {type: asset.type});
      file.name = asset.name.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '');
      const now = Date.now();
      file.lastModifiedDate = new Date(now);
      file.lastModified = now

      progress.push(0)
      axios({
        url: `${apiConfig.apiUrl}/page/${id}/page-images`,
        method: 'POST',
        headers: {
          ...injectApiAuthHeaders(),
          'Content-Type': `image/${file.name.split('.').pop().toLowerCase()}`,
          'X-Content-Length': file.size,
          'X-File-Name': file.name,
          'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key'],
          'X-Image-Type': 'image'
        },
        data: file,
        onUploadProgress: (e) => {
          progress[i] = (e.loaded / e.total) * 100
          const percent = Math.floor(progress.reduce((a, b) => a + b, 0) / count)
          this.actions.imageProgress(percent)
        }
      }).then(() => {
        uploaded++
        if (uploaded === count) {
          this.actions.imagesUploaded()
        }
      }).catch((error) => {
        errors.push(error.response.data)
        if (errors.length + uploaded === count) {
          this.actions.error(errors)
        }
      })
    })
  }

  deleteImage(id) {
    axios({
      url: `${apiConfig.apiUrl}/page-images/${id}`,
      method: 'DELETE',
      headers: injectApiAuthHeaders(apiConfig.headers),
    }).then((response) => {
      this.actions.imageDeleted()
    })
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
  patchUploadImages(resources, id) {
    Object.keys(resources).map((key) => {
      const resource = resources[key]
      if (resource.file) {
        this.resourceCount ++
      }
    })
    if (this.resourceCount < 1) {
      this.actions.imagesUploaded()
    }
    const endpoint = `${apiConfig.apiUrl}/page/${id}/page-images`
    Object.keys(resources).map((key) => {
      const resource = resources[key]
      if (resource.file) {
        axios({
          url: endpoint,
          method: 'PATCH',
          headers: {
            ...injectApiAuthHeaders(),
            'Content-Type': `image/${resource.file.name.split('.').pop().toLowerCase()}`,
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
  }

}

const service = new PageImagesService
export default service

