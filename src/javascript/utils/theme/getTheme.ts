import { getApi } from 'javascript/utils/api'
import apiConfig from 'javascript/config'
import { camelCaseAllKeys } from 'javascript/utils/generic-tools'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import { getSystemPageVariablesFromApi } from 'javascript/utils/hooks/use-system-pages'

const api = getApi()

const getConfiguration = (configType: string) => {
  return new Promise((resolve, reject) => {
    api
      .axios(`${api.apiUrl}/configuration/${configType}`, {
        method: 'GET',
        headers: {
          ...apiConfig.headers,
        },
      })
      .then(response => {
        const configData = response.data.data.attributes
        resolve(camelCaseAllKeys(configData))
      })
      .catch(reject)
  })
}


const getCustomerConfiguration = () => {
  return new Promise((resolve, reject) => {
    api
      .axios(`${api.apiUrl}/customers/current`, {
        method: 'GET',
        headers: {
          ...apiConfig.headers,
        },
      })
      .then(response => {
        const configData = response.data.data.attributes
        configData.id = response.data.data.id
        resolve(camelCaseAllKeys(configData))
      })
      .catch(reject)
  })
}




const getTheme = (): Promise<CustomThemeType> => {
  return new Promise((resolve, reject) => {
    const configFetches = [
      'features',
      'localisation',
      'styles',
      'customer'
    ].map(urlPath => urlPath === 'customer' ? getCustomerConfiguration() : getConfiguration(urlPath))

    configFetches.push(getSystemPageVariablesFromApi())

    Promise.all(configFetches)
      .then(([features, localisation, styles, customer, variables]) => {
        //@ts-ignore
        resolve({
          features,
          localisation,
          styles,
          customer,
          variables
        })
      })
      .catch(reject)
  })
}

export default getTheme
