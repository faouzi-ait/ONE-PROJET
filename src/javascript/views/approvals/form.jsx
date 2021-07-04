import React, { useEffect, useState } from 'react'
import moment from 'moment'
import pluralize from 'pluralize'

import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
import { isCms } from 'javascript/utils/generic-tools'

import approvalsClientVariables from 'javascript/views/approvals/variables'
import buyerTypeClientVariables from 'javascript/views/sessions/register/buyer-type.variables'
import accountManagerClientVariables from 'javascript/views/sessions/register/account-manager.variables'
import requiredFieldsClientVariables from 'javascript/views/sessions/register/required-fields.variables'
import prefetchPgSzClientVariables from 'javascript/views/sessions/register/prefetch-pg-sz.variables'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import withPrefix from 'javascript/components/hoc/with-prefix'

//State
import ApprovalsActions from 'javascript/actions/approvals'
import ApprovalsStore from 'javascript/stores/approvals'
import UserActions from 'javascript/actions/users'
import UsersStore from 'javascript/stores/users'

import AsyncSearchResource from 'javascript/components/async-search-resource'
import Checkbox from 'javascript/components/custom-checkbox'
import Button from 'javascript/components/button'
import Select from 'react-select'

class ApprovalForm extends React.Component {

  constructor(props) {
    super(props)
    let selectedAm;
    const accountManager = this.props.resource['external-user']['account-manager']
    if (accountManager) {
      const label = accountManager['first-name'] && accountManager['last-name'] ? `${accountManager['first-name']} ${accountManager['last-name']}` : this.props.accountManagerCV.unknownAMLabel
      selectedAm = {
        ...this.props.resource['external-user']['account-manager'],
        label
      }
    } else {
      selectedAm = null
    }
    this.state = {
      resource: {
        ...this.props.resource,
        'add-to-mailing-lists': this.props.resource['add-to-mailing-lists'] || true
      },
      userHasCompany: this.props.resource['external-user'].company ? true : false,
      selectedCompany: this.props.resource['external-user'].company,
      selectedAm,

    }
  }

  componentWillMount() {
    ApprovalsStore.on('error', this.retrieveErrors)
    UsersStore.on('error', this.retrieveErrors)
    if (this.props.theme.features.accountManager) {
      UsersStore.on('receivedAccountManagers', this.getAms)

    }
  }

  componentWillUnmount() {
    ApprovalsStore.removeListener('error', this.retrieveErrors)
    UsersStore.removeListener('error', this.retrieveErrors)
    if (this.props.theme.features.accountManager) {
      UsersStore.removeListener('receivedAccountManagers', this.getAms)
    }
  }

  componentDidMount() {
    if (this.props.theme.features.accountManager) {
      UserActions.getAccountManagers({ page: { size: 200 }, fields: { users: 'first-name,last-name,id' }, sort: 'first-name' })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.resource['external-user'].company && prevState.selectedCompany) {
      if (prevState.selectedCompany.id !== this.props.resource['external-user'].company.id) {
        this.setState({
          userHasCompany: this.props.resource['external-user'].company ? true : false,
          selectedCompany: this.props.resource['external-user'].company,
        })
      }
    }
  }

  retrieveErrors = () => {
    this.setState({
      apiErrors: this.store.getErrors(),
      loading: false
    })
  }

  renderErrors = () => {
    if (this.state.apiErrors) {
      return (
        <ul className="form__errors">
          {Object.keys(this.state.apiErrors).map((key, i) => {
            const error = this.state.apiErrors[key]
            return (
              <li key={i}>{key.charAt(0).toUpperCase() + key.slice(1)} {error}</li>
            )
          })}
        </ul>
      )
    }
  }
  getAms = () => {
    let update = []
    if (this.props.amRole) {
      update = UsersStore.getAccountManagers().map(am => ({
        ...am,
        label: `${am['first-name']} ${am['last-name']}`
      }))
    }

    update.unshift({
      id: null,
      label: this.props.accountManagerCV.unknownAMLabel
    })

    this.setState({
      ams: update
    })
  }

  assignCompany = (company) => {
    if (company) {
      this.state.resource['external-user']['company'] = company
    } else {
      delete this.state.resource['external-user']['company']
    }
    this.setState({
      selectedCompany: company,
      userHasCompany: !!company
    }, () => {
      UserActions.updateResource({
        id: this.state.resource['external-user'].id,
        company: company
      })
    })
  }
  assignAm = (am) => {
    this.state.resource['external-user']['account-manager'] = am
    this.setState({
      selectedAm: am,
      userHasAM: true
    }, () => {
      UserActions.updateResource({
        id: this.state.resource['external-user'].id,
        'account-manager': am
      })
    })
  }

  handleTerritoriesChange = (territories) => {
    this.state.resource['external-user']['territories'] = territories
    this.setState({
      resource: Object.assign(this.state.resource, { 'external-user': Object.assign(this.state.resource['external-user'], { territories: territories }) })
    }, () => {
      UserActions.updateResource({
        id: this.state.resource['external-user'].id,
        'territories': territories
      })
    })
  }

  genresOptions = (genres = []) => {
    const options = []
    genres
      .filter(genre => !genre['parent-id'])
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(genre => {
        options.push({
          ...genre,
          label: genre.name,
          value: genre.id
        })
        genres
          .filter(sub => sub['parent-id'] == genre.id)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(sub => {
            options.push({
              ...sub,
              label: `${genre.name} - ${sub.name}`,
              value: sub.id
            })
          })
      })
    return options
  }

  handleGenresChange = (genres) => {
    this.props.setUserGenres(genres)
    UserActions.updateResource({
      id: this.state.resource['external-user'].id,
      genres
    })
  }

  handleRegionsChange = (regions) => {
    this.props.setUserRegions(regions)
    UserActions.updateResource({
      id: this.state.resource['external-user'].id,
      regions
    })
  }

  regionsRequiredButNotSelected() {
    return this.props.requiredFieldsCV['regions'] && (this.props.userRegions || []).length == 0
  }

  updateResource = (status) => {
    this.setState({ loading: status })
    const update = {
      id: this.state.resource.id,
      status: status
    }
    if(this.props.theme.features.mailingListSubscriptions.addToMailingListCheckbox){
      update['add-to-mailing-lists'] = this.state.resource['add-to-mailing-lists']
    }
    ApprovalsActions.updateResource(update)
  }

  selectedTerritories() {
    return this.state.resource['external-user']['territories']
  }

  territoriesRequiredButNotSelected() {
    return this.props.theme.features.territories.required.approvals && this.selectedTerritories().length == 0
  }

  territoriesLimitExceeded() {
    const limit = this.props.theme.features.territories.limits.approvals
    if (limit === 'unlimited') { return false }
    return this.selectedTerritories().length > limit
  }

  territoriesLimit() {
    const limit = this.props.theme.features.territories.limits.approvals
    if (limit == 1) {
      return 'one territory'
    } else {
      return `${limit} territories`
    }
  }

  renderAddCompany = () => {
    const { user } = this.props
    let buttonClasses = 'button button--small'
    if (!isCms()) {
      buttonClasses = `${buttonClasses} button--filled`
    }
    if (isAdmin(user) || hasPermission(user, ['manage_companies'])) {
      return (
        <tr>
          <td></td>
          <td>
            <Button type="button" className={buttonClasses}
              onClick={() => this.props.createCompany(this.state.resource)}
            >Add Company</Button>
          </td>
        </tr>
      )
    }
  }

  render() {
    const { resource, loading } = this.state
    const { buyerTypeCV, approvalsCV, requiredFieldsCV, theme, prefix } = this.props
    const user = resource['external-user']
    const rejectClasses = loading === 'rejected' ? 'button button--error button--loading' : 'button button--error'
    const approveClasses = loading === 'approved' ? 'button button--filled button--success button--loading' : 'button button--filled button--success'
    let disabled = !this.state.userHasCompany
    if (theme.features.territories.enabled && (this.territoriesRequiredButNotSelected() || this.territoriesLimitExceeded())) {
      disabled = true
    }
    if (theme.features.regions.enabled && this.regionsRequiredButNotSelected()) {
      disabled = true
    }
    const { tab } = this.props
    const updatedDateTitle = tab === 'approved' ? 'Approval Date' : tab === 'rejected' ? 'Rejected Date' : null


    return (
      <div>
        <table className={`${prefix}table`}>
          <tbody>
            <tr>
              <td>Name:</td>
              <td>{user['first-name']} {user['last-name']}</td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>{user.email}</td>
            </tr>
            <tr>
              <td>Job Title:</td>
              <td>{user['job-title']}</td>
            </tr>
            <tr>
              <td>Company:</td>
              <td>{user['company-name']}</td>
            </tr>
            <tr>
              <td>Assign Company:</td>
              <td style={{ width: '320px'}}>
                <AsyncSearchResource
                  resourceType={'companies'}
                  value={this.state.selectedCompany}
                  onChange={this.assignCompany}
                  placeholder="Search..."
                  prefetchPageSize={this.props.prefetchPageSizeCV.companies}
                />
              </td>
            </tr>
            { this.renderAddCompany() }
            <tr>
              <td>Telephone:</td>
              <td>{user['telephone-number']}</td>
            </tr>
            <tr>
              <td>User Type</td>
              <td>{user['user-type']}</td>
            </tr>

            {theme.features.territories.enabled &&
              <tr>
                <td>{theme.features.territories.limits.approvals === 1 ? 'Territory' : 'Territories'}:</td>
                <td style={{ width: '320px'}}>
                  <AsyncSearchResource
                    resourceType={'territories'}
                    required={theme.features.territories.required.approvals}
                    multi={true}
                    limit={theme.features.territories.limits.approvals}
                    value={user['territories']}
                    onChange={this.handleTerritoriesChange}
                    placeholder="Search..."
                    prefetchPageSize={this.props.prefetchPageSizeCV.territories}
                  />
                </td>
              </tr>
            }
            {theme.features.regions.enabled &&
              <tr>
                <td>
                  {pluralize(theme.localisation.region.upper)}
                </td>
                <td style={{ width: '320px'}}>
                  <AsyncSearchResource
                    resourceType={'regions'}
                    required={requiredFieldsCV['regions']}
                    multi={true}
                    value={this.props.userRegions}
                    onChange={this.handleRegionsChange}
                    placeholder="Search..."
                    prefetchPageSize={this.props.prefetchPageSizeCV.regions}
                  />
                </td>
              </tr>
            }
            {theme.features.users.genres &&
              <tr>
                <td>{theme.localisation.genre.upper}:</td>
                <td style={{ width: '320px'}}>
                  <Select options={this.genresOptions(this.props.genres)}
                    valueKey='id'
                    labelKey='label'
                    multi={true}
                    value={(this.props.userGenres || []).map((g) => g.id)}
                    {...(!this.props.userGenres && { placeholder: 'Loading...'})}
                    onChange={this.handleGenresChange}
                  /></td>
              </tr>
            }
            {theme.features.accountManager &&
              <tr>
                <td>{theme.localisation.accountManager.upper}:</td>
                <td  style={{ width: '320px'}}>
                  <Select options={this.state.ams} valueKey="id" value={this.state.selectedAm}
                    onChange={this.assignAm} clearable={false} backspaceRemoves={false}
                  />
                </td>
              </tr>
            }
            {theme.features.mailingListSubscriptions.addToMailingListCheckbox &&
              <tr>
                <td>Add to Mailchimp:</td>
                <td>
                  <Checkbox
                    id='add-to-mailing-lists'
                    name='add-to-mailing-lists'
                    onChange={(e) => {
                      this.setState({
                        resource: {
                          ...this.state.resource,
                          ['add-to-mailing-lists']: e.target.checked
                        }
                      })
                    }}
                    labeless
                    checked={resource['add-to-mailing-lists']} />
                </td>
              </tr>
            }
            {approvalsCV.showBuyerType &&
              <tr>
                <td>{buyerTypeCV.buyerTypeLabel}:</td>
                <td>{ user['buyer-type'] }</td>
              </tr>
            }
            { resource['created-at'] && (
              <tr>
                <td>Registered Date</td>
                <td>{moment(resource['created-at']).format(theme.features.formats.shortDate) }</td>
              </tr>
            )}
            { resource['updated-at'] && updatedDateTitle && (
              <tr>
                <td>{ updatedDateTitle }</td>
                <td>{moment(resource['updated-at']).format(theme.features.formats.shortDate) }</td>
              </tr>
            )}
          </tbody>
        </table>
        {this.renderErrors()}
        {disabled && !this.state.userHasCompany &&
          <p className="info"><span>Please assign a company in order to approve this user</span></p>
        }
        {theme.features.territories.enabled && this.territoriesRequiredButNotSelected() &&
          <p className="info"><span>Please assign a territory in order to approve this user</span></p>
        }
        {theme.features.territories.enabled && this.territoriesLimitExceeded() &&
          <p className="info"><span>Please assign {this.territoriesLimit()} in order to approve this user.</span></p>
        }
        {this.props.tab !== 'approved' && theme.features.regions.enabled && this.regionsRequiredButNotSelected() &&
          <p className="info"><span>Please assign a {theme.localisation.region.lower} in order to approve this user</span></p>
        }
        <div className="form__control form__control--actions">
          {this.props.tab !== 'rejected' && <Button className={rejectClasses} onClick={() => { this.updateResource('rejected') }}>Reject</Button>}
          {this.props.tab !== 'approved' && <Button className={approveClasses} onClick={() => { this.updateResource('approved') }} disabled={disabled}>Approve</Button>}
        </div>
      </div>
    )
  }
}

const enhance = compose(
  withTheme,
  withPrefix,
  withClientVariables('approvalsCV', approvalsClientVariables),
  withClientVariables('buyerTypeCV', buyerTypeClientVariables),
  withClientVariables('accountManagerCV', accountManagerClientVariables),
  withClientVariables('prefetchPageSizeCV', prefetchPgSzClientVariables),
  withClientVariables('requiredFieldsCV', requiredFieldsClientVariables),
  withHooks((props) => {
    const { features } = props.theme
    const genresResource = useResource('genre')
    const usersResource = useResource('user')
    const [userGenres, setUserGenres] = useState(null)
    const [userRegions, setUserRegions] = useState(null)

    const getGenres = () => {
      if (features.users.genres) {
        genresResource.findAll({
          include: 'sub-genres',
          filter: {
            'shown-in-registration': 'true'
          },
          fields: {
            genres: 'name,sub-genres,parent-id'
          }
        })
        usersResource.findOne(props.resource['external-user'].id, {
          include: 'genres',
          fields: {
            users: 'first-name,last-name,genres'
          }
        }).then((response) => {
          setUserGenres(response.genres)
        })
      }
    }

    const getRegions = () => {
      if (features.regions.enabled) {
        usersResource.findOne(props.resource['external-user'].id, {
          include: 'regions',
          fields: {
            users: 'regions'
          }
        }).then((response) => {
          setUserRegions(response.regions)
        })
      }
    }

    useEffect(() => {
      getGenres()
      getRegions()
    }, [])

    return {
      genres: genresResource.getDataAsArray() || [],
      userGenres,
      setUserGenres,
      userRegions,
      setUserRegions
    }
  })
)

export default enhance(ApprovalForm)