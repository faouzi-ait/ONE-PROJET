import React, { useEffect, useState } from 'react'

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

/* This mock component will automatically sort your items by position if the items contain a position attribute */

export const ReorderableList = ({
  items: defaultItems,
  renderItem,
  onChange,
}) => {

  const [items, setItems] = useState([])

  useEffect(() => {
    if (defaultItems[0]?.hasOwnProperty('position')) {
      setItems(defaultItems.sort((a, b) => a.position - b. position))
    } else {
      setItems(defaultItems)
    }
  }, [JSON.stringify(defaultItems)])

  const Component = renderItem

  return (
    <tbody>
      {items.map((item, index) => (
        <tr key={index} onDragEnd={({ target }) => {
          //@ts-ignore
          const { startIndex, endIndex } = target.data
          const itemThatChanged = items[startIndex]
          onChange?.({
            item: itemThatChanged,
            newPosition: endIndex + 1,
            newItems: reorder(items, startIndex, endIndex),
          })
        }}>
          <Component item={item} index={index} />
        </tr>
      ))}
    </tbody>
  )
}



