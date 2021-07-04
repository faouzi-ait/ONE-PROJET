/**
 * A handy helper function for rapidly generating forms from models.
 * Allows you to automagically keep forms up to date as models change,
 * and rapidly iterate.
 */
import models from 'javascript/models'
import { Models } from 'javascript/types/ModelTypes'
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

interface Params<T extends keyof Models> {
  modelKey: T
  blacklist?: (keyof Models[T])[]
  required?: (keyof Models[T])[]
  order?: (keyof Models[T])[]
  labelMap?: { [K in keyof Models[T]]?: string }
  typeMap?: { [K in keyof Models[T]]?: string }
  propsMap?: { [K in keyof Models[T]]?: {} }
}

export const makeFormInputsFromModel = <T extends keyof Models>({
  labelMap = {},
  modelKey,
  typeMap = {},
  blacklist = ['id'],
  required = [],
  propsMap = {},
  order,
}: Params<T>) => {
  const model = models[camelCase(modelKey)]

  if (!model) {
    throw new Error(`Model ${camelCase(modelKey)} does not exist in schema`)
  }

  let modelKeys = []

  /** If explicit order passed, use that */
  if (order) {
    modelKeys = order.filter(k => Object.keys(model).includes(k as any))
    const remainingModelKeys = Object.keys(model).filter((k: any) => {
      return !blacklist.includes(k) && !order.includes(k)
    })
    modelKeys.push(...remainingModelKeys)
  } else {
    modelKeys = Object.keys(model)
      .filter(k => !blacklist.includes(k as any))
      /** Sort required fields to the top */
      .sort((a, b) =>
        required.includes(a as any) && !required.includes(b as any) ? -1 : 1,
      )
  }

  return modelKeys.map(k => ({
    name: k,
    label:
      labelMap[k] ||
      k
        .split('-')
        .map(upperFirst)
        .join(' '),
    type: typeMap[k] || 'text',
    required: required.includes(k as any),
    props: propsMap[k] || {},
  }))
}
