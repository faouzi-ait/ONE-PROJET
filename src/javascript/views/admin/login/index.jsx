import React from 'react'

import 'stylesheets/admin/base'
import loginClientVariables from 'javascript/views/admin/login/variables'

import Store from 'javascript/stores/user'
import * as Actions from 'javascript/actions/user'
import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import { shouldDisplayOneLogin } from 'javascript/views/sessions/new'

import Button from 'javascript/components/button'
import GlobalStyle from 'javascript/utils/theme/GlobalStyle'
import ReCaptcha from 'javascript/components/re-captcha'
import OAuthLoginButtons from 'javascript/components/oauth-login-buttons'

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      loading: false,
      error: false
    }
  }

  componentWillMount() {
    Store.on('error', this.retrieveError)
  }

  componentWillUnmount() {
    Store.removeListener('error', this.retrieveError)
  }

  retrieveError = () => {
    this.setState({
      error: Store.getError(),
      loading: false
    })
  }

  renderError = () => {
    if (this.state.error) {
      return (
        <p className="cms-form__error">{this.state.error}</p>
      )
    }
  }

  updateUser = (e) => {
    let update = this.state.user
    update[e.target.name] = e.target.value
    this.setState({
      user: update
    })
  }

  handleSubmit = (gRecaptchaResponse = '') => {
    this.setState({ loading: true })
    Actions.authenticateUser(this.state.user, this.props.theme, gRecaptchaResponse)
  }

  render() {
    const { loginCV, theme } = this.props
    const buttonClasses = this.state.loading ? loginCV.loadingButtonClasses : loginCV.buttonClasses
    return (
      <div className="cms-page">
        <main class="login">
          <div className="container">
            <img src={theme.customer?.logoImageUrls?.default || loginCV.logo} className="logo"></img>
            <ReCaptcha
              formType={'userLogin'}
              formSubmit={this.handleSubmit}
              renderForm={({ renderRecaptchaWidget, submitRecaptchaForm }) => (
                <form onSubmit={submitRecaptchaForm} className="cms-form panel">
                  <OAuthLoginButtons loading={this.state.loading} />
                  { shouldDisplayOneLogin(theme.features) && (
                    <>
                      <div className="cms-form__control">
                        <label className="cms-form__label cms-form__label--required">Email</label>
                        <input className="cms-form__input" required type="text" onChange={this.updateUser} name="email" />
                      </div>
                      <div className="cms-form__control">
                        <label className="cms-form__label cms-form__label--required">Password</label>
                        <input className="cms-form__input" required type="password" onChange={this.updateUser} name="password" />
                      </div>
                      {this.renderError()}
                      {renderRecaptchaWidget()}
                      <div className="cms-form__control cms-form__control--actions">
                        <Button id="login-btn" className={buttonClasses}>Login</Button>
                      </div>
                      <div className="u-center-content">
                        <a href={`/${theme.variables.SystemPages.forgottenPassword.path}`}>
                          {theme.variables.SystemPages.forgottenPassword.upper === 'Forgotten Password' ? 'Forgot password?' : `${theme.variables.SystemPages.forgottenPassword.upper}?` }
                        </a>
                      </div>
                    </>
                  )}
                </form>
              )}
            />
          </div>
        </main>
        <GlobalStyle />
      </div>
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('loginCV', loginClientVariables)
)

export default enhance(Login)