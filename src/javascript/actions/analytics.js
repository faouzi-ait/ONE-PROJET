import axios from 'axios'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'

class Analytics {

  recordLogin = async () => {
    axios({
      url: `${apiConfig.apiUrl}/action-logs/user_login_actions?log-in-type=web`,
      method: 'POST',
      headers: injectApiAuthHeaders(apiConfig.headers)
    }).then((response) => {
      console.info('Analytics::Login', response)
    }).catch((errors) => {
      console.error('Analytics::Login', errors)
    })
  }

  recordProgrammeView = async (payload) => {
    axios({
      url: `${apiConfig.apiUrl}/action-logs/programme_views?programme-id=${payload.id}&time-spent=${payload.time}`,
      method: 'POST',
      headers: injectApiAuthHeaders(apiConfig.headers)
    }).then((response) => {
      console.info('Analytics::Programme View', response)
    }).catch((errors) => {
      console.error('Analytics::Programme View', errors)
    })
  }

  recordVideoView = async (payload) => {
    axios({
      url: `${apiConfig.apiUrl}/action-logs/video_views?video-id=${payload.id}&time-viewed=${payload.time}`,
      method: 'POST',
      headers: injectApiAuthHeaders(apiConfig.headers)
    }).then((response) => {
      console.info('Analytics::Video View', response)
    }).catch((errors) => {
      console.error('Analytics::Video View', errors)
    })
  }

  generateReport = async (payload, format = 'json') => {
    let headers = injectApiAuthHeaders(apiConfig.headers)
    let responseType
    if(format === 'csv') {
      headers = Object.assign({}, headers, { 'Content-Type': 'text/csv', 'Accept': 'text/csv' })
      responseType = 'blob'
    } else {
      responseType = 'json'
    }
    return axios({
      url: `${apiConfig.apiUrl}/report`,
      method: 'GET',
      headers: headers,
      params: payload,
      responseType
    }).catch((errors) => {
      console.error('Analytics::Report', errors)
    })
  }

  exportReport = async (payload) => {
    return axios({
      url: `${apiConfig.apiUrl}/report`,
      method: 'GET',
      headers: {
        ...injectApiAuthHeaders(apiConfig.headers),
        'Content-Type': 'text/csv'
      },
      params: payload
    }).catch((errors) => {
      console.error('Analytics::Report', errors)
    })
  }
}

export default new Analytics
