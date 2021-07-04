import axios from 'axios'
import JsFileDownload from 'js-file-download'
import pluralize from 'pluralize'

import APIHelper from 'javascript/services/helper'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'

class UsersService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'user'
  }
  getClients(query) {
    this.jsonApi.findAll(`${this.resourceName}s`, query).then((response) => {
      this.actions.receiveClients(response)
    }).catch((error) => {
      this.actions.error(error)
    })
  }
  getAccountManagers(query) {
    this.jsonApi.findAll(`${this.resourceName}`, query).then((response) => {
      this.actions.receiveAccountManagers(response)
    }).catch((error) => {
      this.actions.error(error)
    })
  }
  getSalesCoordinators(query) {
    this.jsonApi.findAll(`${this.resourceName}`, query).then((response) => {
      this.actions.receiveSalesCoordinators(response)
    }).catch((error) => {
      this.actions.error(error)
    })
  }
  createUser(resource) {
    this.jsonApi.create('user', resource).then((response) => {
      this.actions.userCreated(response)
    }).catch((error) => {
      this.actions.error(error)
    })
  }
  duplicateUser(resource) {
    axios({
      url: apiConfig.apiUrl + '/users/duplicate',
      method: 'POST',
      headers: injectApiAuthHeaders(apiConfig.headers),
      params: resource
    }).then((response) => {
      this.actions.userDuplicated(response)
    }).catch(this.actions.error)
  }
  updateUser(resource) {
    this.jsonApi.update('user', resource).then((response) => {
      this.actions.userUpdated(response)
    }).catch((error) => {
      this.actions.error(error)
    })
  }
  search(query, callback) {
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, query).then(callback)
  }
  suspendUser(id, suspended) {
    this.jsonApi.update('user', { id, suspended }).then((response) => {
      this.actions.userSuspended(response)
    }).catch((error) => {
      this.actions.error(error)
    })
  }
  exportCSV(query) {
    delete query['page[size]']
    const queryString = Object.keys(query).map((key)=>{return key + '=' + query[key]}).join('&')
    this.jsonApi.axios(`${apiConfig.apiUrl}/${pluralize(this.resourceName)}?${queryString}&format=csv`, {
      method: 'GET',
      responseType: 'blob',
      headers: {
        ...injectApiAuthHeaders(),
        'Accept': 'text/csv',
        'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key']
      }
    }).then(({ data }) => {
      JsFileDownload(data, `${pluralize(this.resourceName)}.csv`)
      this.actions.resourceExported()
    })
  }
}

const service = new UsersService
export default service

