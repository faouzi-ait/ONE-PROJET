import React, { useEffect, useState } from 'react'

import compose from 'javascript/utils/compose'
import pluralize from 'pluralize'
// Components
import Select from 'javascript/components/select'
// Hooks
import useResource from 'javascript/utils/hooks/use-resource'
// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import usePrefix from 'javascript/utils/hooks/use-prefix'

interface Props {
  allLoaded?: boolean
  currentValue: string,
  clearable?: boolean,
  filter: string,
  label: string,
  multi?: boolean,
  resources: any,
  resourceLabel: any,
  setSelectIsOpen: (newState: boolean) => void,
  updateQuery: (filter: string, value: string) => void,
  hideIfEmpty?: boolean,
  resourceName: string,
}

const SelectFilters = ({
  allLoaded = true,
  currentValue,
  clearable = false,
  filter,
  label,
  multi = true,
  resources,
  setSelectIsOpen,
  updateQuery,
  resourceLabel,
  hideIfEmpty = true,
  resourceName
}: Props) => {

  if ((!resources || !resources.length) && hideIfEmpty) return null

  const { prefix } = usePrefix()

  const renderSelect = () => {
    const options = resources.sort((a, b) => { return resourceLabel ? a[resourceLabel[0]].localeCompare(b[resourceLabel[0]]) : a.name.localeCompare(b.name) }).map(resource => ({
      value: resource.id,
      label: resourceLabel ? resourceLabel.map(r=>{return resource[r]}).join(' ') : resource.name
    }))
    return (
      <Select options={options}
        value={currentValue}
        multi={multi}
        clearable={clearable}
        onChange={(values) => updateQuery(filter, values)}
        onOpen={() => setSelectIsOpen(true) }
        onClose={() => setSelectIsOpen(false) }
        simpleValue={true} />
    )
  }

  if (allLoaded) {
    return (
      <div className={`${prefix}programme-filters__column ${prefix}programme-filters__column--${resourceName === 'string' && resourceName.replace(/_/g, '-')}`}>
        <label className={`${prefix}programme-filters__label`}>{label}</label>
        {renderSelect()}
      </div>
    )
  }
  return null
}

const enhance = compose(
  withHooks(props => {
    const { resourceName, meta, resourceLabel } = props
    const apiResource = typeof resourceName === 'string' ? useResource(pluralize(resourceName)) : null
    const resourceNameArrStr = Array.isArray(resourceName) ? JSON.stringify(resourceName) : ''
    const [resources, setResources] = useState([])
    const metaArray = meta?.[`${resourceName}-ids`]
    const metaIds = metaArray && Array.isArray(metaArray) ? meta[`${resourceName}-ids`]?.join(',') : ''

    const loadResources = () => {
      if (apiResource) {
        if (metaIds) {
          apiResource.findAll({
            fields: {
              [pluralize(resourceName)]: resourceLabel ? resourceLabel.join(',') : 'name'
            },
            filter: {
              id: metaIds
            }
          })
          .then((response) => {
            setResources(response)
            props.onFinishedLoading()
          })
        } else {
          setResources([])
          props.onFinishedLoading()
        }
      }
    }

    useEffect(() => {
      if (resourceNameArrStr) {
        setResources(resourceName)
      }
    }, [resourceNameArrStr])

    useEffect(() => {
      loadResources()
    }, [metaIds])


    return {
      ...props,
      resources,
      resourceLabel
    }
  })
)

export default enhance(SelectFilters)
