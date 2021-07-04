import { useMemo } from 'react'
import deepmerge from 'deepmerge-concat'
import { extractClientVariables } from 'javascript/utils/client-switch/tools'

export interface ClientVariables {
  [client: string]: any
}

/** Ensure that arrays are overwritten, not concatenated, during merge */
const overwriteArrayMerge = (_: unknown, sourceArray: any[]) => sourceArray

const useClientVariables = (providedClientVariables: ClientVariables, calculatedVariables: ClientVariables = {}) => {
  return getAllClientVariables(providedClientVariables, calculatedVariables)
}

export const useDefaultClientVariables = (providedClientVariables: ClientVariables, calculatedVariables: ClientVariables = {}) => {
  return getAllClientVariables(providedClientVariables, calculatedVariables, true)
}

export const getAllClientVariables = (providedClientVariables, calculatedVariables, returnDefaultValues = false) => {
  return useMemo(() => {
    return deepmerge(
      extractClientVariables(providedClientVariables, returnDefaultValues),
      extractClientVariables(calculatedVariables, returnDefaultValues),
      { arrayMerge: overwriteArrayMerge }
    )}, [
    JSON.stringify(providedClientVariables),
    JSON.stringify(calculatedVariables)
  ])

}


export default useClientVariables