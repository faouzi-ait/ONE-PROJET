import React, { useEffect, useState } from 'react'

import compose from 'javascript/utils/compose'

import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
// Components
import { ActionMenuItem } from 'javascript/components/admin/action-menu'
import PermissionsForm from 'javascript/views/admin/groups/permissions'
import DeleteForm from 'javascript/components/admin/delete-form-confirm'
import Modal from 'javascript/components/modal'

// Hooks
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import { withRouter } from 'react-router-dom'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import withIndexHelper from 'javascript/components/hoc/with-index-helper'

const GroupsIndex = (props) => {
  const { theme } = props
  const meta = {
    title: `${theme.localisation.client} :: Groups`,
    meta: {
      description: `Edit and Create Groups`
    }
  }

  const groupsResource = useResource('group')

  const [pageNumber, setPageNumber] = useState(1)
  const [searchQuery, setSearchQuery] = useState(null)

  const getGroups = () => {
    const request = {
      fields: {
        'groups': 'name,users-count',
      },
      'page[number]': pageNumber,
      'page[size]': 20,
      sort: 'name'
    }
    if(searchQuery && searchQuery.length > 0) {
      request['filter[search]'] = searchQuery
    } else {
      delete request['filter[search]']
    }
    groupsResource.findAll(request)
  }

  useEffect(() => {
    getGroups()
  }, [pageNumber])

  useEffect(() => {
    setPageNumber(1)
    getGroups()
  }, [searchQuery])

  useWatchForTruthy(groupsResource.mutationState.succeeded, () => {
    getGroups()
    props.modalState.hideModal()
  })

  const renderDeleteResource = (resource, props) => {
    const userCount = resource['users-count']
    if (userCount === 0) {
      return groupsResource.deleteResource(resource)
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
              relationName={'user'}
              relationCount={resource['users-count']}
              closeEvent={ hideModal }
              deleteResource={groupsResource.deleteResource}
            />
          </div>
        </Modal>
      )
    })
  }

  const openPermissions = (resource) => {
    const modalModifiers = []
    if (theme.features.restrictions.expiring) {
      modalModifiers.push('large')
    }
    props.modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={hideModal}
        title={resource['name']}
        modifiers={modalModifiers}
      >
        <div className="cms-modal__content">
          <PermissionsForm resource={resource} />
        </div>
      </Modal>
    ))
  }

  const resources = groupsResource.getDataAsArray()

  const withPaginator = {
    pageNumber,
    totalPages: resources?.meta['page-count'],
    updatePageNumber: setPageNumber
  }

  const withSearch = {
    currentQuery: searchQuery,
    updateSearchQuery: setSearchQuery,
    placeholder: 'Search by group name'
  }

  const renderActionMenuItems = (resource) => {
    const menuItems = [
      <ActionMenuItem key="manage_permissions" label="Manage Permissions" divide onClick={() => openPermissions(resource)} />
    ]
    if (isAdmin(props.user) ||
        hasPermission(props.user, ['manage_external_users']) ||
        hasPermission(props.user, ['manage_internal_users'])) {
      menuItems.push(
        <ActionMenuItem key="manage_users" label="Manage Users" divide onClick={() => props.history.push(`/admin/groups/${resource.id}/users`)} />
      )
    }
    return menuItems
  }

  const updateResource = (resource) => {
    const update = {...resource}
    delete update['users-count']
    groupsResource.updateResource(update)
  }

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    createResource: groupsResource.createResource,
    meta,
    renderActionMenuItems,
    renderDeleteResource,
    resourceName: 'Group',
    resources,
    updateResource,
    withSearch,
    withPaginator,
  }
  return props.renderPageIndex(indexHelperProps)
}

const enhance = compose(
  withRouter,
  withModalRenderer,
  withIndexHelper,
)

export default enhance(GroupsIndex)
