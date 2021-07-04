import React, {useEffect} from 'react'
import pluralize from 'pluralize'

import allClientVariables from './variables'
import buyerTypeClientVariables from 'javascript/views/sessions/register/buyer-type.variables'
import requiredFieldsClientVariables from 'javascript/views/sessions/register/required-fields.variables'
import registerClientVariables from 'javascript/views/sessions/register/variables'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import withHooks from 'javascript/utils/hoc/with-hooks'

// Actions
import UsersActions from 'javascript/actions/users'
import GenreActions from 'javascript/actions/genres'

// Stores
import UsersStore from 'javascript/stores/users'
import GenreStore from 'javascript/stores/genres'

// Components
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import Banner from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import FormControl from 'javascript/components/form-control'
import CustomSelect from 'javascript/components/custom-select'
import Modal from 'javascript/components/modal'
import Meta from 'react-document-meta'
import PasswordInputs from 'javascript/components/password-inputs'
import Select from 'react-select'
import Checkbox from 'javascript/components/custom-checkbox'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'


class ProfileIndex extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      validation: {
        required: ['password', 'password-confirmation']
      },
      errors: {},
      marketingDisplay: false,
      showBuyerTypeOther: false,
      selectedProgrammeTypes: [],
      passwordsAreValid: false,
      passwordsFormError: null
    }
    if (this.props.theme.features.users.genres) {
      this.state.genres = []
      this.state.selectedGenres = []
    }
    this.formMap = {
      'title': this.renderTitle,
      'firstName': this.renderFirstName,
      'lastName': this.renderLastName,
      'email': this.renderEmailAddress,
      'jobTitle': this.renderJobTitle,
      'telephoneNumber': this.renderTelephone,
      'genres': this.renderGenres,
      'accountManager': this.renderAccountManager,
      'territories': this.renderTerritories,
      'regions': this.renderRegions,
      'buyerType': this.renderBuyerType,
      'programmeType': this.renderProgrammeType,
      'regions': this.renderRegions,
    }
  }

  componentWillMount() {
    UsersStore.on('save', this.saveComplete)
    UsersStore.on('error', this.setErrors)
    if (this.props.theme.features.users.genres) {
      GenreStore.on('change', this.getResources)
    }
  }

  componentWillUnmount() {
    UsersStore.removeListener('save', this.saveComplete)
    UsersStore.removeListener('error', this.setErrors)
    if (this.props.theme.features.users.genres) {
      GenreStore.removeListener('change', this.getResources)
    }
  }

  componentDidMount() {
    if (this.props.theme.features.users.genres) {
      GenreActions.getResources({
        include: 'sub-genres',
        filter: {
          'shown-in-registration': 'true'
        },
        fields: {
          genres: 'name,sub-genres,parent-id,active-programmes-count'
        }
      })
    }
    this.setUser(this.props.user)
  }

  getResources = () => {
    this.setState({
      genres: GenreStore.getResources()
    })
  }

  isValid = () => {
    const { validation } = this.state
    let isValidated = true
    let errors = {}
    if (validation.required) {
      validation.required.forEach((input) => {
        if (this.refs[input] && !this.refs[input].value) {
          isValidated = false
          errors[input] = 'Please complete this field'
        } else if (input === 'password-confirmation') {
          if (this.refs[input] && this.refs[input].value !== this.refs['password'].value) {
            isValidated = false
            errors[input] = 'Passwords do not match'
          }
        }
      })
    }
    this.setState({
      errors: errors
    })
    return isValidated
  }

  setUser = (user) => {
    const { theme, profileCV } = this.props
    const userUpdate = Object.assign({}, user)
    const update = {
      user: userUpdate
    }
    if (profileCV.showBuyerType) {
      if (user['buyer-type'] && user['buyer-type'].includes('{"value"')) {
        userUpdate['buyer-type'] = ''
      }
      userUpdate['buyer-type-other'] = !theme.variables.BuyerTypes[user['buyer-type']] ? 'other' : ''
      update['showBuyerTypeOther'] = !theme.variables.BuyerTypes[user['buyer-type']]
    }

    if (theme.features.users.genres) {
      update['selectedGenres'] = user['genres'].map((genre) => { return genre.id })
    }

    if (theme.features.programmeTypes.preferences) {
      update.selectedProgrammeTypes = user['programme-types'].map((programmeType) => programmeType.id)
    }

    this.setState(update, this.finishedLoading)
  }

  saveComplete = () => {
    const user = {...this.state.user}
    delete user['password']
    delete user['password-confirmation']
    this.setState({
      loading: false,
      user,
      errors: {}
    }, this.props.modalState.hideModal)
  }

  setErrors = () => {
    this.setState({
      loading: false,
      errors: UsersStore.getErrors()
    })
  }

  handleGenresChange = (values) => {
    const { user } = this.state
    user.genres = this.state.genres.filter(genre => values.split(',').includes(genre.id))
    this.setState({
      selectedGenres: values,
      user
    })
  }

  handleSelectChange = (type) => (selected) => {
    if (selected && selected.target) {
      selected = selected.target
    }
    let update = this.state.user
    update[type] = selected ? selected.value : ''
    this.setState({
      user: update
    })
  }

  updateInput = ({ target }) => {
    this.setState(({ user }) => ({
      user: Object.assign({}, user, {
        [target.name]: target.value
      })
    }))
  }

  handleCheckboxChange = (event) => {
    let update = this.state.user
    update[event.target.name] = event.target.checked
    this.setState({
      user: update
    })
  }

  renderTitle = () => {
    const { profileCV, requiredFieldsCV } = this.props
    return (
      <FormControl type="title" label="Title"
        name="title"
        onChange={this.handleSelectChange('title')}
        placeholder={false}
        required={requiredFieldsCV['title']}
        value={this.state.user['title']}
        disabled={true}
        custom={true}
        classes={profileCV.selectClasses}
    />
    )
  }

  renderFirstName = () => {
    const { user, errors } = this.state
    const { requiredFieldsCV } = this.props
    return (
      <FormControl label="First Name" type="text"
        required={requiredFieldsCV['first-name']}
        name="first-name" onChange={this.updateInput}
        value={user['first-name']}
        error={errors['first-name'] && 'Please enter your first name'}
      />
    )
  }

  renderLastName = () => {
    const { user, errors } = this.state
    const { requiredFieldsCV } = this.props
    return (
      <FormControl label="Last Name" type="text"
        required={requiredFieldsCV['last-name']}
        name="last-name" onChange={this.updateInput}
        value={user['last-name']}
        error={errors['last-name'] && 'Please enter your last name'}
      />
    )
  }

  renderEmailAddress = () => {
    const { user, errors } = this.state
    const { requiredFieldsCV, theme } = this.props
    return (
      <FormControl label="Email" type="text"
        required={requiredFieldsCV['email']}
        error={errors['email'] && 'Please enter your email'}
        name="email" onChange={this.updateInput}
        value={user['email']}
        readOnly={theme.features.users.readonlyEmail}
      />
    )
  }

  renderJobTitle = () => {
    const { user, errors } = this.state
    const { requiredFieldsCV } = this.props
    return (
      <FormControl label="Job Title" type="text"
        required={requiredFieldsCV['job-title']}
        error={errors['job-title'] && 'Please enter your job title'}
        name="job-title" onChange={this.updateInput}
        value={user['job-title']}
      />
    )
  }

  renderTelephone = () => {
    const { user, errors } = this.state
    const { requiredFieldsCV } = this.props
    return (
      <>
        <FormControl label="Telephone" type="text"
          required={requiredFieldsCV['telephone-number']}
          error={errors['telephone-number'] && 'Please enter your telephone number'}
          name="telephone-number" onChange={this.updateInput}
          value={user['telephone-number']}
        />
        <FormControl type="mobile" label="Mobile" name="mobile-number"
        required={requiredFieldsCV['mobile-number']}
          mobileNumber={user['mobile-number']}
          countryCode={user['mobile-country-code']}
          onChange={(countryCode, mobileNumber) => {
            this.updateInput({ target: { name: 'mobile-country-code', value: countryCode }})
            this.updateInput({ target: { name: 'mobile-number', value: mobileNumber }})
          }}
        >
          <p className="form__info">Used for in-app meeting notifications</p>
        </FormControl>
      </>
    )
  }

  renderProgrammeType = () => {
    const { theme } = this.props
    if(theme.features.programmeTypes.preferences) return false

    const options = this.props.programmeTypes.map((programmeType) => {
      return {
        value: programmeType.id,
        label: programmeType.name,
        programmeType
      }
    })
    return (
      <FormControl
        label={`${theme.localisation.programmeType.upper} Preferences`}
      >
        <Select
          options={options}
          value={this.state.selectedProgrammeTypes}
          multi={true}
          onChange={this.handleProgrammeTypeChange}
        />
      </FormControl>
    )
  }

  renderGenres = () => (
    <div key="genres">
      {this.props.theme.features.users.genres &&
        <FormControl label={this.props.registerCV.genrePreferencesLabel}>
          {this.renderGenresSelect(this.state.genres)}
        </FormControl>
      }
    </div>
  )

  renderAccountManager = () => {
    const { theme } = this.props
    const { user } = this.state
    if(theme.features.accountManager && user['user-type'] === 'external' && user['account-manager']) {
      return (
        <p><strong>{theme.localisation.accountManager.upper}</strong><br />
          {user['account-manager']['first-name'] + ' ' + user['account-manager']['last-name']}<br />
          <a href={'mailto:' + user['account-manager']['email']}>{user['account-manager']['email']}</a>
        </p>
      )
    }
  }

  renderTerritories =  () => {
    const { theme } = this.props
    const { user } = this.state
    if(theme.features.territories.enabled && user['territories'] && user['territories'].length > 0) {
      return (
        <div className="form__control">
          <p><strong>Territories</strong><br />
            {user['territories'].map(territory => territory['name']).join(', ')}
          </p>
        </div>
      )
    }
  }

  renderRegions =  () => {
    const { theme } = this.props
    const { user } = this.state
    if(theme.features.regions.enabled && user['regions']?.length > 0) {
      return (
        <div className="form__control">
          <p><strong>{pluralize(theme.localisation.region.upper)}</strong><br />
            {user['regions'].map(region => region['name']).join(', ')}
          </p>
        </div>
      )
    }
  }

  renderBuyerType = () => {
    const { user, errors } = this.state
    const { profileCV, buyerTypeCV, requiredFieldsCV, theme } = this.props
    const buyerOptions = Object.keys(theme.variables.BuyerTypes).map((key) => ({
      value: key,
      label: theme.variables.BuyerTypes[key]
    }))
    if(profileCV.showBuyerType) {
      return (
        <>
          {user['user-type'] === 'external' &&
            <FormControl label={buyerTypeCV.buyerTypeLabel}
              required={requiredFieldsCV['buyer-type']}
              error={errors['buyer-type'] && 'Please select a buyer type'}
            >
              <CustomSelect
                required={requiredFieldsCV['buyer-type']}
                onChange={(e) => {
                  if (e.target.value === 'other') {
                    this.handleSelectChange('buyer-type')('')
                    this.handleSelectChange('buyer-type-other')(e.target)
                  } else {
                    this.handleSelectChange('buyer-type')(e.target)
                  }
                  this.setState({ showBuyerTypeOther: e.target.value === 'other' })
                }}
                value={this.state.showBuyerTypeOther ? user['buyer-type-other'] : user['buyer-type']}
                name={this.state.showBuyerTypeOther ? 'buyer-type-other' : 'buyer-type'}
                options={buyerOptions}
              />
            </FormControl>
          }
          {this.state.showBuyerTypeOther && user['user-type'] === 'external' &&
            <FormControl label="Please specify" type="text"
              required={requiredFieldsCV['buyer-type']}
              name="buyer-type" onChange={this.updateInput}
              value={user['buyer-type']}
              error={errors['buyer-type'] && 'Must specify other'}
            />
          }
        </>
      )
    }
  }

  renderMarketing = () => {
    const { theme } = this.props
    const { user } = this.state
    return (
      <>
        <label className="form__label">Marketing Preference</label>
        { this.state.marketingDisplay ?
          <FormControl>
            <Checkbox
              label={theme.features.users.marketing.copy}
              id='marketing'
              name='marketing'
              onChange={this.handleCheckboxChange}
              checked={user['marketing']} />
          </FormControl>
          : (
            <p>
              {user['marketing'] === null ? 'Unset': (
                user['marketing'] ? 'Yes' : 'No'
              )}&nbsp;
              <span className="text-button" onClick={()=>this.setState({marketingDisplay: !this.state.marketingDisplay})}>Update</span>
            </p>
          )
        }
      </>
    )
  }

  onSubmit = (e) => {
    e.preventDefault()
    const user = Object.assign({}, this.state.user)
    let update = {
      'id': user['id'],
      'title': user['title'],
      'first-name': user['first-name'],
      'last-name': user['last-name'],
      'email': user['email'],
      'job-title': user['job-title'],
      'telephone-number': user['telephone-number'],
      'mobile-number': user['mobile-number'],
      'mobile-country-code': user['mobile-country-code'],
      'genres': user['genres'],
    }
    if(this.props.profileCV.showBuyerType){
      update['buyer-type'] = user['buyer-type']
    }
    if (user['password']) {
      update = Object.assign({
        'password': user['password'],
        'password-confirmation': user['password-confirmation']
      }, update)
    }
    if (user['marketing'] !== null) {
      update = Object.assign({marketing: user['marketing']}, update)
    }
    if (this.props.theme.features.programmeTypes.preferences) {
      update['programme-types'] = user['programme-types']
    }
    if (this.isValid()) {
      this.setState({
          loading: true,
        }, () => {
          UsersActions.updateUser(update)
      })
    }
  }

  changePassword = () => {
    const { modalState, profileCV } = this.props
    modalState.showModal(({state, hideModal}) => {
      const { passwordsAreValid, user } = state
      return (
        <Modal
          title="Change Password"
          closeEvent={() => {
            const update = {...user}
            delete update['password']
            delete update['password-confirmation']
            this.setState({
              user: update
            }, hideModal)
          }}
        >
          <div className="modal__content">
            <form className="form form--skinny panel" onSubmit={(e) => {
              e.preventDefault()
              this.setState({
                passwordsFormError: passwordsAreValid ? '' : 'invalid password'
              }, () => {
                if (passwordsAreValid) this.onSubmit(e)
              })
            }}>
              <PasswordInputs
                onChange={this.updateInput}
                onValidationComplete={(passwordsAreValid) => {
                  this.setState({
                    passwordsAreValid
                  })
                }}
                isPasswordReset={true}
                password={user?.['password'] || ''}
                passwordConfirmation={user?.['password-confirmation'] || ''}
                formErrors={{
                  password: this.state.passwordsFormError,
                  passwordConfirmation: ''
                }}
              />
              <div className="form__control form__control--actions">
                <button className={profileCV.changePasswordSaveButtonClasses(this.state.loading)}>Save</button>
              </div>
            </form>
          </div>
        </Modal>
      )
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


  renderGenresSelect = (genres) => {
    const options = []
    genres.filter(genre => !genre['parent-id'])
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
      <Select options={options}
        value={this.state.selectedGenres}
        multi={true}
        onChange={this.handleGenresChange}
        simpleValue={true}
      />
    )
  }

  renderFormGroup = (group) => {
    const groupFormInputs = group[Object.keys(group)].map((formName) => {
      return this.formMap[formName] && this.formMap[formName]()
    }).filter((input) => !!input)
    if (groupFormInputs.length === 0) return null
    return (
      <div key="panel" className="panel-section">
        <div className="panel-section__header">
          <h2 className="panel-section__title">{Object.keys(group)[0]}</h2>
        </div>
        <div className="panel-section__panel">
          <div className="form__group">
            {groupFormInputs}
          </div>
        </div>
      </div>
    )
  }

  renderFormInputs = () => {
    const { registerCV, theme } = this.props
    const renderForm = () => {
      const { registerCV } = this.props
      return (
        <>
          {registerCV.formOrder.map((formName) => {
            if(typeof formName === 'string'){
              return this.formMap[formName] && this.formMap[formName]()

            } else {
              return this.renderFormGroup(formName)
            }
          })}
          {this.props.theme.features.users.marketing.enabled &&
            this.renderMarketing()
          }
        </>
      )
    }

    return renderForm()
  }

  render() {
    const { user, errors } = this.state
    const { profileCV, theme } = this.props

    const requestAdditionalDetails = this.props.location.state?.requestAdditionalDetails
    const  { oauth } = theme.features

    this.props.modalState.watchVariables({
      passwordsAreValid: this.state.passwordsAreValid,
      passwordsFormError: this.state.passwordsFormError,
      user: this.state.user,
    })

    return (
      <Meta
        title={`${theme.localisation.client} :: ${theme.variables.SystemPages.profile.upper}`}
        meta={{
          description: `Manage your ${theme.localisation.client} profile`
        }}>
        <PageLoader {...this.state}>
          <main className={profileCV.mainSectionClass}>
            <div className="fade-on-load">
              <LoadPageBannerImage slug={`${theme.variables.SystemPages.profile.path}`} fallbackBannerImage={profileCV.bannerImage} >
                {({ image }) => (
                  <Banner
                    title={theme.variables.SystemPages.profile.upper}
                    classes={profileCV.bannerClasses}
                    image={image}
                  />
                )}
              </LoadPageBannerImage>

              <Breadcrumbs paths={[
                { name: theme.variables.SystemPages.account.upper, url: `/${theme.variables.SystemPages.account.path}` },
                { name: theme.variables.SystemPages.profile.upper , url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.profile.path}` }
              ]} classes={['bordered']} />
              <AccountNavigation currentPage={`/${theme.variables.SystemPages.profile.path}`} />

              { (!oauth.enabled || oauth.allowOneLogin.enabled) && (
                <div className="actions">
                  <div className="container">
                    <div className="actions__inner">
                      <button className={profileCV.changePasswordButtonClasses(errors)} onClick={this.changePassword}>Change Password</button>
                    </div>
                  </div>
                </div>
              )}

              <section className={profileCV.sectionClasses}>
                <div className="container">
                  { requestAdditionalDetails && (
                    <div className="u-center-content" style={{padding: '8px 0px 15px'}}>
                      <h4>** Please complete any missing information. **</h4>
                    </div>
                  )}
                  <form className={profileCV.formClass} onSubmit={this.onSubmit} noValidate>
                    <div className={profileCV.formSectionClass}>
                      {this.renderFormInputs()}
                    </div>
                    <div className="form__control form__control--actions">
                      <button type="submit" className={profileCV.saveButtonClasses(this.state.loading)}>Save</button>
                    </div>
                  </form>
                </div>
              </section>
            </div>
          </main>
        </PageLoader>
      </Meta>
    )
  }
}

const enhance = compose(
  withClientVariables('profileCV', allClientVariables),
  withClientVariables('registerCV', registerClientVariables),
  withClientVariables('buyerTypeCV', buyerTypeClientVariables),
  withClientVariables('requiredFieldsCV', requiredFieldsClientVariables),
  withModalRenderer,
  withHooks((props) => {
    const { theme } = props
    const programmeTypesResource = useResource('programme-type')
    const getProgrammeTypes = () => {
      programmeTypesResource.findAll({
        fields: {
          'programme-types': 'name'
        },
        sort: 'position'
      })
    }
    useEffect(() => {
      if (theme.features.programmeTypes.preferences) {
        getProgrammeTypes()
      }
    }, [])

    return {
      programmeTypes: programmeTypesResource.getDataAsArray() || []
    }
  }),
)

export default enhance(ProfileIndex)