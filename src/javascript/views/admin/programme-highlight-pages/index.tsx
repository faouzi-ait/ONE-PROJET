
import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import styled from 'styled-components'

import { WithThemeType } from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'
import Form from 'javascript/views/admin/programme-highlight-pages/form'
import withIndexHelper, { WithIndexHelperType } from 'javascript/components/hoc/with-index-helper'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import DeleteForm from 'javascript/components/admin/delete-form-confirm'
import Modal from 'javascript/components/modal'
import { ReorderableList } from 'javascript/components/reorderable-list'
import { ProgrammeHighlightPageType } from 'javascript/types/ModelTypes'

interface Props extends WithPageHelperType, WithThemeType, WithIndexHelperType {}

const ProgrammeHighlightPagesIndex: React.FC<Props> = (props) => {
  const {
    modalState,
    pageIsLoading,
    renderPageIndex,
    theme: { localisation },
  } = props

  const meta = {
    title: `${localisation.client} :: Highlight Pages`,
    meta: {
      description: 'Edit and create Highlight Pages'
    }
  }
  const [resources, setResources] = useState([])
  const [positionLoading, setPositionLoading] = useState(false)

  const highlightPagesResource = useResource('programme-highlight-page')
  const getHighlightPages = () => {
    highlightPagesResource.findAll({
      include: 'parent-highlight-page,programme-highlight-pages',
      fields: {
        'programme-highlight-pages': 'title,position,display-highlights-as-carousel,programme-highlights-count,parent-highlight-page,programme-highlight-pages',
      },
      sort: 'position',
      filter: {
        top_level: true
      },
    }).then((response) => {
      setResources(response.map((highlightPage) => ({
        ...highlightPage,
        name: highlightPage.title, //with-index-helper expects name, not title
        'programme-highlight-pages': highlightPage['programme-highlight-pages'].map(subPage => ({
          ...subPage,
          name: subPage.title,
          'parent-highlight-page': highlightPage
        }))
      })))
      pageIsLoading(false)
      setPositionLoading(false)
    })
  }

  useEffect(() => {
    getHighlightPages()
  }, [])

  useWatchForTruthy(highlightPagesResource.mutationState.succeeded, () => {
    getHighlightPages()
    modalState.hideModal()
  })

  const updateResource = (formData) => {
    const update = {...formData}
    delete update['programme-highlights-count']
    highlightPagesResource.updateResource({
      ...update,
      title: formData.name
    })
  }

  const reorderChildPage = (resource, position) => {
    setPositionLoading(true)
    highlightPagesResource.updateResource({
      id: resource.id,
      position: position,
    })
  }

  const renderDeleteResource = (resource, props) => {
    const programmesCount = resource['programme-highlights-count'] || resource['programme-highlight-pages'].length > 0
    if (!programmesCount || resource.highlightPages) {
      return highlightPagesResource.deleteResource(resource)
    }
    const subPages = resource['programme-highlight-pages']
    props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={ hideModal }
          title="Warning" modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}
        >
          <div className="cms-modal__content">
            {resource['programme-highlight-pages'].length > 0 ? (
              <div className="u-align-center">
                <p>This { props.resourceName } has { subPages.length } Sub { subPages === 1 ? 'age' : 'pages' }. Please delete all sub pages first.</p>
                <Button type="button" className="button button--reversed" onClick={hideModal}>Cancel</Button>
              </div>
            ) :  (
              <DeleteForm {...props}
                resource={ resource }
                relationName={'programme-highlight'}
                relationCount={programmesCount}
                closeEvent={ hideModal }
                deleteResource={highlightPagesResource.deleteResource}
              />
            )}
          </div>
        </Modal>
      )
    })
  }

  const renderCreateResource = (props, resource) => {
    const {
      resourceName,
      resources,
    } = props
    modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={ hideModal }
        title={`New ${resourceName}`}
        titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}>
        <div className="cms-modal__content">
          <Form 
            pages={resources.filter(p => !p['parent-highlight-page'])} 
            resource={null} 
            parent={resource}
            submitAction={highlightPagesResource.createResource} />
        </div>
      </Modal>
    ))
  }  

  const renderResources = (props) => {
    const {
      renderDeleteResource,
      renderUpdateResource,
      resourceName,
      resources,
    } = props
    if (!resources) return

    const renderRow = (resource, parent = null, first = false, last = false) => (
      <>
        <td>
          {parent &&
            <ButtonsContainer>              
              <Button 
                className="cms-button cms-button--icon" 
                onClick={() => reorderChildPage(resource, resource.position - 1)}
                disabled={positionLoading || first}>
                <Icon width="13" height="8" id="i-up-arrow" className="cms-button__icon" />
              </Button>
              <Button 
                className="cms-button cms-button--icon" 
                onClick={() => reorderChildPage(resource, resource.position + 1)}
                disabled={positionLoading || last}>
                <Icon width="13" height="8" id="i-admin-drop-arrow" className="cms-button__icon" />
              </Button>
            </ButtonsContainer>
          }
          {resource.title}
        </td>
        <td className="cms-table__actions">
        <ActionMenu name="Actions">
          <ActionMenuItem label="Edit" onClick={() => { renderUpdateResource(resource, props) }} />
          <ActionMenuItem label="Delete" onClick={() => { renderDeleteResource(resource, props) }} />
          <ActionMenuItem label="Manage Highlights" link={`/admin/highlights/${resource.id}`} />
          <ActionMenuItem label="Manage Images" link={`/admin/highlight-pages/${resource.id}/images`} />
          {!parent &&
            <ActionMenuItem label="Add Sub Page" onClick={() => {renderCreateResource(props, resource)}} />
          }
        </ActionMenu>
        </td>
      </>
    )

    if (resources.length === 0) {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>There are currently no {pluralize(resourceName)}, try creating some!</p>
          </div>
        </div>
      )
    }
    return (
      <div className="container">
        <table className="cms-table">
          <thead>
            <tr>
              <th colSpan={2}>{'Name'}</th>
            </tr>
          </thead>
          <ReorderableList<ProgrammeHighlightPageType>
            items={resources}
            onChange={({ item, newPosition }) => {
              highlightPagesResource.updateResource({
                id: item.id,
                position: newPosition,
              })
            }}
            droppableTag="tbody"
            draggableTag="tr"
            renderItem={({ item: resource }) => {
              const childPages = resource['programme-highlight-pages']
              if(childPages.length > 0){
                return <td colSpan={2} className="parent">
                  <table className="cms-table">
                    <tr>
                      {renderRow(resource)}
                    </tr>
                    {childPages.sort((a, b) => a.position - b.position).map((p, i) => {
                      return <tr>{renderRow(p, p['parent-highlight-page'], i === 0, i === childPages.length - 1)}</tr>
                    })}
                  </table>
                </td>
              } else {
                return renderRow(resource)
              }
            }}
          />
        </table>
      </div>
    )
  }

  const indexHelperProps = {
    ...props,
    meta,
    resourceName: 'Highlight Page',
    resources,
    updateResource,
    renderCreateResource,
    renderDeleteResource,
    renderResources,
  }
  return renderPageIndex(indexHelperProps)
}

const enhance = compose(
  withPageHelper,
  withIndexHelper,
)

export default enhance(ProgrammeHighlightPagesIndex)

const ButtonsContainer = styled.div`
  display: flex;
  float: left;
  width: 80px;
  justify-content: space-between;
  margin-right: 10px;
`