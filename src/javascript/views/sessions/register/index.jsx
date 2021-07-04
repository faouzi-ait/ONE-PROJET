import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import styled from 'styled-components'
import breakpoint from 'javascript/utils/theme/breakpoint'

import allClientVariables from './variables'
import buyerTypeClientVariables from 'javascript/views/sessions/register/buyer-type.variables'
import requiredFieldsClientVariables from 'javascript/views/sessions/register/required-fields.variables'
import accountManagerClientVariables from 'javascript/views/sessions/register/account-manager.variables'
import prefetchPgSzClientVariables from 'javascript/views/sessions/register/prefetch-pg-sz.variables'

import { capitalize, makeGenreSelectOptions } from 'javascript/utils/generic-tools'
import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withWaitForLoadingDiv from 'javascript/components/hoc/with-wait-for-loading-div'
import snakeToCamel from 'javascript/utils/helper-functions/snakeToCamel'

import { GOOGLE_RECAPTCHA_ERROR_TXT } from 'javascript/services/auth'
// Actions
import UserActions from 'javascript/actions/users'
import GenreActions from 'javascript/actions/genres'

// Stores
import UserStore from 'javascript/stores/users'
import GenreStore from 'javascript/stores/genres'

// Components
import AsyncSearchResource from 'javascript/components/async-search-resource'
import Banner from 'javascript/components/banner'
import Checkbox from 'javascript/components/custom-checkbox'
import CustomSelect from 'javascript/components/custom-select'
import Form from 'javascript/components/form'
import FormControl from 'javascript/components/form-control'
import Meta from 'react-document-meta'
import NotFound from 'javascript/components/not-found'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import PasswordInputs from 'javascript/components/password-inputs'
import ReCaptcha from 'javascript/components/re-captcha'
import Select from 'react-select'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'


class SessionRegister extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      selectedProgrammeTypes: [],
      user: {
        marketing: false
      },
      errors: [],
      formErrors: [],
      resources: [],
      buyerTypeTextField: false,
      loading: false,
      passwordsAreValid: false
    }
    if (props.theme.features.users.genres) {
      this.state.genres = []
      this.state.selectedGenres = []
    }
    this.formMap = {
      'title': this.renderTitle,
      'firstName': this.renderFirstName,
      'lastName': this.renderLastName,
      'email': this.renderEmailAddress,
      'jobTitle': this.renderJobTitle,
      'companyName': this.renderCompany,
      'countryCode': this.renderCountry,
      'telephoneNumber': this.renderTelephone,
      'genres': this.renderGenres,
      'accountManager': this.renderAccountManager,
      'territories': this.renderTerritories,
      'buyerType': this.renderBuyerType,
      'policyWarning': this.renderPolicyWarning,
      'contactHeading': this.renderContactHeading,
      'programmeType': this.renderProgrammeType,
      'regions': this.renderRegions,
      'password': this.renderPassword,
    }
  }

  componentWillMount() {
    UserStore.on('change', this.userCreated)
    UserStore.on('error', this.updateErrors)
    UserStore.on('receivedAccountManagers', this.updateAccountManagers)
    GenreStore.on('change', this.getResources)
  }

  componentWillUnmount() {
    UserStore.removeListener('change', this.userCreated)
    UserStore.removeListener('error', this.updateErrors)
    UserStore.removeListener('receivedAccountManagers', this.updateAccountManagers)
    GenreStore.removeListener('change', this.getResources)
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
      this.props.waitForLoading.waitFor('genres')
    }
    if (this.props.theme.features.accountManager) {
      UserActions.getAccountManagers({
        fields: {
          'users': 'first-name,last-name'
        },
        sort: 'first-name'
      })
      this.props.waitForLoading.waitFor('accountManager')
    }
  }

  updateValue = ({ target:  { name, value } }) => {
    this.setState(({ user }) => ({
      user: Object.assign({}, user, {
        [name]: value
      }),
    }))
  }

  updateSelectValue = (name,value) => {
    this.setState(({ user }) => ({
      user: Object.assign({}, user, {
        [name]: value
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

  getResources = () => {
    this.setState({
      genres: GenreStore.getResources(),
    }, () => this.props.waitForLoading.finished('genres'))
  }

  updateAccountManagers = () => {
    const resources = UserStore.getAccountManagers()
    resources.unshift({
      id: null,
      'first-name': this.props.accountManagerCV.unknownAMLabel,
      'last-name': ''
    })
    this.setState({
      resources,
    }, () => this.props.waitForLoading.finished('accountManager'))
  }

  updateErrors = () => {
    this.setState({
      loading: false,
      errors: UserStore.getErrors()
    })
  }

  renderErrors = () => {
    const { registerCV } = this.props
    if (this.state.errors) {
      return (
        <div>
          {Object.keys(this.state.errors).map((key, i) => {
            const error = this.state.errors[key]
            let errorMsg = `${capitalize(key)} ${error}`
            let errorsStyling = {}
            if (error.includes('g-recaptcha')) {
              errorMsg = GOOGLE_RECAPTCHA_ERROR_TXT
              errorsStyling = {textAlign: 'left'}
            }
            return (
              <p className={registerCV.formErrorClasses} key={i} style={errorsStyling}>{errorMsg}</p>
            )
          })}
        </div>
      )
    }
  }

  userCreated = () => {
    this.setState({ loading: false })
    const user = this.state.user
    this.props.history.push({
      pathname: '/registration-successful',
      state: user
    })
  }

  territoriesAreRequired = () => {
    const { requiredFieldsCV, theme } = this.props
    return (theme.features.territories.enabled && requiredFieldsCV['territories'])
  }

  valid = () => {
    const { requiredFieldsCV, theme } = this.props
    const { user } = this.state
    const validators = Object.keys(requiredFieldsCV)
      .filter(key => requiredFieldsCV[key] && this.formMap[snakeToCamel(key)])
      .filter(key => !['territories', 'regions', 'account-manager', 'password'].includes(key))

    if (this.territoriesAreRequired()) {
      validators.push('territories')
    }
    if (this.props.theme.features.regions.enabled) {
      validators.push('regions')
    }
    if (this.props.theme.features.accountManager && requiredFieldsCV['account-manager']) {
      validators.push('account-manager')
    }
    if (requiredFieldsCV['buyer-type'] && user['buyer-type'] === 'other' && user['buyer-type-other'].length < 1) {
      validators.push('buyer-type-other')
    }
    if (this.props.theme.features.users.registrations.password) {
      validators.push('password')
      validators.push('password-confirmation')
    }
    const formErrors = validators.filter(v => !user[v])
    if (this.props.theme.features.users.registrations.password && !this.state.passwordsAreValid) {
      formErrors.push('password')
    }
    this.setState({ formErrors })
    return formErrors.length <= 0
  }

  onSubmit = (gRecaptchaResponse = '') => {
    if (!this.valid()) {
      return false
    }
    this.setState({ loading: true })
    let relationships = {}
    if (this.props.theme.features.accountManager) {
      const am = this.state.resources.filter(item => item.id === this.state.user['account-manager'])
      relationships = { 'account-manager': (am.length > 0) ? am[0] : null }
    }
    const user = {
      ...this.state.user,
      ...(gRecaptchaResponse && {'g-recaptcha-response': gRecaptchaResponse})
    }
    if (user['buyer-type-other'] && user['buyer-type-other'].length > 0 && user['buyer-type'] === 'other') {
      user['buyer-type'] = user['buyer-type-other']
      delete user['buyer-type-other']
    }
    UserActions.createResource(Object.assign({}, user, relationships))
  }

  handleTerritoriesChange = (selectedTerritories) => {
    const user = {...this.state.user}
    user.territories = selectedTerritories
    this.setState({
      user
    })
  }

  handleRegionChange = (selectedRegions) => {
    const user = { ...this.state.user }
    user.regions = selectedRegions
    this.setState({
      user
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

  handleProgrammeTypeChange = (values) => {
    const update = { ...this.state.user }
    const selectedProgrammeTypes = values.map(value => value.programmeType.id)
    update['programme-types'] = values.map(value => value.programmeType)
    this.setState({
      user: update,
      selectedProgrammeTypes
    })
  }

  renderTitle = () => {
    const { registerCV, requiredFieldsCV } = this.props
    return (
      <FormControl type="title" label="Title"
        name="title" key="title"
        required={requiredFieldsCV['title']}
        error={this.state.formErrors.includes('title') && 'Please select a title'}
        onChange={this.updateValue}
        value={this.state.user['title']}
        disabled={true}
        custom={true}
        classes={registerCV.selectClasses}
      />
    )
  }

  renderFirstName = () => {
    const { requiredFieldsCV } = this.props
    return (
      <FormControl key='first-name' label="First Name" type="text"
        required={requiredFieldsCV['first-name']}
        name="first-name" onChange={this.updateValue}
        value={this.state.user['first-name']}
        error={this.state.formErrors.includes('first-name') && 'Please enter your first name'}
      />
    )
  }

  renderLastName = () => {
    const { requiredFieldsCV } = this.props
    return (
      <FormControl key="last-name" label="Last Name" type="text"
        required={requiredFieldsCV['last-name']}
        name="last-name" onChange={this.updateValue}
        value={this.state.user['last-name']}
        error={this.state.formErrors.includes('last-name') && 'Please enter your last name'}
      />
    )
  }

  renderEmailAddress = () => {
    const { requiredFieldsCV } = this.props
    return (
      <FormControl key="email" label="Email Address" type="text"
        required={requiredFieldsCV['email']}
        name="email" onChange={this.updateValue}
        value={this.state.user['email']}
        error={this.state.formErrors.includes('email') && 'Please enter your email'}
      />
    )
  }

  renderJobTitle = () => {
    const { requiredFieldsCV } = this.props
    return (
      <FormControl key="job-title" label="Job Title" type="text"
        required={requiredFieldsCV['job-title']}
        name="job-title" onChange={this.updateValue}
        value={this.state.user['job-title']}
        error={this.state.formErrors.includes('job-title') && 'Please enter your job title'}
      />
    )
  }

  renderCompany = () => {
    const { requiredFieldsCV } = this.props
    return (
      <FormControl key="company-name" label="Company" type="text"
        required={requiredFieldsCV['company-name']}
        name="company-name" onChange={this.updateValue}
        value={this.state.user['company-name']}
        error={this.state.formErrors.includes('company-name') && 'Please enter your company name'}
      />
    )
  }

  renderTelephone = () => {
    const { requiredFieldsCV } = this.props
    return (
      <FormControl key="telephone-number" label="Telephone" type="text"
        required={requiredFieldsCV['telephone-number']}
        name="telephone-number" onChange={this.updateValue}
        value={this.state.user['telephone-number']}
        error={this.state.formErrors.includes('telephone-number') && 'Please enter your telephone number'}
      />
    )
  }

  renderGenres = () => (
    <div key="genres">
      {this.props.theme.features.users.genres &&
        <FormControl label={this.props.registerCV.genrePreferencesLabel}>
          <Select options={makeGenreSelectOptions(this.state.genres)}
            aria-label={'genres'}
            value={this.state.selectedGenres}
            multi={true}
            onChange={this.handleGenresChange}
            simpleValue={true}
          />
        </FormControl>
      }
    </div>
  )


  renderBuyerType = () => {
    const { buyerTypeCV, requiredFieldsCV, theme } = this.props
    const buyerOptions = Object.keys(theme.variables.BuyerTypes).map((key) => ({
      value: key,
      label: theme.variables.BuyerTypes[key]
    }))
    return (
      <div key="buyer-type">
        <FormControl
          required={requiredFieldsCV['buyer-type']}
          label={buyerTypeCV.buyerTypeLabel}
          error={this.state.formErrors.includes('buyer-type') && buyerTypeCV.buyerTypeWarning}
        >
          <CustomSelect
            required={requiredFieldsCV['buyer-type']}
            value={this.state.user['buyer-type']}
            aria-label={'buyer-type'}
            name="buyer-type" options={buyerOptions}
            onChange={(e) => {
              this.setState({ buyerTypeTextField: e.target.value === 'other' })
              if (e.target.value !== 'other') {
                this.updateSelectValue('buyer-type', e.target.value);
              } else {
                this.updateSelectValue('buyer-type', 'other');
                this.updateSelectValue('buyer-type-other', '');
              }
            }}
          />
        </FormControl>
        {this.state.buyerTypeTextField &&
          <FormControl label="Please specify" type="text"
            required={requiredFieldsCV['buyer-type']}
            name="buyer-type-other"
            onChange={this.updateValue}
            value={this.state.user['buyer-type-other']}
            error={this.state.formErrors.includes('buyer-type-other') && 'Must specify other'}
          />
        }
      </div>
    )
  }

  renderAccountManager = () => {
    const { registerCV, requiredFieldsCV } = this.props
    return (
      <div key="account-manager">
        {this.props.theme.features.accountManager &&
          <FormControl label={this.props.theme.localisation.accountManager.upper}
            required={requiredFieldsCV['account-manager']}
            error={this.state.formErrors.includes('account-manager') && 'Please select an account manager'}
          >
            <CustomSelect
              required={requiredFieldsCV['account-manager']}
              aria-label={'account-manager'}
              onChange={this.updateValue}
              name="account-manager"
              value={this.state.user['account-manager'] || ''}
              classes={registerCV.selectClasses}
              options={this.state.resources.map((r) => {
                return {
                  value: r.id,
                  label: `${r['first-name']} ${r['last-name']}`
                }
              })} />
          </FormControl>
        }
      </div>
    )
  }

  renderTerritories = () => {
    const { prefetchPageSizeCV, registerCV, theme } = this.props
    return (
      <>
        {this.props.theme.features.territories.enabled &&
          <FormControl key="territory" label={registerCV.territoriesTitle}
            required={this.territoriesAreRequired()}
            error={this.state.formErrors.includes('territories') && 'Please select territories'}
          >
            <AsyncSearchResource
              required={this.territoriesAreRequired()}
              onChange={this.handleTerritoriesChange}
              className={registerCV.territoriesSelectClasses}
              multi={true}
              value={this.state.user.territories}
              limit={theme.features.territories.limits.approvals}
              resourceType={'territories'}
              placeholder="Search..."
              prefetchPageSize={prefetchPageSizeCV.territories}
            />
          </FormControl>
        }
      </>
    )
  }

  renderRegions = () => {
    const { prefetchPageSizeCV, registerCV, requiredFieldsCV, theme } = this.props
    return (
      <>
        {theme.features.regions.enabled &&
          <FormControl key="regions" label={pluralize(theme.localisation.region.upper)}
            required={requiredFieldsCV['regions']}
            error={this.state.formErrors.includes('regions') && `Please select ${pluralize(theme.localisation.region.lower)}`}
          >
            <AsyncSearchResource
              resourceType={'regions'}
              required={requiredFieldsCV['regions']}
              multi={true}
              value={this.state.user.regions}
              onChange={this.handleRegionChange}
              placeholder="Search..."
              prefetchPageSize={prefetchPageSizeCV.regions}
            />
          </FormControl>
        }
      </>
    )
  }

  renderMarketing = () => (
    <div key='marketing' className="form__control">
      <div className="form__inner">
        <FormControl>
          <Checkbox
            label={this.props.theme.features.users.marketing.copy}
            id='marketing'
            name='marketing'
            onChange={this.handleCheckboxChange}
            checked={this.state.user['marketing']} />
        </FormControl>
      </div>
    </div>
  )

  renderPolicyWarning = () => (
    <p key="policy-warning">
      Registration on and use of this website indicates your acceptance of our <a href="/terms-and-conditions-">Terms and Conditions of Use</a> and our <a href="/privacy-policy">Privacy Policy</a>.
    </p>
  )

  renderContactHeading = () => (
    <ClientChoice key="contact-heading">
      <ClientSpecific client="default">
        <h2 >Contact details</h2>
      </ClientSpecific>
      <ClientSpecific client="all3">
        <h3>Contact details</h3>
      </ClientSpecific>
    </ClientChoice>
  )

  renderPassword = () => {
    if (!this.props.theme.features.users.registrations.password) return null
    return (
      <PasswordInputs
        key="passwords"
        onChange={this.updateValue}
        onValidationComplete={(passwordsAreValid) => {
          this.setState({
            passwordsAreValid
          })
        }}
        password={this.state.user['password']}
        passwordConfirmation={this.state.user['password-confirmation']}
        formErrors={{
          password: this.state.formErrors.includes('password'),
          passwordConfirmation: this.state.formErrors.includes('password-confirmation')
        }}
      />
    )
  }

  renderProgrammeType = () => {
    if (!this.props.theme.features.programmeTypes.preferences) return null
    const options = this.props.programmeTypes.map((programmeType) => {
      return {
        value: programmeType.id,
        label: programmeType.name,
        programmeType
      }
    })
    return (
      <FormControl
        key="programme-types"
        label={`${this.props.theme.localisation.programmeType.upper} Preferences`}
      >
        <Select
          options={options}
          aria-label={'programme-types'}
          value={this.state.selectedProgrammeTypes}
          multi={true}
          onChange={this.handleProgrammeTypeChange}
        />
      </FormControl>
    )
  }

  renderCountry = () => {
    const { requiredFieldsCV } = this.props
    return (
      <div key="country">
        {this.props.theme.features.users.country &&
          <FormControl type="country-code"
            required={requiredFieldsCV['country-code']}
            label="Your Location" name="country-code"
            priorityCountryCodes={'GB,US'}
            value={this.state.user['country-code']}
            onChange={this.updateValue}
            error={this.state.formErrors.includes('country-code') && 'Please select your location'}
          />
        }
      </div>
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
              return this.formMap[formName]()
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

    return (
      <ClientChoice key='section-popout'>
        <ClientSpecific client="default">
          {renderForm()}
        </ClientSpecific>
        <ClientSpecific client="all3">
          <div class="section__popout">
            <h3>Personal details</h3>
            {renderForm()}
          </div>
          { this.props.theme.features.accountManager &&
            <>
              <h3>Who is your {this.props.theme.localisation.accountManager.upper}?</h3>
              <div class="section__popout">
                {this.renderAccountManager()}
              </div>
              <small>For information on how we process your data, please review our <a href="/privacy-policy">Privacy Policy.</a></small>
            </>
          }
        </ClientSpecific>
      </ClientChoice>
    )
  }

  render() {
    const { registerCV, theme } = this.props
    const buttonClasses = registerCV.buttonClasses(this.state.loading)

    if (this.props.user) {
      return <NotFound />
    }

    return (
      <PageLoader {...this.state} loaded={this.props.resourcesHaveLoaded}>
        <Meta
          title={`${theme.localisation.client} :: Register`}
          meta={{
            description: `Register for an ${theme.localisation.client} account`
          }}>
          <main className={registerCV.mainClasses}>
            <div className="fade-on-load">
              <LoadPageBannerImage slug={theme.variables.SystemPages.register.path} fallbackBannerImage={registerCV.bannerImage}>
                {({ image }) => (
                  <Banner
                  title={theme.variables.SystemPages.register.upper}
                  classes={registerCV.bannerClasses}
                  image={image}
                />
                )}
              </LoadPageBannerImage>
              {registerCV.registerCopy &&
                <section className="section">
                  <div className="container">
                    <div className="wysiwyg" dangerouslySetInnerHTML={{__html: registerCV.registerCopy}}></div>
                  </div>
                </section>
              }

              <section className={registerCV.sectionClasses}>
                <div className={registerCV.containerClasses}>
                  <ReCaptcha
                    formType={'userRegistration'}
                    formSubmit={this.onSubmit}
                    renderForm={({ renderRecaptchaWidget, submitRecaptchaForm }) => (
                      <Form className={registerCV.formClasses} onSubmit={submitRecaptchaForm} noValidate submitIsLoading={this.state.loading} >
                        <ClientSpecific client="drg">
                          <h1>Please enter your details</h1>
                          <h2>Personal details</h2>
                        </ClientSpecific>
                        {this.renderFormInputs()}
                        {this.renderErrors()}
                        {renderRecaptchaWidget()}
                        <ButtonWrapper className="form__control form__control--actions">
                          <button className={buttonClasses} disabled={this.state.loading}>{registerCV.buttonText}</button>
                        </ButtonWrapper>
                      </Form>
                    )}

                  />
                </div>
              </section>
            </div>
          </main>
        </Meta>
      </PageLoader>
    )
  }
}

const enhance = compose(
  withClientVariables('registerCV', allClientVariables),
  withClientVariables('buyerTypeCV', buyerTypeClientVariables),
  withClientVariables('requiredFieldsCV', requiredFieldsClientVariables),
  withClientVariables('accountManagerCV', accountManagerClientVariables),
  withClientVariables('prefetchPageSizeCV', prefetchPgSzClientVariables),
  withWaitForLoadingDiv,
  withHooks((props) => {
    const { theme, waitForLoading } = props
    const [resourcesHaveLoaded, setResourcesHaveLoaded] = useState(false)

    const programmeTypesResource = useResource('programme-type')
    const getProgrammeTypes = () => {
      waitForLoading.waitFor('programmeTypes')
      programmeTypesResource.findAll({
        fields: {
          'programme-types': 'name'
        },
        sort: 'position'
      }).then(() => waitForLoading.finished('programmeTypes'))
    }

    useEffect(() => {
      waitForLoading.onCompletion(() => {
        setResourcesHaveLoaded(true)
      })
      if (theme.features.programmeTypes.preferences) {
        getProgrammeTypes()
      }
    }, [])

    return {
      resourcesHaveLoaded,
      programmeTypes: programmeTypesResource.getDataAsArray() || [],
    }
  })
)

export default enhance(SessionRegister)

const ButtonWrapper = styled.div`
  ${breakpoint('small')`
    height: 75px;
  `}
`
