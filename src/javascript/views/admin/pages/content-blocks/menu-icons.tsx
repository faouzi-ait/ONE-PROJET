import React from 'react'
import { Draggable } from 'react-beautiful-dnd'

import 'stylesheets/admin/components/content-blocks-sub-nav'

import Icon from 'javascript/components/icon'
import { AllowedContentBlocksType, formatType } from 'javascript/views/admin/pages/content-blocks/index'

interface Props {
  allowedContentBlocks: AllowedContentBlocksType
  iconBeingDragged: string | boolean
  provided: any
  snapshot: any
}

const ContentBlockMenuIcons: React.FC<Props> = ({
  allowedContentBlocks,
  iconBeingDragged,
  provided,
  snapshot,
}) => {
  const iconCount = Object.keys(allowedContentBlocks).length
  const listClasses = ['content-blocks-sub-nav__list', iconCount < 20 && 'hide-scrollbars'].filter(Boolean).join(' content-blocks-sub-nav__list--')

  return (
    <div className={listClasses}
      {...provided.droppableProps}
      ref={provided.innerRef}
      style={{
        ...provided.droppableProps.style,
        ...(iconCount < 10 && { paddingTop: '30px' })
      }}
    >
      {Object.keys(allowedContentBlocks).map((type, index) => {
        const block = allowedContentBlocks[type]
        const iconClasses = ['content-blocks-sub-nav__icon', iconBeingDragged === type && 'dragging'].filter(Boolean).join(' content-blocks-sub-nav__icon--')
        return (
          <div className="content-blocks-sub-nav__icon-placeholder" key={type}>
            <Draggable key={type} draggableId={type} index={index} >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...provided.draggableProps.style,
                  }}
                >
                  <div className={iconClasses}>
                    <Icon height={'28px'} {...block.icon} />
                    <span className="content-blocks-sub-nav__icon-text">{block.label || formatType(type)}</span>
                  </div>
                </div>
              )}
            </Draggable>
          </div>
        )
      })}
      {provided.placeholder}
    </div>
  )
}

export default ContentBlockMenuIcons
