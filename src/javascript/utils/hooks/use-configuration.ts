import { getApi } from '../api'
import apiConfig from 'javascript/config'
import { kebabCaseAllKeys } from 'javascript/utils/generic-tools'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

const useConfiguration = <F extends keyof CustomThemeType>(configType: F) => {
  const api = getApi()

  const save = (values: CustomThemeType): Promise<CustomThemeType> => new Promise((resolve, reject) => {
    if (!Object.keys(values).length) {
      return resolve(values)
    }
    return api.axios(`${api.apiUrl}/configuration/${configType}`, {
      method: 'PATCH',
      headers: {
        ...apiConfig.headers,
      },
      data: {
        "data": {
          "type": "configurations",
          "id": configType,
          "attributes": kebabCaseAllKeys(values[configType])
        }
      }
    })
    .then((res) => resolve(values))
    .catch((err) => reject(err))
  })

  return {
    save,
    useApi: () => api
  }
}

export default useConfiguration