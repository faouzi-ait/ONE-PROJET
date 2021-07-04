export const applyValidFilters = (providedQuery, providedFilters) => {
  const query = {...providedQuery}
  Object.keys(providedFilters).forEach((filter) => {
    if (providedFilters[filter] !== null && providedFilters[filter] !== '') {
      query[filter] = providedFilters[filter]
    }
  })
  return query
}

export const ensureFiltersExist = (providedQuery, providedFilters) => {
  const queryWithFilters = {...providedQuery}
  Object.keys(providedFilters).forEach((filter) => {
    if (queryWithFilters.hasOwnProperty(filter)) return
    const providedFilterValue = providedFilters[filter]
    if (providedFilterValue !== null && providedFilterValue !== '') {
      queryWithFilters[filter] = providedFilterValue
    }
  })
  return queryWithFilters
}

export const filterStringsToObject = (filters) => {
  return Object.keys(filters).reduce((filterObj, key) => {
    if (key.slice(0, 7) === 'filter[') { // filter[string]
      const filterType = key.slice(7, key.length - 1)
      filterObj[filterType] = filters[key]
    }
    return filterObj
  }, {})
}

export const retrieveAllFilters = (query, withAggregations = false) => {
  return Object.keys(query).reduce((allFilters, key) => {
    if (key === 'filter' && typeof query[key] === 'object' && query[key] !== null) { // filter as object
      Object.keys(query[key]).forEach((filterKey) => {
        allFilters[`filter[${filterKey}]`] = query[key][filterKey]
      })
    } else if (key.slice(0, 7) === 'filter[') { // filter[string]
      if (!withAggregations && key === 'filter[with-aggregations]') {
        return allFilters
      }
      allFilters[key] = query[key]
    }
    return allFilters
  }, {})
}

export default {
  applyValidFilters,
  ensureFiltersExist,
  filterStringsToObject,
  retrieveAllFilters,
}