import api from './api'

const searchApi = (resource, params) =>
  api.request(`${api.apiUrl}/${resource}/search`, 'GET', params)

export default searchApi