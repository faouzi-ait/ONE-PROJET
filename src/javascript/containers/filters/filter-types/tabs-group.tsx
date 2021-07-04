import React, { useState, useEffect } from 'react'
import pluralize from 'pluralize'

import usePrefix from 'javascript/utils/hooks/use-prefix'
import useResource from 'javascript/utils/hooks/use-resource'

// Components
import TabFilters from 'javascript/components/tab-filters'

interface Props {
  allLoaded?: boolean
  filter: string
  meta: any
  onFinishedLoading: () => void
  resourceName: string
  selectedOption: string
  updateQuery: (filter: string, values: string) => void
}

const TabsGroupFilter: React.FC<Props> = ({
  allLoaded = true,
  filter,
  meta,
  onFinishedLoading,
  resourceName,
  selectedOption,
  updateQuery,
}) => {
  const [resources, setResources] = useState([])
  const dbResource = useResource(resourceName)
  const { prefix } = usePrefix()
  
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
    updateQuery(filter, target.value)
  }

  if (allLoaded) {
    return (
      <div className={`${prefix}programme-filters__row`}>
        <div className="tabs tabs--radio">
          {resources.map((resource) => {
            return (
              <TabFilters key={resource.id}
                parent={resource}
                checked={selectedOption === resource.id}
                children={[]}
                onChange={handleChange}
              />
            )
          })}
        </div>
      </div>
    )
  }
  return null
}


export default TabsGroupFilter
