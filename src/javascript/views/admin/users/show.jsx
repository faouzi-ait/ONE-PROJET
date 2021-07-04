// React
import React from 'react'
import deepmerge from 'deepmerge-concat'
import pluralize from 'pluralize'

import buyerTypeClientVariables from 'javascript/views/sessions/register/buyer-type.variables'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

// Store
import UsersStore from 'javascript/stores/users'

// Actions
import UsersActions from 'javascript/actions/users'

// Components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Icon from 'javascript/components/icon'



class UserShow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      resource: null,
      loaded: false
    }
    this.easytrack = props.theme.features.rightsManagement.includes('easytrack')
  }

  componentWillMount() {
    UsersStore.on('change', this.getResources)
  }

  componentWillUnmount() {
    UsersStore.removeListener('change', this.getResources)
    UsersStore.unsetResource()
  }

  componentDidMount() {
    const { theme } = this.props
    const users = [
      'title,first-name,last-name,roles,company,job-title,telephone-number',
      'email,user-type,approval-status,all-programmes-access,mobile-number',
      'mobile-country-code,image,external-id',
      theme.features.producerHub && 'production-companies',
    ].filter(Boolean).join(',')

    let query = {
      include: [
        'roles',
        'company',
        theme.features.producerHub && 'production-companies',
      ]
        .filter(Boolean)
        .join(','),
      fields: {
        users,
        companies: 'name',
        ...theme.features.producerHub && {
          'production-companies': 'name',
        },
        roles: 'name',
      }
    }

    if(Object.keys(theme.variables.BuyerTypes).length > 0){
      query = deepmerge.concat(query, {
        fields: {
          users: 'buyer-type'
        }
      })
    }

    if (theme.features.accountManager) {
      query = deepmerge.concat(query, {
        include: 'account-manager',
        fields: {
          users: 'account-manager',
        }
      })
    }

    if (theme.features.salesCoordinators) {
      query = deepmerge.concat(query, {
        include: 'account-managers,sales-coordinators',
        fields: {
          users: 'account-managers,sales-coordinators',
        }
      })
    }

    if (theme.features.territories.enabled || theme.features.territories.cms) {
      query = deepmerge.concat(query, {
        include: 'territories',
        fields: {
          users: 'territories',
          territories: 'name'
        }
      })
    }

    if (theme.features.regions.enabled) {
      query = deepmerge.concat(query, {
        include: 'regions',
        fields: {
          users: 'regions',
          regions: 'name'
        }
      })
    }

    if (theme.features.users.genres) {
      query = deepmerge.concat(query, {
        include: 'genres',
        fields: {
          users: 'genres',
          genres: 'name',
        }
      })
    }

    if (theme.features.dashboard.admin) {
      query = deepmerge.concat(query, {
        include: 'programmes',
        fields: {
          users: 'programmes'
        }
      })
    }

    if (theme.features.users.marketing && theme.features.users.marketing.enabled) {
      query = deepmerge.concat(query, {
        fields: {
          users: 'marketing'
        }
      })
    }

    if (theme.features.groups.enabled) {
      query = deepmerge.concat(query, {
        include: 'groups',
        fields: {
          users: 'groups',
          groups: 'name'
        }
      })
    }

    if (theme.features.programmeTypes.preferences) {
      query = deepmerge.concat(query, {
        include: 'programme-types',
        fields: {
          users: 'programme-types',
          'programme-types': 'name'
        }
      })
    }

    UsersActions.getResource(this.props.match.params.user, query)
  }

  getResources = () => {
    this.setState({
      resource: UsersStore.getResource(),
      loaded: true
    })
  }

  accountManagerRoleIsSelected = (resource) => {
    return resource['user-type'] === 'internal' && !!resource.roles.filter(role => role.name == 'account_manager').length
  }

  renderResource = () => {
    const { resource } = this.state
    const { buyerTypeCV, theme } = this.props
    return (
      <div className="container">
        <div className="page-actions">
          <ActionMenu name="Actions">
            <ActionMenuItem label="Edit" link={'/admin/users/' + resource.id + '/edit'} />
          </ActionMenu>
        </div>
        <table className="cms-table cms-table--programme">
          <tbody>
            {resource['approval-status'] &&
              <tr>
                <td><strong>Status</strong></td>
                <td>{resource['approval-status'].charAt(0).toUpperCase() + resource['approval-status'].slice(1)}</td>
              </tr>
            }
            <tr>
              <td><strong>Title</strong></td>
              <td>{resource['title']}</td>
            </tr>
            <tr>
              <td><strong>First Name</strong></td>
              <td>{resource['first-name']}</td>
            </tr>
            <tr>
              <td><strong>Last Name</strong></td>
              <td>{resource['last-name']}</td>
            </tr>
            {resource.company &&
              <tr>
                <td><strong>Company</strong></td>
                <td>{resource.company.name}</td>
              </tr>
            }
            <tr>
              <td><strong>Job title</strong></td>
              <td>{resource['job-title']}</td>
            </tr>
            <tr>
              <td><strong>Telephone</strong></td>
              <td>{resource['telephone-number']}</td>
            </tr>
            <tr>
              <td><strong>Mobile</strong></td>
              <td>
                { resource['mobile-country-code'] && resource['mobile-country-code'].length ? (
                    `(${resource['mobile-country-code']})  ${resource['mobile-number']}`
                  ) : (
                    resource['mobile-number']
                  )
                }
              </td>
            </tr>
            <tr>
              <td><strong>Email</strong></td>
              <td><a href={'mailto:' + resource['email']}>{resource['email']}</a></td>
            </tr>
            {this.easytrack &&
              <tr>
                <td><strong>EasyTrack ID</strong></td>
                <td>{resource['external-id']}</td>
              </tr>
            }
            {theme.features.users.genres &&
              <tr>
                <td><strong>Genre Interests</strong></td>
                <td>{resource['genres'].map((genre) => { return genre.name }).join(', ')}</td>
              </tr>
            }
            {theme.features.programmeTypes.preferences &&
              <tr>
                <td><strong>{pluralize(theme.localisation.programmeType.upper)}</strong></td>
                <td>{resource['programme-types'].map((programmeType) => programmeType.name).join(', ')}</td>
              </tr>
            }
            {theme.features.dashboard.admin &&
              <tr>
                <td><strong>{`Shared ${pluralize(theme.localisation.programme.upper)}`}</strong></td>
                <td>
                  <div className="Select-multi-value-view-wrapper">
                    {resource['programmes'].map((programme) => <span className="Select-value" > {programme['title-with-genre']} </span>)}
                  </div>
                </td>
              </tr>
            }

            <tr>
              <td><strong>User Type</strong></td>
              <td>{resource['user-type']}</td>
            </tr>

            {theme.features.accountManager && resource['user-type'] === 'external' &&
              <tr>
                <td><strong>{theme.localisation.accountManager.upper}</strong></td>
                <td>{resource['account-manager'] && resource['account-manager']['first-name'] + ' ' + resource['account-manager']['last-name']}</td>
              </tr>
            }
            { (theme.features.territories.enabled || theme.features.territories.cms) &&
              <tr>
                <td><strong>Territories</strong></td>
                <td>{resource['territories'].map(territory => territory['name']).join(', ')}</td>
              </tr>
            }
            { theme.features.regions.enabled &&
              <tr>
                <td><strong>Regions</strong></td>
                <td>{resource['regions'].map(region => region['name']).join(', ')}</td>
              </tr>
            }
            {theme.features.groups.enabled && (
              <tr>
                <td><strong>Groups</strong></td>
                <td>{resource.groups.map((group) => group.name).join(', ')}</td>
              </tr>
            )}
            {resource['user-type'] === 'internal' &&
              <tr>
                <td><strong>Roles</strong></td>
                <td>
                  <ul>
                    {resource.roles.map((role) => {
                      return <li key={role.id}>{role.name.charAt(0).toUpperCase() + role.name.substring(1).replace(/_/g, ' ')}</li>
                    })}
                  </ul>
                </td>
              </tr>
            }
            { theme.features.salesCoordinators && this.accountManagerRoleIsSelected(resource) &&
              <tr>
                <td><strong>Sales coordinators</strong></td>
                <td>{ resource['sales-coordinators'].map(user => user['first-name'] + ' ' + user['last-name']).join(', ') }</td>
              </tr>
            }
            { theme.features.salesCoordinators && resource['user-type'] === 'internal' && !!resource.roles.filter(role => role.name == 'sales_coordinator').length &&
              <tr>
                <td><strong>Account managers</strong></td>
                <td>{ resource['account-managers'].map(user => user['first-name'] + ' ' + user['last-name']).join(', ') }</td>
              </tr>
            }
            { theme.features.producerHub &&
              <tr>
                <td><strong>Production Companies</strong></td>
                <td>{ resource['production-companies'].map(p => p.name).join(', ') }</td>
              </tr>
            }
            { resource['user-type'] === 'external' && Object.keys(theme.variables.BuyerTypes).length > 0 &&
              <tr>
                <td><strong>{buyerTypeCV.buyerTypeLabel}</strong></td>
                <td>{resource['buyer-type']}</td>
              </tr>
            }
            {resource['user-type'] === 'internal' &&
              <tr>
                <td><strong>Can access all programmes</strong></td>
                <td>{resource['all-programmes-access'] ? <span>Yes</span> : <span>No</span>}</td>
              </tr>
            }
            { resource.image && this.accountManagerRoleIsSelected(resource) &&
              <tr>
                <td><strong>Image</strong></td>
                <td>
                  <img src={resource.image.admin_preview.url} />
                </td>
              </tr>
            }
            {theme.features.users.marketing && theme.features.users.marketing.enabled &&
              <tr>
                <td><strong>Marketing</strong></td>
                <td>{resource['marketing'] === null ? 'Unset' : ( resource['marketing'] ? <span>Yes</span> : <span>No</span>)}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    )
  }

  render() {
    if (!this.state.loaded) {
      return (
        <main>
          <PageHeader title="User Details" />
          <div className="container">
            <div className="loader"></div>
          </div>
        </main>
      )
    } else {
      return (
        <main>
          <header class="page-header">
            <div class="container">
              <div>
                <h1 class="page-header__title">{this.state.resource['first-name'] + ' ' + this.state.resource['last-name']}</h1>
                <span className='page-header__status'>{this.state.resource['user-type'].charAt(0).toUpperCase() + this.state.resource['user-type'].substring(1)}</span>
              </div>
              <NavLink to="/admin/users" className="button">
                <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
                Back to Users
              </NavLink>
            </div>
          </header>
          {this.renderResource()}
        </main>
      )
    }
  }
}

const enhance = compose(
  withClientVariables('buyerTypeCV', buyerTypeClientVariables),
)

export default enhance(UserShow)

