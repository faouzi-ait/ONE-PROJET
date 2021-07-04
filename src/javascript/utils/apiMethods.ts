import { Models, SingularModels } from '../types/ModelTypes'
import api from './api'

export const findAllByModel = <T extends keyof Models>(
  type: T,
  params: ApiParams<T>,
): Promise<Models[T][] & { meta: any}> => {
  const joinedParams = massageParamsToApiConsumableShape(params, type)
  return api.findAll(type, joinedParams)
}

export const findAllByModelBatch = <T extends keyof Models>(
  type: T,
  pageSize: number,
  params: ApiParams<T>,
): Promise<Models[T][] & { meta: any}> => new Promise(async (resolve, reject) => {
  const joinedParams = massageParamsToApiConsumableShape(params, type)
  const firstQuery = {
    ...joinedParams,
    'page[number]': 1,
    'page[size]': pageSize
  }
  try {
    const firstResults = await api.findAll(type, firstQuery)
    const requests = []
    for (let pageNumber = 2; pageNumber <= firstResults.meta['page-count']; pageNumber += 1) {
      const requestQuery = {
        ...joinedParams,
        'page[number]': pageNumber,
        'page[size]': pageSize
      }
      requests.push(api.findAll(type, requestQuery))
    }
    const restResults = await Promise.all(requests)
    const allResults = firstResults.concat(...restResults)
    allResults.meta = firstResults.meta
    return resolve(allResults)
  } catch (error) {
    return reject(error)
  }
})

export const findOneByModel = <T extends keyof Models>(
  type: T,
  id: number,
  params: ApiParams<T>,
): Promise<Models[T]> => {
  const joinedParams = massageParamsToApiConsumableShape(params, type)
  return api.find(type, id, joinedParams)
}

export const updateOneByModel = <T extends keyof SingularModels>(
  type: T,
  params: {
    [K in keyof SingularModels[T]]?: SingularModels[T][K] extends object
      ? Partial<SingularModels[T][K]>
      : SingularModels[T][K]
  } & {
    id: string | number
  },
  queryParams?: any
) => {
  return api.update(type, params, queryParams || {})
}

export const query = <
  Type extends keyof Models = any,
  ToReturn = Models[Type][]
>(
  url: string,
  type: Type,
  params: ApiParams<Type>,
): Promise<ToReturn> => {
  return api.request(
    `${api.apiUrl}/${url}`,
    'GET',
    massageParamsToApiConsumableShape(params, type),
  )
}

export const deleteOneByModel = <Type extends keyof SingularModels>(
  type: Type,
  id: number,
) => {
  return api.destroy(type, id)
}

export const createOneByModel = <Type extends keyof SingularModels>(
  type: Type,
  params: Omit<
    { [K in keyof SingularModels[Type]]?: Partial<SingularModels[Type][K]> },
    'id'
  >,
  queryParams?: any
): Promise<SingularModels[Type]> => {
  return api.create(type, params, queryParams || {})
}

export const massageParamsToApiConsumableShape = <T extends keyof Models>(
  params: ApiParams<any>,
  type: T,
) => {
  const flattenedObject = Object.entries(params).reduce((obj, [key, value]) => {
    if (Array.isArray(value)) {
      return { ...obj, [key]: value.join(',') }
    }
    if (typeof value === 'object' && value !== null) {
      return { ...obj, [key]: massageParamsToApiConsumableShape(value, type) }
    }
    return { ...obj, [key]: value }
  }, {})
  return {
    ...flattenedObject,
    fields: {
      ...flattenedObject.includeFields,
      [type]: flattenedObject.fields,
    },
    includeFields: undefined,
  }
}

/* prettier-ignore */
export interface ApiParams<T extends keyof Models> {
  includeFields?: {
    [K in keyof Models]?: (keyof Models[K])[]
  }
  fields: (keyof Models[T])[]
  include?: (keyof Models[T] | string)[]
  filter?: {
    [key: string]: any
  }
  sort?: string
  page?: {
    [key: string]: any
    size?: number | 'all'
  },
  headers?: {
    'login-redirect-override-key': boolean
  },
  token?: string
}
