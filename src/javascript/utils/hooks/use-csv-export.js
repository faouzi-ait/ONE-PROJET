import { getApi } from 'javascript/utils/api'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'
import JsFileDownload from 'js-file-download'

const useCsvExport = () => {
  const api = getApi()

  const create = (url, queryParams, format = '', fileName) => new Promise((resolve, reject) => {

    const formatQuery = queryParams
    if (format.length) {
      formatQuery.format = format
    }

    const params = Object.keys(formatQuery).map(key => key + '=' + formatQuery[key]).join('&')
    api.axios(`${api.apiUrl}/${url}?${encodeURI(params)}`, {
      method: 'GET',
      responseType: 'blob',
      headers: {
        ...injectApiAuthHeaders(),
        'Accept': 'text/csv',
        'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key']
      }
    })
      .then(({ data }) => {
        const csvFileName = `${fileName}.csv`
        JsFileDownload(data, csvFileName)
        resolve(csvFileName)
      })
      .catch(reject)
  })

  return {
    create,
    useApi: () => api
  }
}

export default useCsvExport