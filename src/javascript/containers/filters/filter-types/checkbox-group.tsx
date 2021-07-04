import React, { useState, useEffect } from 'react'
import pluralize from 'pluralize'

import usePrefix from 'javascript/utils/hooks/use-prefix'
import useResource from 'javascript/utils/hooks/use-resource'

// Components
import CheckboxFilters from 'javascript/components/checkbox-filters'
import Icon from 'javascript/components/icon'

let tagClasses = 'tag'
/* #region  all3 */
tagClasses = 'tag tag--brand'
/* #endregion */

let checkboxFilterClasses = ''
 /* #region  all3 */
 checkboxFilterClasses = 'checkbox-filters'
 /* #endregion */

interface Props {
  allLoaded?: boolean
  filter: string
  showSelectedRow?: boolean | undefined
  meta: any
  onFinishedLoading: () => void
  resourceName: string
  selectedOptions: string[]
  updateQuery: (filter: string, values: string) => void
}

const CheckboxGroupFilter: React.FC<Props> = ({
  allLoaded = true,
  filter,
  showSelectedRow,
  meta,
  onFinishedLoading,
  resourceName,
  selectedOptions,
  updateQuery,
  children
}) => {
  const { prefix } = usePrefix()
  const [resources, setResources] = useState([])
  const dbResource = useResource(resourceName)
  useEffect(() => {
    dbResource.findAll({
      fields: {
        [pluralize(resourceName)]: 'name'
      },
      filter: {
        id: meta[`${resourceName}-ids`].join(',')
      }
    })
    .then((response) => {
      setResources(response)
      onFinishedLoading()
    })
    .catch(console.warn)
  }, [])

  const handleChange = ({ target }) => {
    let updateSelectedValues = [...selectedOptions]
    if (target.checked) {
      updateSelectedValues.push(target.value)
    } else {
      updateSelectedValues = updateSelectedValues.filter(id => id != target.value)
    }
    updateQuery(filter, updateSelectedValues.join(','))
  }

  const remove = (idToDelete) => {
    const updateSelectedValues = [...selectedOptions].filter(id => id != idToDelete)
    updateQuery(filter, updateSelectedValues.join(','))
  }

  const renderSelectedOptions = () => {
    const selection = resources
    .filter((resource) => selectedOptions.includes(resource.id))
    .map((resource) => ({
      name: resource.name.toUpperCase(),
      id: resource.id
    }))
    if (selection.length > 0) {
      return (
        <div className={`${prefix}programme-filters__selection`}>
          {selection.map((resource) => {
            return (
              <span className={tagClasses} key={resource.id} onClick={() => remove(resource.id)}>
                {resource.name}
                <Icon width="14" height="14" viewBox="0 0 14 14" id="i-close" classes="tag__icon" />
              </span>
            )
          })}
        </div>
      )
    }
  }
  if (allLoaded) {
    return (
      <>
        {resources.length > 0 && children}
        { showSelectedRow && renderSelectedOptions() }
        <div className={checkboxFilterClasses}>
          {resources.map((resource) => {
            const isChecked = selectedOptions.includes(resource.id)
            return (
              <CheckboxFilters key={resource.id}
                parent={resource}
                checkParent={isChecked}
                children={[]}
                onChange={handleChange}
                multi={resources.length > 1}
              />
            )
          })}
        </div>
      </>
    )
  }
  return null
}


export default CheckboxGroupFilter
