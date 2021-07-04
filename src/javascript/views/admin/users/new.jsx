import React from 'react'

// Stores
import UsersStore from 'javascript/stores/users'

// Components
import PageHeader from 'javascript/components/admin/layout/page-header'
import Icon from 'javascript/components/icon'
import Form from 'javascript/views/admin/users/form'
import Meta from 'react-document-meta'
import NavLink from 'javascript/components/nav-link'

class UsersNew extends React.Component {

  componentWillMount() {
    UsersStore.on('save', this.redirect)
  }

  componentWillUnmount() {
    UsersStore.removeListener('save', this.redirect)
    UsersStore.unsetResource()
  }

  redirect = () => {
    this.props.history.push('/admin/users/' + UsersStore.getResource())
  }

  render() {
    const { theme } = this.props
    return (
      <Meta
      title={`${theme.localisation.client} :: New User`}
      meta={{
        description: 'Create New User'
      }}>
      <main>
        <PageHeader title="New User">
          <NavLink to="/admin/users" className="button">
            <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
            Back to Users
          </NavLink>
        </PageHeader>
        <Form sessionUser={this.props.user} />
      </main>
      </Meta>
    )
  }
}


export default UsersNew