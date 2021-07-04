import React from 'react'
import Store from 'javascript/stores/user'
import * as Actions from 'javascript/actions/user'
import Banner from 'javascript/components/banner'
import Meta from 'react-document-meta'
import queryString from 'query-string'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'
import ReCaptcha from 'javascript/components/re-captcha'

import compose from 'javascript/utils/compose'
import allClientVariables from './variables'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'

class ForgottenPassword extends React.Component {

  constructor(props) {
    super(props)
    this.params = queryString.parse(props.location.search)
    this.state = {
      resource: {},
      validation: {
        required: ['email']
      },
      error: null,
      errors: {}
    }
  }

  componentWillMount() {
    Store.on('resetRequested', this.resetRequested)
    Store.on('error', this.retrieveError)
  }

  componentWillUnmount() {
    Store.removeListener('resetRequested', this.resetRequested)
    Store.removeListener('error', this.retrieveError)
  }

  isValid = () => {
    const { validation } = this.state
    let isValidated = true
    let errors = {}
    if (validation.required) {
      validation.required.forEach((inputName) => {
        if (!this.state.resource[inputName]) {
          isValidated = false
          errors[inputName] = 'Please complete this field'
        }
      })
    }
    this.setState({
      errors: errors
    })
    return isValidated
  }

  retrieveError = () => {
    this.setState({
      error: Store.getError()
    })
  }
  renderError = () => {
    if (this.state.error) {
      const errorsStyling = this.state.error.includes('CAPTCHA') ? {textAlign: 'left'} : {}
      return (
        <p className="form__error" style={errorsStyling}>{this.state.error}</p>
      )
    }
  }

  updateResource = (e) => {
    let update = this.state.resource
    update[e.target.name] = e.target.value
    this.state.resource = update
  }

  handleSubmit = (gRecaptchaResponse = '') => {
    if (this.isValid()) {
      Actions.requestPasswordReset({
        ...this.state.resource,
        gRecaptchaResponse
      })
    }
  }

  resetRequested = () => {
    this.props.history.replace({
      pathname: '/',
      state: {
        notification: {
          message: 'If your email address exists in our database, you will receive password reset instructions shortly',
          type: 'success'
        }
      }
    })
  }

  render() {
    const {theme} = this.props
    const clientProps = this.props.forgottenPassword
    return (
      <Meta
        title={`${theme.localisation.client} :: ${theme.variables.SystemPages.forgottenPassword.upper}`}
        meta={{
          description: 'Request to reset your password',
        }}
      >
        <main>
          <div className="fade-on-load">
            <LoadPageBannerImage slug={theme.variables.SystemPages.forgottenPassword.path} fallbackBannerImage={clientProps.bannerImage}>
              {({ image }) => (
                <Banner
                  title={clientProps.bannerTitle(theme.variables.SystemPages.forgottenPassword.upper)}
                  copy={clientProps.bannerCopy}
                  classes={clientProps.bannerClasses}
                  image={image}
                />
              )}
            </LoadPageBannerImage>
            <section className={clientProps.sectionClasses}>
              <div className="container">
                <ReCaptcha
                  formType={'forgottenPassword'}
                  formSubmit={this.handleSubmit}
                  renderForm={({ renderRecaptchaWidget, submitRecaptchaForm }) => (
                    <form
                      onSubmit={submitRecaptchaForm}
                      className="form form--skinny panel"
                      noValidate={true}
                    >
                      <div className="form__control">
                        <label className="form__label form__label--required">
                          Your email address
                        </label>
                        <input
                          className="form__input"
                          type="email"
                          onChange={this.updateResource}
                          defaultValue={this.params.email}
                          name="email"
                        />
                        {this.state.errors['email'] && (
                          <span className="form__error">
                            {this.state.errors['email']}
                          </span>
                        )}
                      </div>
                      {this.renderError()}
                      {renderRecaptchaWidget()}
                      <div className="form__control form__control--actions">
                        <button className="button button--filled">
                          Reset Password
                        </button>
                      </div>
                    </form>
                  )}
                />
              </div>
            </section>
          </div>
        </main>
      </Meta>
    )
  }

}

const enhance = compose(
  withTheme,
  withClientVariables('forgottenPassword', allClientVariables)
)


export default enhance(ForgottenPassword)