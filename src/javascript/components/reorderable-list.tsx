import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result: T[] = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

export function ReorderableList<T extends { id: string | number; position: number }>({
  items: defaultItems,
  renderItem,
  draggableStyle,
  draggableTag: DraggableTag = 'div',
  droppableTag: DroppableTag = 'div',
  droppableStyle,
  onChange,
  disabled,
}: {
  items: T[]
  disabled?: boolean
  draggableTag?: string
  droppableTag?: string
  draggableStyle?: any
  droppableStyle?: any
  onChange?: (result: { item: T; newPosition: number; newItems: T[] }) => void
  renderItem: React.FC<{ item: T; index: number }>
}) {
  const [items, setItems] = useState<T[]>([])

  useEffect(() => {
    setItems(defaultItems)
  }, [JSON.stringify(defaultItems)])

  const onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const itemThatChanged = items[result.source.index]

    const newItems: T[] = reorder(
      items,
      result.source.index,
      result.destination.index,
    )

    onChange?.({
      item: itemThatChanged,
      newPosition: result.destination.index + 1,
      newItems,
    })

    setItems(newItems)
  }

  const Component = renderItem

  return (
    <DragDropContext onDragEnd={onDragEnd} >
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <DroppableTag
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ ...provided.droppableProps.style, ...droppableStyle }}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id.toString()} index={index} isDragDisabled={disabled}>
                {(provided, snapshot) => (
                  <DraggableTag
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      ...draggableStyle,
                    }}
                    // style={getItemStyle(
                    //   snapshot.isDragging,
                    //   provided.draggableProps.style,
                    // )}
                  >
                    <Component item={item} index={index} />
                  </DraggableTag>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </DroppableTag>
        )}
      </Droppable>
    </DragDropContext>
  )
}
