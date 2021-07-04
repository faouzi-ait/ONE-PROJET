import React from 'react'
import pluralize from 'pluralize'
import Meta from 'react-document-meta'

import Button from 'javascript/components/button'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import PageHeader from 'javascript/components/admin/layout/page-header'
import { ListNavigator, ListNavigatorColumn } from 'javascript/components/admin/list-navigator'
import Notification from 'javascript/components/notification'
import UsersService from "javascript/services/users"
import CompaniesService from 'javascript/services/companies'

import UsersActions from 'javascript/actions/users'
import UsersStore from 'javascript/stores/users'

import { query } from 'javascript/utils/apiMethods'
import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'


class PermissionsIndex extends PageHelper {
  constructor(props) {
  	super(props)
 	  this.state = props.location.state ? props.location.state : {
		  from: {
        users: [],
        companies: [],
        groups: [],
        usersQuery: '',
        companiesQuery: '',
        groupsQuery: '',
        type: 'users'
      },
      to: {
        users: [],
        companies: [],
        groups: [],
        usersQuery: '',
        companiesQuery: '',
        groupsQuery: '',
        type: 'users'
      },
      selection: {
        from: '',
        to: {
          users: [],
          companies: [],
          groups: [],
        }
      },
      loaded: true
    }
  }
  componentWillMount(){
    UsersStore.on('duplicate', this.reset)
    UsersStore.on('error', this.retrieveErrors)
  }
  componentWillUnmount(){
    UsersStore.removeListener('duplicate', this.reset)
    UsersStore.removeListener('error', this.retrieveErrors)
  }
  retrieveErrors = () => {
    this.setState({
      apiErrors: UsersStore.getErrors(),
      loading: false
    })
  }
  renderErrors = () => {
    if(this.state.apiErrors) {
      return (
        <ul className="cms-form__errors">
          { Object.keys(this.state.apiErrors).map((key, i) => {
            const error = this.state.apiErrors[key]
            return (
              <li key={ i }>{ key.charAt(0).toUpperCase() + key.slice(1) } { error }</li>
            )
          }) }
        </ul>
      )
    }
  }

  reset = () => {
    this.setState({
      selection: {
        ...this.state.selection,
        to: {
          users: [],
          companies: [],
          groups: [],
        }
      },
      loading: false,
      complete: true,
      from: {
        ...this.state.from,
        type: 'users',
      },
      to: {
        ...this.state.to,
        type: 'users'
      },
    })
  }

  selectFrom = (selectedItem) => {
    const update = this.state.selection
    if(update.from === selectedItem){
      update.from = ''
    } else {
      update.from = selectedItem
    }
    this.setState({
      selection: {
        ...this.state.selection,
        from: update.from
      },
      complete: false
    })
  }

  selectTo = (selectedItem) => {
    const update = this.state.selection.to[this.state.to.type]
    if(update.includes(selectedItem)){
      update.splice(update.indexOf(selectedItem), 1)
    } else {
      update.push(selectedItem)
    }
    this.setState({
      selection: {
        ...this.state.selection,
        to: {
          ...this.state.selection.to,
          [this.state.to.type] : update
        }
      },
      complete: false
    })
  }

  search = (search, group) => {
    const value = search.toLowerCase()
    const type = this.state[group].type
    const usersSelected = type === 'users'
    const searchService = usersSelected ? UsersService : CompaniesService
    let fields = usersSelected ? {
      users: 'first-name,last-name'
    } : {
      companies: 'name'
    }
    clearTimeout(this.searchTimer)
    this.setState({
      [group]: {
        ...this.state[group],
        [`${type}Query`]: value
      },
    });
    this.searchTimer = setTimeout(() => {
      this.props.searchAPI(value, type).then((options) => {
        const update = {...this.state}
        update[group][type] = options
        this.setState(update)
      })
    }, 500)
  }

  duplicate = (e) => {
    this.setState({ loading: true })
    e.preventDefault()
    const duplicates = {
      'from_id' : this.state.selection.from.id,
      'from_type' : pluralize.singular(this.state.selection.from.type),
      'users_ids' : this.state.selection.to.users.map(user => user.id).join(','),
      'companies_ids' : this.state.selection.to.companies.map(company => company.id).join(','),
      'groups_ids': this.state.selection.to.groups.map(group => group.id).join(','),
    }
    UsersActions.duplicateUser(duplicates)
  }

  setType = (value, group) => {
    this.setState({
      [group]: {
        ...this.state[group],
        type: value
      }
    })
  }

  fromAndToHaveValues = () => {
    if (!this.state.selection.from) return false
    const selectionTo = this.state.selection.to
    return !!(selectionTo.users.length || selectionTo.companies.length || selectionTo.groups.length)
  }

  render() {
    const { selection, loading } = this.state
    const { theme } = this.props
    const buttonClasses = loading === true ? 'button button--filled button--loading' : 'button button--filled'
    const fromName = this.state.from.type === 'users' ? 'first-name' : 'name'
    const toName = this.state.to.type === 'users' ? 'first-name' : 'name'
    return (
      <Meta
        title={`${theme.localisation.client} :: Permissions`}
        meta={{
          description: 'Copy Permissions'
        }}>
      <PageLoader {...this.state}>
        <main>
          { this.state.complete &&
            <Notification complete={true}>Permissions Copied</Notification>
          }
          <PageHeader title={ `Copy ${pluralize(theme.localisation.permissions.upper)}` } subtitle={ `You can copy ${pluralize(theme.localisation.permissions.lower)} from a company or individual to multiple people.` }>
          </PageHeader>
          <div className="container">
            <div className="list-controls">
              { this.renderErrors() }
            </div>
          </div>
      		<div className="container cms-form--large">
	            <ListNavigator>

	              <ListNavigatorColumn
                  modifiers={['half']}
                  loading={ this.state.loadingUsersFrom }
                  selected={ selection.from }
                  title="Copy FROM"
                  items={this.state.from[this.state.from.type]}
                  onClick={ this.selectFrom }
                  nameIdentifier={ fromName }
                  name2Identifier="last-name"
                  display={ true }
                  onSearch={(e) => this.search(e.target.value, 'from')}
                  value={this.state.from[`${this.state.from.type}Query`]}
                  placeholder={`Search for a ${pluralize.singular(this.state.from.type)}...`}
                  tabs={['users', 'companies', 'groups']}
                  activeTab={ this.state.from.type }
                  onTab={(e) => this.setType(e.currentTarget.innerHTML.toLowerCase(), 'from')}
                  showCompany>

                  { this.state.from[`${this.state.from.type}Query`] && this.state.from[`${this.state.from.type}Query`].length && this.state.from[this.state.from.type] && this.state.from[this.state.from.type].length < 1 &&
                    <p class="cms-list-navigator__no-results">No {pluralize(this.state.from.type)} found</p>
                  }

                </ListNavigatorColumn>
                <ListNavigatorColumn
                  modifiers={['half']}
                  title="Copy TO"
                  items={ this.state.to[this.state.to.type] && this.state.to[this.state.to.type].filter((item) => item !== selection.from) }
                  onClick={ this.selectTo }
                  nameIdentifier={ toName }
                  name2Identifier="last-name"
                  onSearch={(e) => this.search(e.target.value, 'to')}
                  display={selection.from !== ''}
                  hideSearch={selection.from === ''}
                  value={this.state.to[`${this.state.to.type}Query`]}
                  showToggle={ true }
                  multiSelected={ selection.to[this.state.to.type] }
                  placeholder={`Search for a ${pluralize.singular(this.state.to.type)}...`}
                  tabs={['users', 'companies', 'groups']}
                  activeTab={ this.state.to.type }
                  onTab={(e) => this.setType(e.currentTarget.innerHTML.toLowerCase(), 'to')}
                  showCompany>

                  {this.state.to[`${this.state.to.type}Query`] && this.state.to[`${this.state.to.type}Query`].length && this.state.to[this.state.to.type] && this.state.to[this.state.to.type].length < 1 &&
                    <p class="cms-list-navigator__no-results">No {pluralize(this.state.to.type)} found</p>
                  }

                </ListNavigatorColumn>

	            </ListNavigator>
              <div className="cms-form__control cms-form__control--actions">
                <Button className={ buttonClasses } onClick={ this.duplicate } disabled={!this.fromAndToHaveValues()}>Copy permissions</Button>
              </div>
          </div>
        </main>
      </PageLoader>
      </Meta>
    )
  }

}

const queryFields =  {
  users: ['first-name', 'last-name', 'company'],
  companies: ['name'],
  groups: ['name']
}

const queryIncludes = {
  users: 'company',
  companies: null,
  groups: null
}

const optionLabel = {
  users: (resource) => `${resource['first-name']} ${resource['last-name']} ${resource.company && '-' + resource?.company?.name}`,
  companies: (resource) => resource['name'],
  groups: (resource) => resource['name']
}


const enhance = compose(
  withHooks((props) => {

    const searchAPI = (searchKeyword, type) => new Promise((resolve, reject) => {
      query(type, type, {
        include: queryIncludes[type],
        fields: queryFields[type],
        page: {
          size: 200,
        },
        filter: {
          search: searchKeyword,
        },
      }).then((response) => {
        resolve((response || []).map((resource) => ({
          ...resource,
          label: optionLabel[type](resource),
          value: resource.id
        })))
      })
      .catch(reject)
    })

    return {
      ...props,
      searchAPI
    }
  })
)

export default enhance(PermissionsIndex)