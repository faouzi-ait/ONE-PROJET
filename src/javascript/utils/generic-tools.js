import camelCase from 'lodash/camelCase'
import kebabCase from 'lodash/kebabCase'
import pluralize from 'pluralize'
import Humanize from 'humanize'

export const capitalize = (word) => {
  const words = word.split(' ').map(w => {
    return `${w.slice(0, 1).toUpperCase()}${w.slice(1).toLowerCase()}`
  })
  return words.join(' ')
}

export const formatCurrency = (value, currency = 'GBP') => {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  })
  return formatter.format(Number.parseFloat(value))
}

export const imageDimensions = {
  parse: (sizeStr = '') => {
    const getWidthHeight = (str = '') => {
      const sizes = str.split('x')
      return {
        width: Number.parseFloat(sizes[0]) || 0,
        height: Number.parseFloat(sizes[1]) || 0
      }
    }
    const sizeWithCrops = sizeStr.split('+')
    if (sizeWithCrops.length === 1) {
      return getWidthHeight(sizeWithCrops[0])
    }
    return {
      ...getWidthHeight(sizeWithCrops[0]),
      x: Number.parseFloat(sizeWithCrops[1]) || 0,
      y: Number.parseFloat(sizeWithCrops[2]) || 0
    }
  },
  pixelify: (dimensions) => {
    const pixelledDimensions = {...dimensions}
    Object.keys(pixelledDimensions).forEach((key) => {
      if (!pixelledDimensions[key].toString().includes('px')) {
        pixelledDimensions[key] = `${pixelledDimensions[key]}px`
      }
    })
    return pixelledDimensions;
  },
  stringify: ({ width = 0, height = 0, x, y }) => {
    if (x !== undefined && y !== undefined) {
      return `${width}x${height}+${x}+${y}`
    }
    return `${width}x${height}`
  }
}

export const isBase64 = (str = '') => {
  if (typeof str !== 'string') return false
  return str.includes('base64')
}

export const removeTrailingSlash = (path) => {
  if (path[path.length - 1] === '/') {
    return path.slice(0, -1)
  }
  return path
}

export const arrayToKeyedObj = (arr) => {
  /*
  * ['a', 'b', 'c'] => { a: 'a', b: 'b', c: 'c'}
  */
  const obj = {}
  arr.forEach((item) => obj[item] = item)
  return obj
}

export const camelCaseAllKeys = (configObj) => {
  return applyToAllKeys(configObj, camelCase)
}

export const kebabCaseAllKeys = (configObj) => {
  return applyToAllKeys(configObj, kebabCase)
}

const applyToAllKeys = (configObj, fn) => {
  if ((typeof configObj === "object") && (configObj !== null) && (!Array.isArray(configObj))) {
    return Object.keys(configObj).reduce((acc, key) => {
      acc[fn(key)] = applyToAllKeys(configObj[key], fn)
      return acc
    }, {})
  }
  return configObj
}

export const isCms = () => {
  const pathArr = window.location.pathname.split('/')
  return pathArr.length && pathArr[1] === 'admin'
}

export const fileSizeString = (fileSize) => {
  if (!fileSize || fileSize === 0) {
    return '-'
  }
  if (fileSize < 1000) {
    return 'Less than 1Kb'
  }
  if (fileSize > 1000 * 1000) {
    return `${(fileSize / (1024 * 1024)).toFixed(2)}Mb`
  }
  return `${(fileSize / 1024).toFixed(2)}Kb`
}

export const retrieveFileName = (url = '') => {
  const lastSlash = url.lastIndexOf('/') + 1 || 0
  const dot = url.lastIndexOf('.') || url.length
  return url.slice(lastSlash, dot)
}

export const singularize = (str = '') => {
  /* also handles terms ending with propostition 'as' */
  const humanizedStr = Humanize(str)
  if (humanizedStr.slice(-3).toLowerCase() === ' as') {
    return humanizedStr
  }
  return pluralize.singular(humanizedStr)
}

export const isPromise = (value) => {
  return !!(
    value &&
    value.then &&
    typeof value.then === 'function' &&
    value?.constructor?.name === 'Promise'
  )
}

/*
  genres array includes nested sub-genres
  {
    include: 'sub-genres',
    fields: {
      genres: 'name,parent-id',
    },
  }
*/
export const makeGenreSelectOptions = (genres, subGenrePrefix = (genreName, subGenreName) => `${genreName} - ${subGenreName}`) => {
  return genres
    .filter(genre => !genre['parent-id'])
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce((acc, genre) => [
      ...acc,
      {
        ...genre,
        value: genre.id,
        label: genre.name,
      },
      ...genres.filter(sub => sub['parent-id'] == genre.id)
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce((subAcc, sub) => [
          ...subAcc,
          {
            ...sub,
            value: sub.id,
            label: subGenrePrefix(genre.name, sub.name),
          }
        ], [])
    ], [])
}

export default {
  arrayToKeyedObj,
  camelCaseAllKeys,
  capitalize,
  fileSizeString,
  imageDimensions,
  isBase64,
  isCms,
  isPromise,
  kebabCaseAllKeys,
  removeTrailingSlash,
  retrieveFileName,
  formatCurrency
}