import React, { useEffect, useState } from 'react'
import JsFileDownload from 'js-file-download'
import Meta from 'react-document-meta'
import NavLink from 'javascript/components/nav-link'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withModalRenderer, { WithModalType } from 'javascript/components/hoc/with-modal-renderer'

// Components
import { ActionMenu } from 'javascript/components/admin/action-menu'
import BulkActionManager from 'javascript/components/bulk-selection/bulk-action-manager'
import BulkActionMenuItem from 'javascript/components/bulk-selection/actions/bulk-action-menu-item'
import BulkCheckbox from 'javascript/components/bulk-selection/selectors/bulk-checkbox'
import BulkToggleButton from 'javascript/components/bulk-selection/bulk-toggle-button'
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Paginator from 'javascript/components/paginator'
import UserForm from 'javascript/views/admin/groups/users/form'
import { RouteComponentProps } from 'react-router'
import { WithThemeType } from 'javascript/utils/theme/withTheme'


interface MatchParams {
  groupId: string
}

interface Props extends RouteComponentProps<MatchParams>, WithModalType, WithThemeType {}

const GroupsUsersIndex: React.FC<Props> = ({
  theme,
  match,
  modalState,
}) => {
  const pageMeta = {
    title: `${theme.localisation.client} :: Groups Users`,
    meta: {
      description: `Manage and Edit Users within Groups`
    }
  }
  const { groupId } = match.params

  const [pageNumber, setPageNumber] = useState(1)
  const [userSearch, setUserSearch] = useState('')
  const [groupName, setGroupName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const groupResource = useResource('group')
  const usersResource = useResource('user')
  const usersSearchResource = useResource('user-search-result')

  const [users, setUsers] = useState([])
  const [usersMeta, setUsersMeta] = useState({})
  const totalPages = usersMeta['page-count'] || 0

  const getUsers = () => {
    const query = {
      include: 'user,user.company,user.groups',
      fields: {
        'user-search-results': 'id,user',
        'users': 'first-name,last-name,suspended,company,groups',
        'companies': 'name',
        'groups': 'name'
      },
      'page[number]': pageNumber,
      'page[size]': 20,
      'sort': 'first-name',
      'filter[groups]': groupId
    }
    if (userSearch) {
      query['filter[keywords]'] = userSearch
    }
    usersSearchResource.findAll(query)
    .then((response) => {
      setUsers(response.map((usr) => usr['user']))
      setUsersMeta(response.meta)
    })
  }

  useEffect(() => {
    groupResource.findOne(groupId, {
      fields: {
        'groups': 'name'
      }
    }).then((response) => {
      setGroupName(response.name || '')
    })
  }, [])

  useEffect(() => {
    getUsers()
  }, [pageNumber, userSearch])


  const removeUserFromGroup = (user) => (e) => {
    setIsLoading(user.id)
    const update = {...user}
    update.groups = update.groups.filter((grp) => grp.id !== groupId)
    usersResource.updateResource(update)
    .then((response) => {
      setTimeout(() => {
        getUsers()
        setIsLoading(false)
      }, 1000)
    })
  }

  const renderUserResources = () => {
    const resources = (users || []).map(user => {
      const buttonClasses = ['button', 'filled', 'small', isLoading === user.id && 'loading'].join(' button--')
      return (
        <tr className="with-action">
          <td>
            { user['first-name'] + ' ' + user['last-name'] }
          </td>
          <td>{ user?.company?.name }</td>
          <td>
            {user.suspended &&
              <span className="count count--error">Suspended</span>
            }
          </td>
          <td className="cms-table__actions">
            <BulkCheckbox id={user.id} >
              <Button className={buttonClasses} style={{minWidth: '130px'}} onClick={removeUserFromGroup(user)}>Remove User</Button>
            </BulkCheckbox>
          </td>
        </tr>
      )
    })
    if (resources.length > 0) {
      return (
        <div className="container">
          <BulkActionManager
            hits={usersMeta['hits']}
            resourceName={'user'}
            renderActions={(disabled) => (
              <ActionMenu
                name="Bulk Actions"
                disabled={disabled}
              >
                <BulkActionMenuItem label="Remove Users" bulkAction={(selectedResouces) => new Promise<void>((resolve, reject) => {
                    const jsonApi = usersResource.useApi()
                    setIsLoading(true)
                    jsonApi.axios(`${jsonApi.apiUrl}/bulk-user-groups/delete`, {
                      method: 'DELETE',
                      headers: {
                        ...jsonApi.headers,
                      },
                      data: {
                        data: {
                          type: 'bulk-delete-user-groups',
                          attributes: {
                            'user-ids': selectedResouces,
                            'group-ids': [groupId]
                          }
                        }
                      }
                    })
                    .then((response) => {
                      getUsers()
                      setIsLoading(false)
                      resolve()
                    })
                    .catch(reject)
                  })}
                />
              </ActionMenu>
            )}
          />
          <table className="cms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th></th>
                <th><BulkToggleButton /></th>
              </tr>
            </thead>
            <tbody>{resources}</tbody>
          </table>
        </div>
      )
    } else {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>
              There are currently no users assigned to this group!
            </p>
          </div>
        </div>
      )
    }
  }

  const handleSearchUsers = () => {
    let inDebounce
    return (e) => {
      const targetValue = e.target.value
      clearTimeout(inDebounce)
      inDebounce = setTimeout(() => {
        setPageNumber(1)
        setUserSearch(targetValue)
      }, 1000)
    }
  }

  const renderAddUserForm = () => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          title={`Add User to Group`}
          closeEvent={hideModal}>
          <div className="cms-modal__content">
            <UserForm
              groupId={groupId}
              onClose={hideModal}
              onSave={() => setTimeout(getUsers, 1000)}
            />
          </div>
        </Modal>
      )
    })
  }

  const downloadUsersCSV = () => {
    setExporting(true)
    const jsonApi = usersSearchResource.useApi()
    jsonApi.axios(`${jsonApi.apiUrl}/users/search?filter[groups]=${groupId}&format=csv`, {
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

  const exportButtonClasses = ['button', 'small', 'filled', exporting && 'loading'].join(' button--')

  return (
    <Meta {...pageMeta} >
      <main>
        <PageHeader
          title={`Manage Group Users ${groupName ? `- ${groupName}` : ''}`}
          subtitle={`${users && usersMeta['record-count']
            ? usersMeta['record-count']
            : '0'
          }
            ${users && usersMeta['record-count'] === 1
              ? 'user'
              : 'users'
          }`}
        >
          <Button className="button" onClick={renderAddUserForm}>
            <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
            Add User
          </Button>
        </PageHeader>

        <div className="container">
          <div className="page-actions">
            <NavLink to={`/admin/groups`} className="button">
              <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
              Back to Groups
            </NavLink>
            <Button className={exportButtonClasses}
              onClick={downloadUsersCSV}
              disabled={users && usersMeta['record-count'] === 0}
            >
              {`Export ${users ? usersMeta['record-count'] : 'All'} Users (.csv)`}
            </Button>
          </div>
        </div>
        <div className="container">
          <div className="page-actions">
            <div className="cms-form__control">
              <input type="text" className="cms-form__input"
                name="filter[search]"
                defaultValue={''}
                placeholder="Filter by name or company"
                onChange={handleSearchUsers()}
              />
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="loader" style={{top: '35%'}}/>
        )}
        {renderUserResources()}
        <Paginator currentPage={ pageNumber } totalPages={ totalPages } onChange={ setPageNumber } />
      </main>
    </Meta>
  )
}

const enhance = compose(
  withModalRenderer,
)

export default enhance(GroupsUsersIndex)