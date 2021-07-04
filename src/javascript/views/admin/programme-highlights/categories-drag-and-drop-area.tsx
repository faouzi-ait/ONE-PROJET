import Button from 'javascript/components/button'
import { ReorderableList } from 'javascript/components/reorderable-list'
import SharedIcon from 'javascript/components/shared-icon'
import { ProgrammeHighlightType } from 'javascript/types/ModelTypes'
import { updateOneByModel } from 'javascript/utils/apiMethods'
import useApiQueue from 'javascript/utils/hooks/use-api-queue'
import React from 'react'

const sortByPosition = array => array.sort((a, b) => a.position - b.position)

const CategoriesDragAndDropArea = ({
  category,
  deleteResource,
  buttonDisabled,
}) => {
  const { addToQueue } = useApiQueue()
  return (
    <>
      <ReorderableList<ProgrammeHighlightType>
        disabled={buttonDisabled}
        items={sortByPosition(category['programme-highlights'])}
        onChange={({ item: highlight, newPosition, newItems }) => {
          newItems.forEach((item, index) => {
            addToQueue(() =>
              updateOneByModel('programme-highlight', {
                id: item.id,
                position: index + 1,
              }),
            )
          })
        }}
        draggableTag="tr"
        droppableTag="tbody"
        renderItem={({ item: highlight }) => (
          <>
            <td className="cms-table__image">
              <img
                src={highlight.programme.thumbnail.admin_thumb.url}
                role="presentation"
              />
            </td>
            <td>
              <p>{highlight.programme.title}</p>
            </td>
            <td />
            <td />
            <td className="cms-table__actions">
              <Button
                color="error"
                sizeModifier="small"
                onClick={() => deleteResource(highlight)}
                disabled={buttonDisabled}
              >
                <SharedIcon
                  icon="close"
                  style={{ fill: 'white', marginRight: 0 }}
                  className="button__icon"
                />
              </Button>
            </td>
          </>
        )}
      ></ReorderableList>
    </>
  )
}

export default CategoriesDragAndDropArea
