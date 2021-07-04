import apiConfig from 'javascript/config'

/*
*  Params:
*     namespace: <string> namespace to prepend to all request to api
*     apiResource: <Object> this is a useResource, useReduxResource, etc.. api hoo
*
*  returns: <Object> apiResource with apiUrl modified
*/

const nameSpaced = (nameSpace, apiResource) => {
  apiResource.useApi().apiUrl = `${apiConfig.apiUrl}/${nameSpace}`
  return apiResource
}

export default nameSpaced