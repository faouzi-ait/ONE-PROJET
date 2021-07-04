import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'

// Components
import CustomCheckbox from 'javascript/components/custom-checkbox'
// Hooks
import usePrefix from 'javascript/utils/hooks/use-prefix'
import useResource from 'javascript/utils/hooks/use-resource'
import withHooks from 'javascript/utils/hoc/with-hooks'

interface Props {
  allLoaded?: boolean
  currentValue: string,
  filter: string,
  label: string,
  resources: any,
  updateQuery: (filter: string, value: string) => void,
  resourceDisabled: (resource: any) => boolean,
  resourceName: string
}

export const CheckboxFilters = ({
  allLoaded = true,
  currentValue,
  filter,
  label,
  resources,
  updateQuery,
  resourceDisabled = (r) => false,
  resourceName
}: Props) => {

  const [selectedValues, setSelectedValues] = useState([])
  const { prefix } = usePrefix()

  useEffect(() => {
    setSelectedValues(currentValue ? currentValue.split(',') : [])
  }, [currentValue])

  if (!resources || !resources.length) return null

  const handleChange = ({ target }) => {
    let updateSelectedValues = [...selectedValues]
    if (target.checked) {
      updateSelectedValues.push(target.value)
    } else {
      updateSelectedValues = updateSelectedValues.filter(id => id != target.value)
    }
    updateQuery(filter, updateSelectedValues.join(','))
  }

  const renderCheckboxes = () => {
    return resources.map((resource) => {
      const isChecked = selectedValues.includes(resource.id)
      const isDisabled = resourceDisabled(resource)
      return (
        <CustomCheckbox toggle={true} key={resource.id}
          id={resource.name + resource.id}
          label={resource.name}
          value={resource.id}
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
        />
      )
    })
  }

  if (allLoaded) {
    return (
      <div className={`${prefix}programme-filters__column ${prefix}programme-filters__column--${resourceName.replace(/_/g, '-')}`}>
        <label className={`${prefix}programme-filters__label`}>{label}</label>
          <div className="checkbox-filter-tabs">
            {renderCheckboxes()}
          </div>
      </div>
    )
  }
  return null
}


const enhance = compose(
  withHooks(props => {
    const { resourceName, meta, onFinishedLoading } = props
    const apiResource = useResource(pluralize(resourceName))
    useEffect(() => {
      apiResource.findAll({
        fields: {
          [pluralize(resourceName)]: 'name'
        },
        filter: {
          id: meta[`${resourceName}-ids`].join(',')
        }
      })
      .then(onFinishedLoading)
    }, [])

    return {
      ...props,
      // @ts-ignore
      resources: apiResource.getDataAsArray(),
    }
  })
)

export default enhance(CheckboxFilters)
