import React from 'react'
import Meta from 'react-document-meta'
import { NavLink } from 'react-router-dom'
import { withRouter } from 'react-router-dom'

import allClientVariables from './variables'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import compose from 'javascript/utils/compose'
import { hasEnabledOAuthProvider } from 'javascript/components/oauth-login-buttons'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'

//State
import Store from 'javascript/stores/user'
import * as Actions from 'javascript/actions/user'
// Components
import Banner from 'javascript/components/banner'
import OAuthLoginButtons from 'javascript/components/oauth-login-buttons'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'
import ReCaptcha from 'javascript/components/re-captcha'

export const shouldDisplayOneLogin = (features) => {
  return !features.oauth.enabled || (features.oauth.allowOneLogin.enabled || !hasEnabledOAuthProvider(features.oauth.providers))
}

class NewSession extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      loading: false
    }
    this.updateUser = this.updateUser.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.retrieveError = this.retrieveError.bind(this)
    this.renderError = this.renderError.bind(this)
    this.renderForm = this.renderForm.bind(this)
  }

  componentWillMount() {
    Store.on('error', this.retrieveError)
  }

  componentWillUnmount() {
    Store.removeListener('error', this.retrieveError)
  }

  componentDidMount() {
    document.getElementById('email-input')?.focus()
  }

  retrieveError() {
    this.setState({
      error: Store.getError(),
      loading: false
    })
  }

  renderError() {
    if (this.state.error) {
      const errorsStyling = this.state.error.includes('CAPTCHA') ? {textAlign: 'left'} : {}
      return (
        <p className="form__error" style={errorsStyling}>{this.state.error}</p>
      )
    }
  }

  updateUser(e) {
    let update = this.state.user
    update[e.target.name] = e.target.value
    this.setState({
      user: update
    })
  }

  handleSubmit(gRecaptchaResponse = '') {
    this.setState({ loading: true })
    Actions.authenticateUser(this.state.user, this.props.theme, gRecaptchaResponse)
  }

  renderForm() {
    const {clientVariables, theme: { features, localisation, variables }} = this.props
    const buttonClasses = this.state.loading ? clientVariables.loadingButtonClasses : clientVariables.buttonClasses
    return (
      <ReCaptcha
        formType={'userLogin'}
        formSubmit={this.handleSubmit}
        renderForm={({ renderRecaptchaWidget, submitRecaptchaForm }) => (
          <form
            className="form form--skinny panel" noValidate={true}
            onSubmit={submitRecaptchaForm}
          >
            <OAuthLoginButtons loading={this.state.loading} />
            { shouldDisplayOneLogin(features) && (
              <>
                <div className="form__control">
                  <label className="form__label form__label--required">Email</label>
                  <input
                    id="email-input"
                    className="form__input"
                    required
                    type="text"
                    onChange={this.updateUser}
                    name="email"
                    placeholder={clientVariables.showInputPlaceholders && 'Email'} />
                </div>
                <div className="form__control">
                  <label className="form__label form__label--required">Password</label>
                  <input
                    className="form__input"
                    required
                    type="password"
                    onChange={this.updateUser}
                    name="password"
                    placeholder={clientVariables.showInputPlaceholders && 'Password'} />
                </div>
                {this.renderError()}
                {renderRecaptchaWidget()}
                <div className="form__control form__control--actions">
                  <button id="login-btn" className={buttonClasses}>{clientVariables.loginButtonText}</button>
                </div>
                <div className="u-center-content">
                  <NavLink to={`/${variables.SystemPages.forgottenPassword.path}`} test-id="forgot_password_button" className={clientVariables.forgotPasswordButtonClasses}>{clientVariables.forgottenPasswordText(localisation.forgottenPassword.upper)}</NavLink>
                  { this.props.theme.features.users.registrations.enabled &&
                    <>
                      <ClientChoice>
                        <ClientSpecific client="default">
                          &nbsp;
                        </ClientSpecific>
                        <ClientSpecific client="itv">
                          &nbsp;&nbsp;&nbsp;
                        </ClientSpecific>
                      </ClientChoice>
                      <NavLink to="/register" className={clientVariables.registerButtonClasses}>
                        {clientVariables.registerText}
                      </NavLink>
                    </>
                  }
                </div>
              </>
            )}
          </form>
        )}
      />
    )
  }

  render() {
    const {inpage, clientVariables, theme, intro} = this.props
    if (!inpage) {
      return (
        <Meta
          title={`${theme.localisation.client} :: ${theme.variables.SystemPages.login.upper}`}
          meta={{
            description: `Login to the ${theme.localisation.client} system`,
          }}
        >
          <main>
            <div className="fade-on-load">
              <LoadPageBannerImage slug={theme.variables.SystemPages.login.path} fallbackBannerImage={clientVariables.bannerImage}>
                {({ image }) => (
                  <>
                    <Banner
                      title={theme.variables.SystemPages.login.upper}
                      classes={clientVariables.bannerClasses}
                      image={image}
                    />
                  </>
                )}
              </LoadPageBannerImage>

              {clientVariables.loginIntro &&
                <section className="section">
                  <div className="container">
                    <div className="wysiwyg" dangerouslySetInnerHTML={{__html: clientVariables.loginIntro}}></div>
                  </div>
                </section>
              }

              <section className={clientVariables.sectionClasses}>
                <div className="container">{this.renderForm()}</div>
              </section>

              {clientVariables.loginCopy &&
                <section className="section">
                  <div className="container">
                    <div className="wysiwyg" dangerouslySetInnerHTML={{__html: clientVariables.loginCopy}}></div>
                  </div>
                </section>
              }
            </div>
          </main>
        </Meta>
      )
    } else {
      return (
        <div className="modal__content">
          {theme.features.loginIntro && intro &&
            <div className="form--skinny modal__copy" dangerouslySetInnerHTML={{ __html: theme.features.loginIntro }}></div>
          }
          {this.renderForm()}
        </div>
      )
    }
  }
}

const enhance = compose(
  withRouter,
  withTheme,
  withClientVariables('clientVariables', allClientVariables),
)

export default enhance(NewSession)