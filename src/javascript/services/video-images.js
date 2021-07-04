import axios from 'axios'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'

class VideoImagesService {
  uploadImages(resource, id) {
    const endpoint = `${apiConfig.apiUrl}/video-images/${id}`
    axios({
      url: endpoint,
      method: 'PATCH',
      headers: {
        ...injectApiAuthHeaders(),
        'Content-Type': `image/${resource.file.name.split('.').pop().toLowerCase()}`,
        'X-Image-Type': 'poster',
        'X-Content-Length': resource.file.size,
        'X-File-Name': resource.file.name,
        'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key']
      },
      data: resource.file
    }).then(this.actions.imagesUploaded)
  }
}

const service = new VideoImagesService
export default service
