// React
import React, {useState, useEffect, useMemo} from 'react'
import JsFileDownload from 'js-file-download'
import deepEqual from 'deep-equal'
import moment from 'moment'

import allClientVariables from './variables'

import { applyValidFilters, retrieveAllFilters } from 'javascript/containers/filters/filter-tools'

import { ImpersonationStateComponent } from 'javascript/utils/hooks/use-impersonation-state'
import compose from 'javascript/utils/compose'
import iconClienVariables from 'javascript/components/icon/variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useResource from 'javascript/utils/hooks/use-resource'
import withPageHelper from 'javascript/components/hoc/with-page-helper'

// Services
import { hasPermission, hasAllPermissions, isAdmin } from 'javascript/services/user-permissions'

// Components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import AddToGroupForm from 'javascript/views/admin/users/add-to-group-form'
import AsyncSearchUser from 'javascript/components/async-search-users'
import BulkActionManager from 'javascript/components/bulk-selection/bulk-action-manager'
import BulkActionMenuItem from 'javascript/components/bulk-selection/actions/bulk-action-menu-item'
import BulkCheckbox from 'javascript/components/bulk-selection/selectors/bulk-checkbox'
import BulkToggleButton from 'javascript/components/bulk-selection/bulk-toggle-button'
import Button from 'javascript/components/button'
import DeleteForm from 'javascript/views/admin/users/delete'
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Paginator from 'javascript/components/paginator'
import PermissionsForm from 'javascript/views/admin/users/permissions'
import Resource from 'javascript/components/admin/users/user'
import TerritoriesForm from 'javascript/views/admin/users/territories'
import UserFilters from 'javascript/containers/filters/user-filter'
import LimitedAccess from 'javascript/views/admin/users/limited-access'


export const determineUserTypeFilter = (user) => {
  if(isAdmin(user) || hasAllPermissions(user, ['manage_internal_users', 'manage_external_users'])) {
    return {}
  } else if(hasPermission(user, 'manage_internal_users')) {
    return { 'filter[user-type]': 'internal' }
  } else if(hasPermission(user, 'manage_external_users')) {
    return { 'filter[user-type]': 'external' }
  }
}

const UsersIndex = (props) => {
  const {
    modalState,
    user,
    theme,
  } = props

  const usersQuery = ['first-name,last-name,company,roles,suspended,approval-status,created-at']
  if (theme.features.users.limitedAccess) {
    usersQuery.push('limited-access,user-type')
  }

  const searchQuery = {
    include: 'user,user.company,user.roles',
    fields: {
      'user-search-results': 'first-name,last-name,user',
      users: usersQuery.join(','),
      roles: 'name',
      companies: 'name,users-count'
    },
    sort: 'first-name',
  }

  const userTypeFilter = useMemo(() => determineUserTypeFilter(user), [user])
  const userSearchResource = useResource('user-search-result')
  const userResource = useResource('user')

  const usersCV = useClientVariables(allClientVariables)
  const displayCreatedAtColumn = usersCV.displayCreatedAtColumn === 'filtered' ? !!props.location.state?.filterState?.['filter[created-at]'] : usersCV.displayCreatedAtColumn

  const [users, setUsers] = useState(null)
  const [meta, setMeta] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)

  const [filtered, setFiltered] = useState(false)
  const [isFetchingUserResources, setIsFetchingUserResources] = useState(false)

  const [filterState, setFilterState] = useState({
    ...props.location.state?.filterState
  })

  const [exporting, setExporting] = useState(false)

  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  useEffect(() => {
    if (props.location.state && !deepEqual(filterState, props.location.state.filterState)) {
      setFilterState(props.location.state.filterState)
    }
    setFiltered(!!Object.keys(props.location.state?.filterState || {}).length)
  }, [props.location.state])


  useEffect(() => {
    props.history.push({ pathname: '/admin/users', state: { filterState: applyValidFilters({}, filterState)}})
  }, [filterState, pageSize, pageNumber])

  useEffect(() => {
    getUsers()
  }, [selectedUser, filterState, pageSize, pageNumber])

  const createQueryParams = () => {
    let query = {}
    if (selectedUser) {
      query = {
        ...searchQuery,
        'filter[id]': selectedUser.id
      }
    } else {
      query = applyValidFilters(searchQuery, userTypeFilter)
      query['page[number]'] = pageNumber
      query['page[size]'] = pageSize
      query['filter[with-aggregations]'] = true
      query = applyValidFilters(query, filterState)
    }
    return query
  }

  const getUsers = () => {
    setIsFetchingUserResources(true)
    const query = createQueryParams()
    userSearchResource.findAll(query)
      .then((response) => {
        props.pageIsLoading(false)
        const usersUpdate = response.map((result) => {
          return {
            ...result.user,
          }
        })
        usersUpdate.meta = response.meta
        setMeta(response.meta)
        setUsers(usersUpdate)
        setIsFetchingUserResources(false)
      })
  }

  const openFilters = () => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={hideModal}
        title="Filter your search"
        titleIcon={{
          id: 'i-filter',
          ...iconClienVariables['i-filter'].default
        }}
        modifiers={['filters', 'large']}>
        <div className="cms-modal__content">
          <UserFilters
            query={filterState}
            initialMeta={meta}
            onSubmit={(filterValues) => {
              if (filterValues) {
                setFilterState(filterValues)
                setPageNumber(1)
                setFiltered(!!Object.keys(filterValues).length)
              } else {
                clearFilters()
              }
            }}
            closeEvent={hideModal}
          />
        </div>
      </Modal>
    ))
  }

  const deleteResource = (resource) => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={ hideModal }
        title="Warning"
        modifiers={['warning']}
        titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
        <div className="cms-modal__content">
          <DeleteForm
            deleteResource={ resource }
            closeEvent={ hideModal }
            finishedDeleting={() => {
              hideModal()
              getUsers()
            }}
          />
        </div>
      </Modal>
    ))
  }

  const downloadUsersCSV = () => {
    setExporting(true)
    const query = createQueryParams()
    const filters = retrieveAllFilters(query)
    const queryString = Object.keys(filters).map((key)=>{return key + '=' + query[key]}).join('&')
    const jsonApi = userSearchResource.useApi()
    jsonApi.axios(`${jsonApi.apiUrl}/users/search?${queryString}&format=csv`, {
      method: 'GET',
      responseType: 'blob',
      headers: {
        ...jsonApi.headers,
        'Accept': 'text/csv'
      }
    })
    .then(({ data }) => {
      JsFileDownload(data, `Users.csv`)
      setExporting(false)
    })
  }

  const updatePage = (page, size = false) => {
    if (size) {
      setPageSize(parseInt(page))
      setPageNumber(1)
    } else {
      setPageNumber(parseInt(page))
    }
  }

  const clearFilters = () => {
    setFiltered(false)
    setPageNumber(1)
    setFilterState({})
  }

  const openLimitedAccess = (resource) => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={hideModal}
        title={`${resource['first-name']} ${resource['last-name']}`}
      >
        <div className="cms-modal__content">
          <LimitedAccess
            resource={resource}
            closeEvent={hideModal}
          />
        </div>
      </Modal>
    ))
  }

  const openPermissions = (resource) => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={hideModal}
        title={`${resource['first-name']} ${resource['last-name']}`}
        modifiers={['wide']}
      >
        <div className="cms-modal__content">
          <PermissionsForm
            resource={resource}
            closeEvent={hideModal}
          />
        </div>
      </Modal>
    ))
  }

  const openTerritories = (resource) => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={hideModal}
        title={`Territories for ${resource['first-name']} ${resource['last-name']}`}
      >
        <div className="cms-modal__content">
          <TerritoriesForm user={resource} closeEvent={hideModal} />
        </div>
      </Modal>
    ))
  }

  const suspendUser = (user, suspended) => () => {
    userResource.updateResource({
      id: user.id,
      suspended
    })
    .then(() => getUsers())
  }

  const renderManageLimitedAccess = (resource) => {
    const {theme} = props
    if (theme.features.users.limitedAccess &&
        resource['user-type'] === 'external' &&
        resource['limited-access']) {
      return  <ActionMenuItem label={`Manage ${theme.localisation.programme.upper} Access`} onClick={() => { openLimitedAccess(resource) }} />
    }
  }

  const canImpersonate = theme.features.users.impersonation && (isAdmin(user) || hasPermission(user, 'impersonate_users'))

  const canEditUserPermissions = isAdmin(user) ||
    hasPermission(user, ['manage_programmes']) ||
    hasPermission(user, ['manage_videos']) ||
    hasPermission(user, ['manage_asset_permissions'])

  const renderResources = () => {
    const resources = (users || []).map((resource, i) => {
      const company = resource.company ? resource.company.name : ''
      return (
        <ImpersonationStateComponent key={resource.id}>
          {({ beginImpersonation, status }) => (
            <Resource key={ i } name={ resource['first-name'] + ' ' + resource['last-name'] }
              company={ company } roles={ resource.roles } suspended={resource.suspended} status={resource['approval-status']}
              {...(displayCreatedAtColumn && { createdAt: moment(resource['created-at']).format(theme.features.formats.shortDate) })}
            >
              <BulkCheckbox id={resource.id} >
                <ActionMenu name="Actions">
                  <ActionMenuItem label="View" link={ '/admin/users/' + resource.id } />
                  <ActionMenuItem label="Edit" link={ '/admin/users/' + resource.id + '/edit' } />
                  <ActionMenuItem label="Delete" onClick={() => deleteResource(resource)} />
                  {status === 'not-impersonating' && !resource.suspended && canImpersonate && (
                    <ActionMenuItem label="Impersonate" onClick={() => beginImpersonation({ userId: resource.id })} />
                  )}
                  { canEditUserPermissions &&
                    <ActionMenuItem divide label="Manage Permissions" onClick={() => { openPermissions(resource) }} />
                  }
                  { renderManageLimitedAccess(resource) }
                  { (theme.features.territories.enabled || theme.features.territories.cms) &&
                    <ActionMenuItem label="Manage Territories" onClick={() => { openTerritories(resource) }} />
                  }
                  <ActionMenuItem divide
                    label={resource.suspended ? 'Unsuspend User':'Suspend User'}
                    onClick={suspendUser(resource, !resource.suspended)}
                  />
                </ActionMenu>
              </BulkCheckbox>
            </Resource>
          )}
        </ImpersonationStateComponent>
      )
    })

    const hasGroupPermission = theme.features.groups.enabled && (hasPermission(user, 'manage_groups') || isAdmin(user))
    if(resources.length > 0) {
      return (
        <div className="container">
          <BulkActionManager
            hits={meta.hits}
            resourceName={'user'}
            renderActions={(disabled) => (
              <>
                { hasGroupPermission &&
                  <ActionMenu
                    name="Bulk Actions"
                    disabled={disabled}
                  >
                    <BulkActionMenuItem
                      label="Add to Group"
                      bulkAction={(selectedResources) => new Promise((resolve, reject) => {
                        modalState.showModal(({ hideModal }) => (
                          <Modal
                            closeEvent={() => {
                              hideModal()
                              reject(null)
                            }}
                            title={'Add to Group'}
                          >
                            <div className="cms-modal__content">
                              <AddToGroupForm
                                selectedUsers={selectedResources}
                                onCompletion={(err) => {
                                  hideModal()
                                  if (err) reject(err)
                                  resolve()
                                }}
                              />
                            </div>
                          </Modal>
                        ))
                      })}
                    />
                  </ActionMenu>
                }
              </>
            )}
          >
          </BulkActionManager>
          <table className="cms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th colSpan="2">Roles</th>
                {displayCreatedAtColumn &&
                  <th>Created Date</th>
                }
                <th><BulkToggleButton /></th>
              </tr>
            </thead>
            <tbody>
              { resources }
            </tbody>
          </table>
        </div>
      )
    } else {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>There are currently no users, try creating some!</p>
          </div>
        </div>
      )
    }
  }

  const exportButtonClasses = ['button', 'small', 'filled', exporting && 'loading'].join(' button--')

  const openFiltersButtonClasses = isFetchingUserResources
    ? 'button button--filled-bg page-controls__right button--loading'
    : 'button button--filled-bg page-controls__right'


  return (
    <Meta
      title={`${theme.localisation.client} :: Users`}
      meta={{
        description: 'Edit and Create Users'
      }}>
      <main>
        <PageHeader title="Manage Users" subtitle={`${users && meta['record-count']} ${
            users && meta['record-count'] && meta['record-count'] === 1
              ? 'User'
              : 'Users'
          }`}>
          <NavLink to="/admin/users/new" className="button">
            <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
            New User
          </NavLink>
        </PageHeader>
        <div className="intro">
          <div className="container">
            <Button className={exportButtonClasses}
              onClick={downloadUsersCSV}
              disabled={users && meta['record-count'] === 0}
            >
              {`Export ${users ? meta['record-count'] : 'All'} Users (.csv)`}
            </Button>
          </div>
        </div>

        <div className="container">
          <div className="page-actions">
            <div className="cms-form__control">
                <AsyncSearchUser
                  userFilters={{ /* async search does not care about filters - searches all */ }}
                  value={selectedUser}
                  onChange={(user) => {
                    clearFilters()
                    setSelectedUser(user)
                  }}
                />
            </div>
            { !selectedUser && (
              <>
                {filtered &&
                  <Button type="button"
                    className="text-button text-button--error page-controls__right"
                    style={{position: 'relative', bottom: '-2px', margin: '0 5px', height: '34px'}}
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                }
                <Button onClick={openFilters} className={openFiltersButtonClasses} style={{height: '45px'}}>
                  { !isFetchingUserResources && (
                    <>
                      <Icon width="24" height="20" classes="button__icon" id="i-filter" />
                      {filtered ? 'Filters Applied' : 'Filters'}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        { users && renderResources() }

        {(meta['page-count'] > 1 || users?.length >= 50) && (
          <Paginator currentPage={ pageNumber } totalPages={ meta['page-count'] } onChange={ updatePage } onPageSizeChange={(page) => updatePage(page, true)} currentPageSize={pageSize}/>
        )}
      </main>
    </Meta>
  )
}

const enhance = compose(
  withPageHelper,
)

export default enhance(UsersIndex)