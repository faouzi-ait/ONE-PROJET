import { useState } from 'react'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'
import usePreloadQuery from 'javascript/components/permissions/usePreloadQuery'
import uuid from 'uuid/v4'

const usePermissionsListLogic = ({ query = () => Promise.resolve([]), onToggle }) => {
  const [value, setValue] = useState([])
  const [queriedValue, status] = usePreloadQuery({ query })

  useWatchForTruthy(status === 'fulfilled', () => {
    const mappedInitialValue = queriedValue.map(item => ({
      ...item,
      checked: true,
    }))
    setValue(mappedInitialValue)
  })

  const addToList = item => {
    setValue([...value, { ...item, checked: false, id: uuid() }])
  }

  const changeIdOfItemAndCheckIt = (itemToChange, changes) => {
    setValue(
      value.map(item => {
        if (item.id === itemToChange.id) {
          return {
            ...item,
            id: changes.id,
            checked: true,
            type: changes.type,
          }
        }
        return item
      }),
    )
  }

  const toggleItem = itemToChange => {
    const isRemoving = itemToChange.checked
    if (isRemoving) {
      setValue(value.filter(item => item.id !== itemToChange.id))
    } else {
      setValue(
        value.map(item => {
          if (item.id === itemToChange.id) {
            return { ...itemToChange, checked: !itemToChange.checked }
          }
          return item
        }),
      )
    }
    onToggle(
      { ...itemToChange, checked: !itemToChange.checked },
      changeIdOfItemAndCheckIt,
    )
  }

  return { onChange: setValue, value, status, addToList, toggleItem }
}

export default usePermissionsListLogic
