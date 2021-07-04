import { useEffect } from 'react';
import useLocalState from './use-local-state';

const useDraggability = ({ items: defaultItems, onChange }) => {
  let {
    setState,
    state: { draggedIndex, items },
  } = useLocalState({
    initialState: {
      draggedIndex: null,
      items: [],
    },
    actions: {
      setState: (state, payload) => ({ ...state, ...payload }),
    },
  })

  /** Stay synchronised with the items passed from above */
  useEffect(() => {
    setState({ items: defaultItems })
  }, [defaultItems.map(_highlight => _highlight.id).join()])

  const dragStart = ({ e, index }) => {
    draggedIndex = index
    e.dataTransfer.setData('text', e.currentTarget.getAttribute('data-reactid'))
  }

  const dragOver = ({ e, index }) => {
    e.preventDefault()
    const tempItems = Array.from(items)
    tempItems[draggedIndex].position = index + 1
    tempItems.splice(index, 0, tempItems.splice(draggedIndex, 1)[0])
    setState({
      items: tempItems,
      draggedIndex: index
    })
  }

  const dragEnd = ({ index }) => {
    const item = items[draggedIndex]
    onChange(item)
    setState({
      draggedIndex: null
    })
  }

  const onDrop = e => {
    e.preventDefault()
  }

  return {
    createDragProps: ({ index }) => ({
      draggable: true,
      classes: ['draggable', index === draggedIndex && 'hidden'],
      onDragStart: e => {
        dragStart({ e, index })
      },
      onDragEnd: () => {
        dragEnd({ index })
      },
      onDragOver: e => {
        dragOver({ e, index })
      },
      onDrop,
    }),
    itemsToShow: items,
  }
}

export default useDraggability
