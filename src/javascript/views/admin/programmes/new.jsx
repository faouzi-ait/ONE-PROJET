// React
import React from 'react'
import pluralize from 'pluralize'

// Store
import ResourceStore from 'javascript/stores/programmes'

// Components
import PageHeader from 'javascript/components/admin/layout/page-header'
import NavLink from 'javascript/components/nav-link'
import Icon from 'javascript/components/icon'
import Form from 'javascript/views/admin/programmes/form'

class ProgrammesNew extends React.Component {

  componentWillMount() {
    ResourceStore.on('save', this.redirect)
  }

  componentWillUnmount() {
    ResourceStore.removeListener('save', this.redirect)
    ResourceStore.unsetResource()
  }

  redirect = () => {
    this.props.history.push(`/admin/${this.props.theme.localisation.programme.path}/${ResourceStore.getResource()}`)
  }

  render() {
    const { theme } = this.props
    return (
      <main>
        <PageHeader title={ `New ${theme.localisation.programme.upper}` } >
          <NavLink to={ `/admin/${theme.localisation.programme.path}`} className="button">
            <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
            Back to { pluralize(theme.localisation.programme.upper) }
          </NavLink>
        </PageHeader>
        <Form />
      </main>
    )
  }
}

export default ProgrammesNew