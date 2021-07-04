import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'

import { createOneByModel, deleteOneByModel, updateOneByModel } from 'javascript/utils/apiMethods'
import { notifyBugsnag } from 'javascript/utils/helper-functions/notify-bugsnag'
import { ReorderableList } from 'javascript/components/reorderable-list'
import AsyncSearchResource, { AsyncSearchResourceTypeType, AsyncSearchResultType } from 'javascript/components/async-search-resource'
import Button from 'javascript/components/button'
import withUser, { WithUserType } from 'javascript/components/hoc/with-user'
import compose from 'javascript/utils/compose'
import withWaitForLoadingDiv, { WithWaitForLoadingDivType } from '../hoc/with-wait-for-loading-div'

interface Props extends WithUserType, WithWaitForLoadingDivType {
  searchableName: string
  searchableType: AsyncSearchResourceTypeType
  indexType: 'programme-broadcaster' | 'series-broadcaster' | 'production-companies-programme'
  fetchResources: () => Promise<OrderableListItem[]>
  relation: { [key: string]: { id: string } }
}

export type OrderableListItem = {
  id: string
  name: string
  position: number
  searchableId: string
}

const OrderableIndex: React.FC<Props> = ({
  fetchResources,
  indexType,
  relation,
  resetWaitForLoadingDiv,
  searchableName,
  searchableType,
  user,
  waitForLoading,
}) => {

  const [resources, setResources] = useState([])
  const [takenIds, setTakenIds] = useState('')
  const [apiError, setApiError] = useState('')

  const getResources = () => {
    setApiError('')
    fetchResources()
    .then((resources) => {
      setResources(resources)
      setTakenIds(resources.map((r) => r.searchableId).join(','))
      setTimeout(() => {
        waitForLoading.finished(null)
      }, 500)
    })
    .catch((err) => {
      setApiError(`Something went wrong whilst getting your data. A message has been sent to our dev team, and we'll fix it ASAP.`)
      notifyBugsnag(err, user)
    })
  }

  useEffect(() => {
    getResources()
  }, [])

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Add a {searchableName}</h2>
        <div style={{ maxWidth: '40ch' }}>
          <AsyncSearchResource
            resourceType={searchableType}
            value={undefined}
            filter={{ 'not-ids': takenIds }}
            onChange={(resource: AsyncSearchResultType) => {
              createOneByModel(indexType, {
                [pluralize.singular(searchableType)]: { id: resource.id },
                ...relation
              }).then((response) => {
                getResources()
              }).catch((error) => {
                setApiError(`${resource.name} - ${Object.values(error)[0]}`)
              })
            }}
            placeholder={'Search...'}
          />
          {apiError && <p className="cms-form__error" style={{minWidth: '620px'}}>{apiError}</p>}
        </div>
      </div>
      <table className="cms-table">
        <ReorderableList
          droppableTag="tbody"
          draggableTag="tr"
          onChange={({ item, newItems, newPosition }) => {
            resetWaitForLoadingDiv()
            waitForLoading.waitFor('re-order')
            updateOneByModel(indexType, {
              id: item.id,
              position: newPosition,
            }).then((response) => {
              getResources()
            })
            .catch((err) => {
              setApiError(`Something went wrong while reordering. A message has been sent to our dev team, and we'll fix it ASAP.`)
              notifyBugsnag(err, user)
            })
          }}
          items={resources}
          renderItem={({ item }) => (
            <>
              <td>
                <strong>{item.name}</strong>
              </td>
              <td>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    className="button button--small button--error"
                    onClick={() => {
                      deleteOneByModel(indexType, item.id)
                      .then(getResources)
                      .catch((err) => {
                        setApiError(`We could not remove '${item.name}' It's something wrong with our end. A message has been sent to our dev team, and we'll fix it ASAP.`)
                        notifyBugsnag(err, user)
                      })
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </td>
            </>
          )}
        ></ReorderableList>
      </table>
    </div>
  )
}

const enhance = compose(
  withUser,
  withWaitForLoadingDiv
)

export default enhance(OrderableIndex)
