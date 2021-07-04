import React from 'react'
import deepmerge from 'deepmerge-concat'

import userFormClientVariables from 'javascript/views/admin/users/form/variables'

import { hasPermission, isAdmin } from 'javascript/services/user-permissions'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

// Stores
import UsersStore from 'javascript/stores/users'

// Actions
import UsersActions from 'javascript/actions/users'

// Components
import PageHeader from 'javascript/components/admin/layout/page-header'
import Icon from 'javascript/components/icon'
import Form from 'javascript/views/admin/users/form'
import NavLink from 'javascript/components/nav-link'
import NotFound from 'javascript/views/404'

class UsersEdit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      resource: null,
    }
  }

  componentWillMount() {
    UsersStore.on('change', this.getResources)
    UsersStore.on('save', this.redirect)
  }

  componentWillUnmount() {
    UsersStore.removeListener('change', this.getResources)
    UsersStore.removeListener('save', this.redirect)
    UsersStore.unsetResource()
  }

  componentDidMount() {
    const { theme } = this.props
    const easytrack = theme.features.rightsManagement.includes('easytrack')
    const users = [
      'roles,company,first-name,last-name,title,email,job-title,telephone-number',
      'user-type,approval-status,all-programmes-access,all-videos-access',
      'mobile-number,mobile-country-code,image,buyer-type,external-id',
      theme.features.producerHub && 'production-companies'
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
        roles: 'name',
        ...theme.features.producerHub && {
          'production-companies': 'name',
        },
        companies: 'name',
      },
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
      // please note that account-managers (plural) is not a typo,
      // it is a relation account managers <-> sales coordinators,
      // whilst account-manager (singular) is AM for external user
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
          territories: 'name'
        }
      })
    }

    if (theme.features.users.genres) {
      query = deepmerge.concat(query, {
        include: 'genres',
        fields: {
          users: 'genres',
          genres: 'name,id',
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

    if (theme.features.users.limitedAccess) {
      query = deepmerge.concat(query, {
        fields: {
          users: 'limited-access',
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

    if (theme.features.users.country) {
      query = deepmerge.concat(query, {
        fields: {
          users: 'country-code',
        }
      })
    }

    if (this.props.userFormCV.createdDate) {
      query = deepmerge.concat(query, {
        fields: {
          users: 'created-at',
        }
      })
    }

    UsersActions.getResource(this.props.match.params.user, query)
  }

  redirect = () => {
    this.props.history.push('/admin/users/' + this.state.resource.id)
  }

  getResources = () => {
    this.setState({
      resource: UsersStore.getResource(),
    })
  }

  isPermitted() {
    const { user } = this.props
    if(isAdmin(user)) {
      return true
    } else if(this.state.resource['user-type'] == 'external') {
      return hasPermission(user, 'manage_external_users')
    } else {
      return hasPermission(user, 'manage_internal_users')
    }
  }

  render() {
    if (!this.state.resource) {
      return (
        <main>
          <PageHeader title="Edit User" />
          <div className="container">
            <div className="loader"></div>
          </div>
        </main>
      )
    } else if (this.isPermitted()) {
      return (
        <main>
          <PageHeader title="Edit User">
            <NavLink to="/admin/users" className="button">
              <Icon width="8" height="13" id="i-admin-back" classes="button__icon"/>
              Back to Users
            </NavLink>
          </PageHeader>
          <Form
            user={this.state.resource}
            sessionUser={this.props.user}
          />
        </main>
      )
    } else {
      return <NotFound />
    }
  }
}

const enhance = compose(
  withClientVariables('userFormCV', userFormClientVariables)
)

export default enhance(UsersEdit)