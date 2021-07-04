import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'

// Components
import AsyncSearchResource, { AsyncSearchResourceTypeType } from 'javascript/components/async-search-resource'

import usePrefix from 'javascript/utils/hooks/use-prefix'
import { findAllByModel } from 'javascript/utils/apiMethods'

interface Props {
  allLoaded: boolean
  currentValue: string
  clearable?: boolean
  filter: string
  label: string
  meta: any
  multi?: boolean
  resourceName: string
  resourceType?: AsyncSearchResourceTypeType
  updateQuery: (filter: string, value: string) => void
  hideIfEmpty?: boolean
}

const AsyncSelectFilters = ({
  allLoaded,
  currentValue,
  clearable = false,
  filter,
  label,
  meta,
  multi = true,
  updateQuery,
  resourceName,
  resourceType,
  hideIfEmpty = true,
}: Props) => {


  const { prefix } = usePrefix()
  const [optionsCache, setOptionsCache] = useState({})
  const [currentSelection, setCurrentSelection] = useState([])

  const resourceTypeToFetch = resourceType || pluralize(resourceName)

  const createItemsToCache = (resources) => {
    const cache = { ...optionsCache }
    resources.forEach((resource) => {
      cache[resource.id] = resource
    })
    return cache
  }

  const fetchResourcesAsNeeded = () => new Promise((resolve) => {
    const idsToFetch = currentValue.split(',').filter((id) => !optionsCache[id])
    if (idsToFetch.length) {
      findAllByModel(resourceTypeToFetch, {
        filter: {
          id: idsToFetch.join(',')
        },
        fields: ['id', 'name'],
      }).then((response) => {
        return resolve(createItemsToCache(response))
      })
    } else {
      return resolve(optionsCache)
    }
  })

  useEffect(() => {
    if (currentValue) {
      fetchResourcesAsNeeded().then((cache) => {
        if (cache !== optionsCache) setOptionsCache(cache)
        setCurrentSelection(currentValue.split(',').map((id) => cache[id]))
      })
    } else if (currentSelection.length) {
      setCurrentSelection([])
    }
  }, [currentValue])

  const metaIds = meta && meta[`${resourceName}-ids`] ? meta[`${resourceName}-ids`].join(',') : ''
  if (!metaIds && hideIfEmpty) return null

  const renderSelect = () => {
    return (
      <AsyncSearchResource
        resourceType={resourceTypeToFetch}
        value={currentSelection}
        multi={multi}
        filter={{ id: metaIds }}
        clearable={clearable}
        onChange={(values) => {
          setOptionsCache(createItemsToCache(values))
          //@ts-ignore
          const valueIds = (multi ? values : [values]).map((item) => item.id).join(',')
          updateQuery(filter, valueIds)
        }}
        simpleValue={false}
      />
    )
  }

  if (allLoaded) {
    return (
      <div className={`${prefix}programme-filters__column`}>
        <label className={`${prefix}programme-filters__label`}>{label}</label>
        {renderSelect()}
      </div>
    )
  }
  return null
}

export default AsyncSelectFilters
