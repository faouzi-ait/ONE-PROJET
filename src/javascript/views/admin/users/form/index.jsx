// React
import React, { useEffect, useMemo } from 'react'
import pluralize from 'pluralize'
import deepEqual from 'deep-equal'

import moment from 'moment'

import allClientVariables from './variables'
import buyerTypeClientVariables from 'javascript/views/sessions/register/buyer-type.variables'
import prefetchPgSzClientVariables from 'javascript/views/sessions/register/prefetch-pg-sz.variables'
import requiredFieldsClientVariables from 'javascript/views/sessions/register/required-fields.variables'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-loader'
import withTheme from 'javascript/utils/theme/withTheme'

// Store
import ResourceStore from 'javascript/stores/users'
// Actions
import ResourceActions from 'javascript/actions/users'
// Components
import Button from 'javascript/components/button'
import Checkbox from 'javascript/components/custom-checkbox'
import FileUploader from 'javascript/components/file-uploader'
import FormControl from 'javascript/components/form-control'
import NavLink from 'javascript/components/nav-link'
import PasswordInputs from 'javascript/components/password-inputs'
import Select from 'react-select'
import AsyncSearchResource from 'javascript/components/async-search-resource'

import { isAdmin, hasPermission, hasAllPermissions } from 'javascript/services/user-permissions'
import { ProductionCompaniesSelect } from 'javascript/views/admin/users/production-companies-select'
import { capitalize } from 'javascript/utils/generic-tools'

class UsersForm extends React.Component {
  constructor(props) {
    super(props)
    const { theme } = this.props
    this.isGroupAdmin = isAdmin(this.props.sessionUser) || hasPermission(this.props.sessionUser, ['manage_groups'])

    this.shouldDisplayPasswords = true
    if (theme.features.oauth.enabled && !theme.features.oauth.allowOneLogin.enabled) {
      this.shouldDisplayPasswords = !this.props.user
    }

    const initialState = {
      availableRoles: [],
      selectedRoles: [],
      selectedTerritories: [],
      selectedGenres: [],
      selectedGroups: [],
      selectedProgrammes: [],
      selectedProgrammeTypes: [],
      loading: false,
      errors: null,
      buyerTypeTextField: false,
      passwordsAreValid: !this.shouldDisplayPasswords
    }

    if (this.props.user) {
      this.state = {
        ...initialState,
        user: this.props.user,
        isEditing: true,
        image: {},
        marketingDisplay: false
      }

      if (this.props.user['buyer-type']) {
        const specifiedBuyerType = theme.variables.BuyerTypes[this.props.user['buyer-type']]
        this.state.user['buyer-type-other'] = specifiedBuyerType ? '' : 'other'
        this.state.buyerTypeTextField = !specifiedBuyerType
      }

      if (theme.features.users.genres) {
        this.state['selectedGenres'] = (this.props.user['genres'] || []).map((genre) => { return genre.id })
      }
      if (theme.features.dashboard.admin) {
        this.state['selectedProgrammes'] = (this.props.user['programmes'] || []).map((programme) => { return programme.id })
      }
      if (theme.features.programmeTypes.preferences) {
        this.state.selectedProgrammeTypes = (this.props.user['programme-types'] || []).map((programmeType) => programmeType.id)
      }
    } else {
      this.state = {
        ...initialState,
        'user': {
          'user-type': this.props.initialUserType,
          marketing: false
        },
        isEditing: false,
        marketingDisplay: true,
      }
    }
  }

  componentWillMount() {
    ResourceStore.on('error', this.retrieveErrors)
  }

  componentWillUnmount() {
    ResourceStore.removeListener('error', this.retrieveErrors)
  }

  componentWillReceiveProps(nextProps) {
    const { theme } = this.props
    if (nextProps.user) {
      let update = {
        'user': nextProps.user,
        'selectedRoles': nextProps.user['roles'].map((role) => { return role.id }),
      }
      if (theme.features.territories.enabled || theme.features.territories.cms) {
        update['selectedTerritories'] = nextProps.user['territories'] || []
      }
      if (theme.features.regions.enabled) {
        update['selectedRegions'] = nextProps.user['regions'] || []
      }
      if (theme.features.groups.enabled && this.isGroupAdmin) {
        update['selectedGroups'] = nextProps.user['groups'] || []
      }
      if (theme.features.users.genres) {
        update['selectedGenres'] = (nextProps.user['genres'] || []).map((genre) => { return genre.id })
      }
      if (theme.features.dashboard.admin) {
        update['selectedProgrammes'] = (nextProps.user['programmes'] || []).map((programme) => { return programme.id })
      }
      if (theme.features.programmeTypes.preferences) {
        update.selectedProgrammeTypes = (nextProps.user['programme-types'] || []).map((programmeType) => programmeType.id)
      }
      this.setState(update)
    }
  }

  componentDidUpdate(prevProps) {
    const { roles, theme, user } = this.props
    if (!deepEqual(roles, prevProps.roles)) {
      const salesCoordinatorRole = roles.find( role => role.name == 'sales_coordinator')
      const accountManagerRole = roles.find( role => role.name == 'account_manager')
      const update = {
        salesCoordinatorRole,
        accountManagerRole,
        availableRoles: roles
      }
      if (user) {
        const selectedRoles = user['roles'].map((role) => { return role.id })
        update.availableRoles = this.availableRoles(selectedRoles, accountManagerRole, salesCoordinatorRole)
        update.selectedRoles = selectedRoles
      }
      this.setState(update)
    }
  }

  retrieveErrors = () => {
    this.setState({
      errors: ResourceStore.getErrors(),
      loading: false
    })
  }

  renderErrors = () => {
    const { errors } = this.state
    if (errors) {
      if (errors['passwordInvalid']) return null
      return (
        <ul className="cms-form__errors">
          {Object.keys(errors).map((key, i) => {
            const error = errors[key]
            return (
              <li key={i}>{key.charAt(0).toUpperCase() + key.slice(1)} {error}</li>
            )
          })}
        </ul>
      )
    }
  }

  saveUser = (e, isEditing) => {
    const { theme } = this.props
    e.preventDefault()
    if (!this.state.passwordsAreValid) {
      return this.setState({
        errors: {'passwordInvalid': 'Not a valid password'}
      })
    }
    const update = {
      loading: true
    }
    const user = Object.assign({}, this.state.user)
    if (user['user-type'] === 'external') {
      user.roles = []
      update.selectedRoles = []
    }
    if (theme.features.users.limitedAccess) {
      if (user['user-type'] !== 'external') {
        user['limited-access'] = false
      }
    }
    this.setState(update)
    if (!theme.features.dashboard.admin) {
      delete user['programmes']
    }
    if (theme.features.groups.enabled && !this.isGroupAdmin) {
      delete user.groups
    }
    if (isEditing) { // Update Existing User
      delete user['approval-status']
      ResourceActions.updateUser(user)
    } else { // Create New User
      ResourceActions.createUser({
        ...user,
        'disable-registration-emails': true,
        'disable-approval-emails': true
      })
    }
  }

  handleInputChange = (e) => {
    let update = this.state.user
    update[e.target.name] = e.target.value
    this.setState({
      user: update
    })
  }

  handleSelectChange = (type) => (selected) => {
    const update = this.state.user
    update[type] = type === 'user-type' || type === 'title' || type === 'buyer-type' ? selected.value : selected
    this.setState({
      user: update
    })
  }

  handleCheckboxChange = (event) => {
    let update = this.state.user
    update[event.target.name] = event.target.checked
    this.setState({
      user: update
    })
  }

  handleRoleChange = (values) => {
    const selectedRoles =  values.map(value => value.value)
    this.setState({
      selectedRoles,
      availableRoles: this.availableRoles(selectedRoles, this.state.accountManagerRole, this.state.salesCoordinatorRole)
    })
    let updates = this.state.user
    let roles = []
    selectedRoles.forEach((roleId) => {
      this.props.roles.forEach((role) => {
        if (roleId == role.id) {
          roles.push(role)
        }
      })
    })
    updates.roles = roles
    if(!selectedRoles.find(roleId => roleId == this.state.accountManagerRole && this.state.accountManagerRole.id)) {
      updates['sales-coordinators'] = []
    }
    if(!selectedRoles.find(roleId => roleId == this.state.salesCoordinatorRole && this.state.salesCoordinatorRole.id)) {
      updates['account-managers'] = []
    }
    this.setState({
      user: updates
    })
  }

  handleGenresChange = (values) => {
    const { user } = this.state
    user.genres = this.props.genres.filter(genre => values.split(',').includes(genre.id))
    this.setState({
      selectedGenres: values,
      user
    })
  }


  handleProgrammeChange = (selectedProgrammes) => {
    const { user } = this.state
    user.programmes = this.props.programmes.filter(programme => selectedProgrammes.split(',').includes(programme.id))
    this.setState({
      selectedProgrammes,
      user
    })
  }

  handleMultiSelectChange = (type, valueKey = 'value') => (selectedValues) => {
    const userUpdate = { ...this.state.user }
    userUpdate[type] = selectedValues.map((item) => ({ id: item[valueKey]}))
    this.setState({
      [`selected${capitalize(type)}`]: selectedValues,
      user: userUpdate
    })
  }

  handleProgrammeTypeChange = (values) => {
    const update = { ...this.state.user }
    const selectedProgrammeTypes = values.map(value => value.programmeType.id)
    update['programme-types'] = values.map(value => value.programmeType)
    this.setState({
      user: update,
      selectedProgrammeTypes
    })
  }

  availableRoles = (selectedRoles, accountManagerRole, salesCoordinatorRole) => {
    const {roles} = this.props

    if (accountManagerRole && salesCoordinatorRole) {
      if (selectedRoles.find(roleId => roleId == salesCoordinatorRole.id)) {
        return roles.filter(role => role.id != accountManagerRole.id)
      } else if (selectedRoles.find(roleId => roleId == accountManagerRole.id)) {
        return roles.filter(role => role.id != salesCoordinatorRole.id)
      }
    }
    return roles
  }

  renderCompanies = () => {
    const { requiredFieldsCV } = this.props
    return <AsyncSearchResource
      resourceType={'companies'}
      value={this.state.user.company}
      required={requiredFieldsCV['company-name']}
      onChange={this.handleSelectChange('company')}
      placeholder="Search..."
      prefetchPageSize={this.props.prefetchPageSizeCV.companies}
    />
  }

  renderAccountManager = () => {
    const accountManagers = this.props.accountManagers || []
    if (this.state.user['user-type'] === 'external' && accountManagers) {
      return (
        <FormControl label={this.props.theme.localisation.accountManager.upper}>
          <Select
            clearable={true}
            options={accountManagers.map(am => ({ ...am, value: am.id, label: `${am['first-name']} ${am['last-name']}`, input: 'account-manager' }))}
            value={this.state.user['account-manager'] && this.state.user['account-manager'].id}
            onChange={this.handleSelectChange('account-manager')}
          />
        </FormControl>
      )
    }
  }

  renderTerritories = () => {
    const { requiredFieldsCV } = this.props
    return (
      <FormControl label="Territories" key="territories" required={requiredFieldsCV['territories']}>
        <AsyncSearchResource
          resourceType={'territories'}
          required={requiredFieldsCV['territories']}
          multi={true}
          value={this.state.selectedTerritories}
          onChange={this.handleMultiSelectChange('territories', 'id')}
          prefetchPageSize={this.props.prefetchPageSizeCV.territories}
        />
      </FormControl>
    )
  }

  renderRegions = () => {
    const { requiredFieldsCV, theme } = this.props
    return (
      <FormControl label={pluralize(theme.localisation.region.upper)} key="regions" required={requiredFieldsCV['regions']}>
        <AsyncSearchResource
          resourceType={'regions'}
          required={requiredFieldsCV['regions']}
          multi={true}
          value={this.state.selectedRegions}
          onChange={this.handleMultiSelectChange('regions', 'id')}
          prefetchPageSize={this.props.prefetchPageSizeCV.regions}
        />
      </FormControl>
    )
  }

  renderGroups = () => (
    <FormControl label="Groups" key='groups'>
      <AsyncSearchResource
        resourceType={'groups'}
        multi={true}
        value={this.state.selectedGroups}
        onChange={this.handleMultiSelectChange('groups', 'id')}
        prefetchPageSize={this.props.prefetchPageSizeCV.groups}
      />
    </FormControl>
  )


  renderRoles = () => {
    const { roles, theme } = this.props
    const { availableRoles, selectedRoles } = this.state
    if (this.state.user['user-type'] === 'internal') {
      return [
        <FormControl label="Roles" key='roles'>
          <Select options={ availableRoles.map(role => ({ value: role.id, label: role.name.charAt(0).toUpperCase() + role.name.substring(1).replace(/_/g, ' ') })) } value={ selectedRoles } multi={ true } onChange={ this.handleRoleChange }/>
        </FormControl>,
        <FormControl label='All Programmes Access' key='all-programmes-access'>
          <Checkbox
            label='Can access all programmes'
            id='all-programmes-access'
            name='all-programmes-access'
            onChange={this.handleCheckboxChange}
            checked={this.state.user['all-programmes-access']} />
        </FormControl>,
        <FormControl label={`All ${pluralize(theme.localisation.video.upper)} Access`} key='all-videos-access'>
          <Checkbox
            label={`Can access all ${pluralize(theme.localisation.video.lower)}`}
            id='all-videos-access'
            name='all-videos-access'
            onChange={this.handleCheckboxChange}
            checked={this.state.user['all-videos-access']} />
        </FormControl>
      ]
    }
  }

  accountManagerRoleIsSelected = () => {
    const {selectedRoles, accountManagerRole} = this.state
    return !!selectedRoles.find(roleId => roleId == accountManagerRole?.id)
  }

  salesCoordinatorRoleIsSelected = () => {
    const {selectedRoles, salesCoordinatorRole} = this.state
    return !!selectedRoles.find(roleId => roleId == salesCoordinatorRole?.id)
  }

  renderSalesCoordinatorsForAccountManagers = () => {
    if(this.state.user['user-type'] != 'internal') { return null }
    if(!this.accountManagerRoleIsSelected()) { return null }
    const salesCoordinators = this.props.salesCoordinators || []

    return <FormControl label="Sales Coordinators" key="sales-coordinators">
      <Select
        options={ salesCoordinators.map(user => ({ ...user, value: user.id, label: `${user['first-name']} ${user['last-name']}`, input: 'sales-coordinators' }))}
        value={ this.state.user['sales-coordinators'] && this.state.user['sales-coordinators'].map(user => user.id) }
        onChange={ this.handleSelectChange('sales-coordinators') }
        multi={true}
        clearable={ true } />
    </FormControl>
  }

  renderAccountManagersForSalesCoordinators = () => {
    if(this.state.user['user-type'] != 'internal') { return null }
    if(!this.salesCoordinatorRoleIsSelected()) { return null }
    const accountManagers = this.props.accountManagers || []

    return <FormControl label="Account Managers" key="account-managers">
      <Select
        options={ accountManagers.map(user => ({ ...user, value: user.id, label: `${user['first-name']} ${user['last-name']}`, input: 'account-managers' }))}
        value={ this.state.user['account-managers'] && this.state.user['account-managers'].map(user => user.id) }
        onChange={ this.handleSelectChange('account-managers') }
        multi={true}
        clearable={ true } />
    </FormControl>
  }

  renderGenres = (genres) => {
    const options = []
    genres && genres.filter(genre => !genre['parent-id'])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(genre => {
      options.push({
        ...genre,
        label: genre.name,
        value: genre.id
      })
      genres.filter(sub => sub['parent-id'] == genre.id)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(sub => {
        options.push({
          ...sub,
          label: `${genre.name} - ${sub.name}`,
          value: sub.id
        })
      })
    })
    return (
      <Select options={options} value={this.state.selectedGenres} multi={true} onChange={this.handleGenresChange}
        placeholder="Type to search" simpleValue={true} />
    )
  }

  renderProgrammes = () => {
    const options = (this.props.programmes || []).map((programme) => ({
      ...programme,
      label: programme['title-with-genre'],
      value: programme.id
    }))
    return (
      <Select options={options} value={this.state.selectedProgrammes} multi={true} onChange={this.handleProgrammeChange}
        placeholder="Type to search" simpleValue={true} />
    )
  }

  renderLimitedAccess = () => {
    if (this.state.user['user-type'] === 'external') {
      return (
        <FormControl label={this.props.theme.localisation.limitedAccess.upper} key="limited-access">
          <Checkbox
            labeless={true}
            id='limited-access'
            name='limited-access'
            onChange={this.handleCheckboxChange}
            checked={this.state.user['limited-access']}
          />
        </FormControl>
      )
    }
  }

  renderImageUpload = () => (
    <FileUploader title={'User Image'}
      name={'image'}
      fileType={'Image'}
      fileSrc={this.state.image && this.state.image.preview || (this.state.user.image && this.state.user.image.admin_preview.url)}
      filePath={this.state.image && this.state.image.path}
      onRemoveFile={() => {
        this.setState({
          user: {
            ...this.state.user,
            image: null,
            'remove-image': true
          },
          image: {}
        })
      }}
      onChange={(targetName, baseStr, file) => {
        this.setState({
          [targetName]: {
            preview: baseStr,
            file: file,
            path: file.name
          },
          user: {
            ...this.state.user,
            [targetName]: baseStr
          }
        })
      }}
    />
  )

  renderProgrammeTypes = (programmeTypes) => {
    const options = programmeTypes.map((programmeType) => {
      return {
        value: programmeType.id,
        label: programmeType.name,
        programmeType
      }
    })
    return (
      <Select
        options={options}
        value={this.state.selectedProgrammeTypes}
        multi={true}
        onChange={this.handleProgrammeTypeChange}
      />
    )
  }

  render() {

    const { user, isEditing, loading } = this.state
    const { buyerTypeCV, requiredFieldsCV, theme } = this.props
    const buttonText = isEditing ? 'Save User' : 'Create User'
    const buttonClasses = loading ? 'button button--filled button--loading' : 'button button--filled'
    const cancelPath = isEditing ? '/admin/users/' + user.id : '/admin/users'

    const buyerOptions = Object.keys(theme.variables.BuyerTypes).map((key) => ({
      value: key,
      label: theme.variables.BuyerTypes[key]
    }))
    const easytrack =
      theme.features.rightsManagement &&
      theme.features.rightsManagement.includes('easytrack')

    if (this.props.pageState.isLoading) return null

    return (
      <div className="container">
        <form className="cms-form cms-form--large" onSubmit={(e) => this.saveUser(e, isEditing)}>
          {this.props.userFormCV.createdDate && user['created-at'] && (
            <FormControl label="Created date">
              <span>{moment(user['created-at']).format(theme.features.formats.longDate)}</span>
            </FormControl>
          )}
          {user['approval-status'] &&
            <FormControl label="Status">
              <span className={`count ${user['approval-status'] === 'pending' ? 'count--warning' : (user['approval-status'] === 'pending' ? 'count--error' : 'count--success')}`}>{user['approval-status'].charAt(0).toUpperCase() + user['approval-status'].slice(1)}</span>
              {user['approval-status'] === 'pending' &&
                <small>Please note this user will not be able to login until their account is approved</small>
              }
            </FormControl>
          }
          <FormControl type='title' label="Title"
            value={user['title']}
            required={requiredFieldsCV['title']}
            clearable={!requiredFieldsCV['title']}
            onChange={this.handleSelectChange('title')}
          />
          <FormControl type="text" label="First Name" name="first-name"
            value={user['first-name'] }
            required={requiredFieldsCV['first-name']}
            onChange={this.handleInputChange}
          />
          <FormControl type="text" label="Last Name" name="last-name"
            value={user['last-name']}
            required={requiredFieldsCV['last-name']}
            onChange={this.handleInputChange}
          />
          <FormControl label="Company" required={requiredFieldsCV['company-name']}>
            {this.renderCompanies()}
          </FormControl>
          <FormControl type="text" label="Job Title" name="job-title"
            value={user['job-title']}
            required={requiredFieldsCV['job-title']}
            onChange={this.handleInputChange}
          />
          <FormControl type="tel" label="Telephone" name="telephone-number"
            value={user['telephone-number']}
            required={requiredFieldsCV['telephone-number']}
            onChange={this.handleInputChange}
          />
          <FormControl type="mobile" label="Mobile" name="mobile-number"
            required={requiredFieldsCV['mobile-number']}
            mobileNumber={user['mobile-number']}
            countryCode={user['mobile-country-code']}
            onChange={(countryCode, mobileNumber) => {
              this.handleInputChange({ target: { name: 'mobile-country-code', value: countryCode }})
              this.handleInputChange({ target: { name: 'mobile-number', value: mobileNumber }})
            }}
          >
            <p className="cms-form__info">Used for in-app meeting notifications</p>
          </FormControl>
          <FormControl type="email" label="Email" name="email"
            value={user['email']}
            required={requiredFieldsCV['email']}
            onChange={this.handleInputChange}
          />
          <FormControl
            type="text"
            label={easytrack ? 'EasyTrack ID' : 'External ID'}
            name="external-id"
            value={user['external-id']}
            required={easytrack}
            onChange={this.handleInputChange}
          />
          { theme.features.users.country && (
            <FormControl type="country" label="Your Location" name="country-code"
              value={user['country-code']}
              required={requiredFieldsCV['country']}
              onChange={this.handleInputChange}
              priorityCountryCodes={'GB,US'}
            />
          )}
          {theme.features.programmeTypes.preferences &&
            <FormControl label={pluralize(theme.localisation.programmeType.upper)}>
              {this.renderProgrammeTypes(this.props.programmeTypes)}
            </FormControl>
          }
          {theme.features.users.genres &&
            <FormControl label="Genre Interests">
              {this.renderGenres(this.props.genres)}
            </FormControl>
          }
          {theme.features.dashboard.admin &&
            <FormControl label={`Shared ${pluralize(theme.localisation.programme.upper)}`} >
              {this.renderProgrammes()}
            </FormControl>
          }
          <FormControl label="User Type" required>
            <Select
              disabled={this.props.userTypeDisabled}
              value={user['user-type']}
              required={true}
              onChange={this.handleSelectChange('user-type')}
              clearable={false}
              options={[{
                value: "internal",
                label: "Internal",
                input: 'user-type'
              }, {
                value: "external",
                label: "External",
                input: 'user-type'
              }]} />
          </FormControl>
          { theme.features.users.limitedAccess && this.renderLimitedAccess() }
          {theme.features.accountManager && this.renderAccountManager()}
          {(theme.features.territories.enabled || theme.features.territories.cms) && this.renderTerritories()}
          {theme.features.regions.enabled && this.renderRegions()}
          { theme.features.groups.enabled && this.isGroupAdmin && this.renderGroups()}
          {this.renderRoles()}
          { theme.features.salesCoordinators && this.renderAccountManagersForSalesCoordinators() }
          { theme.features.salesCoordinators && this.renderSalesCoordinatorsForAccountManagers() }

          { user['user-type'] === 'external' && buyerOptions.length > 0 &&
            <>
              <FormControl
                label={buyerTypeCV.buyerTypeLabel}
                required={requiredFieldsCV['buyer-type']}
              >
                <Select
                  value={this.state.buyerTypeTextField ? user['buyer-type-other'] : user['buyer-type']}
                  onChange={(e) => {
                    if (e.value === 'other') {
                      this.handleSelectChange('buyer-type')({ value: '' })
                      this.handleSelectChange('buyer-type-other')(e)
                    } else {
                      this.handleSelectChange('buyer-type')(e)
                    }
                    this.setState({ buyerTypeTextField: e.value === 'other' })
                  }}
                  required={requiredFieldsCV['buyer-type']}
                  clearable={false}
                  name={this.state.buyerTypeTextField ? 'buyer-type-other' : 'buyer-type'}
                  options={buyerOptions}
                />
              </FormControl>
              {this.state.buyerTypeTextField &&
                <FormControl type="text" label="Please specify" name="buyer-type"
                  value={user['buyer-type']}
                  required={requiredFieldsCV['buyer-type']}
                  onChange={this.handleInputChange}
                />
              }
            </>
          }

          {theme.features.producerHub && (
            <FormControl label="Production Companies">
              <ProductionCompaniesSelect value={user['production-companies'] || []} onChange={this.handleSelectChange('production-companies')} />
            </FormControl>
          )}

          {this.shouldDisplayPasswords &&
            <PasswordInputs
              onChange={this.handleInputChange}
              onValidationComplete={(passwordsAreValid) => {
                if (passwordsAreValid && this.state.errors?.['passwordInvalid']) {
                  const updateErrors = {...this.state.errors}
                  delete updateErrors['passwordInvalid']
                  this.setState({
                    errors: updateErrors
                  })
                }
                this.setState({
                  passwordsAreValid
                })
              }}
              password={user['password']}
              passwordConfirmation={user['password-confirmation']}
              isPasswordReset={this.state.isEditing}
              required={false}
              formErrors={{
                password: this.state.errors?.['password'] || this.state.errors?.['passwordInvalid'] || '',
                passwordConfirmation: this.state.errors?.['password-confirmation'] || ''
              }}
            />
          }

          {theme.features.users.marketing && theme.features.users.marketing.enabled &&
            <div className="cms-form__control">
              <label className="cms-form__label">Marketing Preference</label>
              <div className="cms-form__inner">
                { this.state.marketingDisplay ?
                  <FormControl>
                    <Checkbox
                      label={theme.features.users.marketing.copy}
                      id='marketing'
                      name='marketing'
                      onChange={this.handleCheckboxChange}
                      checked={this.state.user['marketing']} />
                  </FormControl>
                : (
                  <>
                  {user['marketing'] === null ? 'Unset': (
                    user['marketing'] ? 'Yes' : 'No'
                  )}&nbsp;
                  <span className="text-button" onClick={()=>this.setState({marketingDisplay: !this.state.marketingDisplay})}>Update</span>
                  </>
                )}
              </div>
            </div>
          }

          {this.accountManagerRoleIsSelected() && user['user-type'] === 'internal' && this.renderImageUpload()}

          <div className="cms-form__control cms-form__control--actions">
            {this.renderErrors()}
            <NavLink to={cancelPath} className="button">Cancel</NavLink>
            <Button type="submit" className={buttonClasses}>{buttonText}</Button>
          </div>
        </form>
      </div>
    )
  }
}

const enhance = compose(
  withTheme,
  withLoader,
  withClientVariables('requiredFieldsCV', requiredFieldsClientVariables),
  withClientVariables('prefetchPageSizeCV', prefetchPgSzClientVariables),
  withClientVariables('buyerTypeCV', buyerTypeClientVariables),
  withClientVariables('userFormCV', allClientVariables),
  withHooks((props) => {

    const { sessionUser, theme } = props

    const accounManagerResource = useResource('user')
    const getAccountManagers = () => {
      accounManagerResource.findAll({
        fields: {
          users: 'first-name,last-name,id'
        },
        sort: 'first-name',
        filter: {
          'choices-for': 'user-account-manager'
        }
      })
    }

    const genresResource = useResource('genre')
    const getGenres = () => {
      genresResource.findAll({
        include: 'sub-genres',
        filter: {
          'shown-in-registration': 'true'
        },
        fields: {
          genres: 'name,sub-genres,parent-id,active-programmes-count'
        }
      })
    }

    const programmesResource = useResource('programme')
    const getProgrammes = () => {
      programmesResource.findAll({
        fields: {
          programmes: 'id,title-with-genre'
        },
        page: {
          size: 200
        },
      })
    }

    const programmeTypesResource = useResource('programme-type')
    const getProgrammeTypes = () => {
      programmeTypesResource.findAll({
        fields: {
          'programme-types': 'name'
        },
        sort: 'position'
      })
    }

    const rolesResource = useResource('roles')
    const getRoles = () => {
      rolesResource.findAll({
        fields: {
          roles: 'name'
        },
      })
    }

    const salesCoordinatorsResource = useResource('user')
    const getSalesCoordinators = () => {
      salesCoordinatorsResource.findAll({
        fields: {
          users: 'first-name,last-name,id'
        },
        sort: 'first-name',
        filter: {
          'choices-for': 'user-sales-coordinators'
        }
      })
    }

    const shouldFetchAccountManagers = theme.features.accountManager || theme.features.salesCoordinators
    const shouldFetchGenres = theme.features.users.genres
    const shouldFetchProgrammes = theme.features.dashboard.admin
    const shouldFetchProgrammeTypes = theme.features.programmeTypes.preferences
    const shouldFetchSalesCoordinators = theme.features.salesCoordinators

    const getAllResources = () => {
      getRoles()
      if (shouldFetchAccountManagers) {
        getAccountManagers()
      }
      if (shouldFetchSalesCoordinators) {
        getSalesCoordinators()
      }
      if (shouldFetchGenres) {
        getGenres()
      }
      if (shouldFetchProgrammes) {
        getProgrammes()
      }
      if (shouldFetchProgrammeTypes) {
        getProgrammeTypes()
      }
    }

    useEffect(() => {
      getAllResources()
    }, [])

    const finishedLoading = (resource) => !Boolean(resource)

    const accountManagers = shouldFetchAccountManagers ? accounManagerResource.getDataAsArray() : []
    const genres = shouldFetchGenres ? genresResource.getDataAsArray() : []
    const programmes = shouldFetchProgrammes ? programmesResource.getDataAsArray() : []
    const programmeTypes = shouldFetchProgrammeTypes ? programmeTypesResource.getDataAsArray() : []
    const roles = rolesResource.getDataAsArray()
    const salesCoordinators = shouldFetchSalesCoordinators ? salesCoordinatorsResource.getDataAsArray() : []

    useEffect(() => {
      props.pageIsLoading([
        finishedLoading(accountManagers),
        finishedLoading(genres),
        finishedLoading(programmes),
        finishedLoading(programmeTypes),
        finishedLoading(roles),
        finishedLoading(salesCoordinators),
      ])
    }, [ accountManagers, genres, programmes, programmeTypes, roles, salesCoordinators ])

    const getRolesForUser = (sessionUser) => {
      const { user } = props
      if (((user && !isAdmin(user)) || !user) && !isAdmin(sessionUser) && roles) {
        return roles.filter(role => role.name != 'admin')
      }
      return roles
    }

    const userTypeDisabled = useMemo(() => {
      return !(isAdmin(sessionUser) || hasAllPermissions(sessionUser, ['manage_internal_users', 'manage_external_users']))
    }, [sessionUser])


    const initialUserType = useMemo(() => {
      if (userTypeDisabled && !hasPermission(sessionUser, 'manage_internal_users')) {
        return 'external'
      }
      return 'internal'
    }, [userTypeDisabled])

    return {
      accountManagers,
      initialUserType,
      genres,
      programmes,
      programmeTypes,
      roles: getRolesForUser(props.sessionUser) || [],
      salesCoordinators,
      userTypeDisabled,
    }
  })
)

export default enhance(UsersForm)