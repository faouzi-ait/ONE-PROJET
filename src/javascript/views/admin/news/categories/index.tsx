import React, { useEffect } from 'react'

import compose from 'javascript/utils/compose'

import useResource from 'javascript/utils/hooks/use-resource'
import useTheme from 'javascript/utils/theme/useTheme'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'
import withIndexHelper, { WithIndexHelperType } from 'javascript/components/hoc/with-index-helper'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

import { ReorderableList } from 'javascript/components/reorderable-list'
import DeleteForm from 'javascript/views/admin/news/categories/delete-form'
import Modal from 'javascript/components/modal'
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import { NewsCategoryType } from 'javascript/types/ModelTypes'

interface Props extends WithPageHelperType, WithIndexHelperType {
}

const NewsCategories: React.FC<Props> = (props) => {
  const { localisation } = useTheme()
  const meta = {
    title: `${localisation.client} :: ${localisation.news.upper} Categories`,
    meta: {
      description: `Edit and Create ${localisation.news.upper} Categories`
    }
  }

  const newsCategoryResource = useResource('news-category')
  const getNewsCategories = () => {
    newsCategoryResource.findAll({
      include: 'news-articles',
      fields: {
        'news-categories': 'name,news-articles,position',
        'news-articles': 'title'
      },
      sort: 'position'
    }).then(() => {
      props.pageIsLoading(false)
    })
  }

  useEffect(() => {
    getNewsCategories()
  }, [])

  useWatchForTruthy(newsCategoryResource.mutationState.succeeded, () => {
    props.modalState.hideModal()
    getNewsCategories()
  })

  const renderDeleteResource = (resource, props) => {
    const articlesCount = resource['news-articles']?.length || 0
    if (articlesCount === 0) {
      return newsCategoryResource.deleteResource(resource)
    }
    props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={ hideModal }
          title="Warning" modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
          <div className="cms-modal__content">
            <DeleteForm {...props}
              resource={ resource }
              count={articlesCount}
              closeEvent={ hideModal }
              deleteResource={newsCategoryResource.deleteResource}
            />
          </div>
        </Modal>
      )
    })
  }

  const renderResources = (props) => {
    return (
      <div className="container">
        <table className="cms-table">
          <thead>
            <tr>
              <th colSpan={3}>Name</th>
            </tr>
          </thead>
          <ReorderableList<NewsCategoryType>
            items={props.resources || []}
            onChange={({item, newItems, newPosition}) => {
              const update = {...item}
              if (newPosition === 1) {
                update.position = 1
              } else {
                const oldPosition = newItems[newPosition - 1].position
                const prevPagePosition = newItems[newPosition - 2].position
                update.position = oldPosition > prevPagePosition ? prevPagePosition + 1 : prevPagePosition
              }
              newsCategoryResource.updateResource({
                id: update.id,
                position: update.position,
              }).then((response) => {
                getNewsCategories()
              })
            }}
            droppableTag="tbody"
            draggableTag="tr"
            renderItem={({ item: child  }) => {
              return (
                <>
                  <td colSpan={2}>{ child.name }</td>
                  <td className="cms-table__actions">
                    <ActionMenu name="Actions">
                      <ActionMenuItem label="Edit" onClick={() => { props.renderUpdateResource(child, props) }} />
                      <ActionMenuItem label="Delete" onClick={() => { props.renderDeleteResource(child, props) }} />
                    </ActionMenu>
                  </td>
                </>
              )
            }}
          />
        </table>
      </div>
    )
  }

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    createResource: newsCategoryResource.createResource,
    updateResource: newsCategoryResource.updateResource,
    deleteResource: newsCategoryResource.deleteResource,
    meta,
    renderDeleteResource,
    renderResources,
    resourceName: `${localisation.news.upper} Category`,
    resources: newsCategoryResource.getDataAsArray(),
  }
  return props.renderPageIndex(indexHelperProps)
}

const enhance = compose(
  withPageHelper,
  withIndexHelper,
)

export default enhance(NewsCategories)
