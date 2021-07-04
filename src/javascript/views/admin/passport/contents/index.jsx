import React, { useState, useEffect } from 'react'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import Resource from 'javascript/components/admin/resource'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import { withRouter } from 'react-router-dom'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import withIndexHelper from 'javascript/components/hoc/with-index-helper'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportContentsIndex = (props) => {

  const [dragged, setDragged] = useState(false)
  const [contents, setContents] = useState(props.resources)

  const { localisation } = useTheme()

  useEffect(() => {
    setContents(props.resources)
  }, [props.resources])

  const renderUpdateResource = (resource) => {
    const { marketId } = props
    props.history.push(`/admin/${localisation.passport.market.path}/${marketId}/content/${resource.id}/edit`)
  }

  const renderCreateResource = () => {
    const { marketId } = props
    props.history.push(`/admin/${localisation.passport.market.path}/${marketId}/content/new`)
  }

  const renderResourceFields = (resource) => (
    <>
      <td>{ resource['description'] }</td>
      <td>{ resource['active'] ? 'Yes' : 'No' }</td>
    </>
  )

  const renderSubHeading = () => (
    <tr className="cms-table__row--bold" key={'sub-heading'}>
      <td>Name</td>
      <td>Description</td>
      <td>Active</td>
      <td></td>
    </tr>
  )

  const dragStart = (e, index) => {
    setDragged(index)
    e.dataTransfer.setData('text', e.currentTarget.getAttribute('data-reactid'))
  }

  const dragEnd = (index) => {
    let resource = contents[dragged]
    props.updateResource({
      id: resource.id,
      position: resource.position
    })
    setDragged(false)
  }

  const dragOver = (e, index) => {
    e.preventDefault()
    if (dragged !== index) {
      let resources = [...contents]
      resources[dragged].position = index + 1
      resources.splice(index, 0, resources.splice(dragged, 1)[0])
      setContents(resources)
      setDragged(index)
    }
  }

  const drop = (e) => {
    e.preventDefault()
  }

  const renderResources = (props, tableHeading) => {
    const {
      resourceName,
      renderUpdateResource,
      renderDeleteResource,
      viewOnly,
      renderSubHeading = () => null,
      renderResourceFields = () => null,
    } = props
    const subHeading = renderSubHeading()
    const resourceItems = (contents || []).sort((a, b) => a.position - b.position).map((resource, i) => {
      return (
        <Resource key={ resource.id }
          name={ resource.name }
          fields={() => renderResourceFields(resource)}
          draggable="true"
          onDragStart={(e) => { dragStart(e, i)}}
          onDragEnd={() => { dragEnd(i)}}
          onDragOver={(e) => { dragOver(e, i)}}
          onDrop={drop}
        >
          { viewOnly ? ( <div/> ) : (
              <ActionMenu name="Actions">
                <ActionMenuItem label="Edit" onClick={() => { renderUpdateResource(resource, props) }} />
                <ActionMenuItem label="Delete" onClick={() => { renderDeleteResource(resource, props) }} />
              </ActionMenu>
            )
          }
        </Resource>
      )
    })
    let defaultHeading = resourceItems.length === 0 ? null : (
      <thead>
        <tr>
          <th colSpan="2">Name</th>
        </tr>
      </thead>
    )
    return (
      <div className="container">
        <table className="cms-table">
          { tableHeading ? tableHeading : defaultHeading }
          <tbody>
            { (resourceItems.length > 0 && subHeading) ? subHeading : null }
            { resourceItems.length > 0 ? resourceItems : null }
          </tbody>
        </table>
        { resourceItems.length === 0 && (
            <div className="panel u-align-center">
              <p>There are currently no {pluralize(resourceName)}, try creating some!</p>
            </div>
        )}
      </div>
    )
  }

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    resourceName: localisation.passport.content.upper,
    renderResources,
    renderSubHeading,
    renderResourceFields,
    renderCreateResource,
    renderUpdateResource,
  }
  return props.renderTableIndex(indexHelperProps, 3)
}

const enhance = compose(
  withRouter,
  withModalRenderer,
  withIndexHelper,
  withHooks(props => {
    const { marketId } = props.match.params
    const relation = {
      'name': 'passport-market',
      'id': marketId
    }
    const contentsReduxResource = nameSpaced('passport', useReduxResource('passport-content', 'passport/contents', relation))

    const getContents = () => {
      contentsReduxResource.findAllFromOneRelation(relation, {
        fields: {
          'passport-contents': 'active,content-blocks,description,name,position'
        }
      })
    }

    useEffect(getContents, [])

    useWatchForTruthy(contentsReduxResource.mutationState.succeeded, () => {
      getContents()
      props.modalState.hideModal()
    })

    return {
      ...props,
      marketId,
      deleteResource: contentsReduxResource.deleteResource,
      updateResource: contentsReduxResource.updateResource,
      resources: contentsReduxResource.getReduxResources()
    }
  })
)

export default enhance(PassportContentsIndex)
