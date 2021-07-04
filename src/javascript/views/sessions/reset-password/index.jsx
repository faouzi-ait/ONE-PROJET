import React, {useEffect, useState} from 'react'
import { NavLink } from 'react-router-dom'
import Store from 'javascript/stores/user'
import * as Actions from 'javascript/actions/user'
import Banner from 'javascript/components/banner'
import Meta from 'react-document-meta'
import PasswordInputs from 'javascript/components/password-inputs'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'

import compose from 'javascript/utils/compose'
import allClientVariables from './variables'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'
import withHooks from 'javascript/utils/hoc/with-hooks'
import useResource from 'javascript/utils/hooks/use-resource'

class ResetPassword extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      resource: {
        'id': this.props.match.params.token,
        'password-token': this.props.match.params.token,
        'password': '',
        'password-confirmation': ''
      },
      passwordsAreValid: false,
      error: null,
      errors: {}
    }
  }

  componentWillMount() {
    Store.on('passwordReset', this.passwordChanged)
    Store.on('error', this.retrieveError)
  }

  componentWillUnmount() {
    Store.removeListener('passwordReset', this.passwordChanged)
    Store.removeListener('error', this.retrieveError)
  }

  componentDidMount() {
    if (this.props.user) {
      setTimeout(() => {
        Actions.clearSession(this.props.theme, window.location.pathname)
      }, 100)
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.user && !prevProps.user) {
      this.props.history.push(`/${this.props.theme.variables.SystemPages.account.path}`)
    }
  }

  retrieveError = () => {
    this.setState({
      error: Store.getError()
    })
  }

  renderError = () => {
    const {error} = this.state
    if (error === 'password' || (Array.isArray(error)) && error.includes('password')) return null
    if (error) {
      return (
        <ul className="form__error">
          {typeof error === 'string' ? (
            <li>{error}</li>
          ) : (
            error.map((e, i) => {
              return <li key={i}>{e}</li>
            })
          )}
        </ul>
      )
    }
  }

  updateResource = (e) => {
    let update = {...this.state.resource}
    update[e.target.name] = e.target.value
    this.setState({
      resource: update
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    if (this.state.passwordsAreValid) {
      Actions.resetPassword(this.state.resource)
    } else {
      this.setState({
        error: ['password']
      })
    }
  }

  passwordChanged = () => {
    this.props.history.replace({
      pathname: '/',
      state: {
        notification: {
          message: 'Your password has been changed',
          type: 'success'
        }
      }
    })
  }

  render() {
    const clientProps = this.props.resetPassword
    const { localisation, variables } = this.props.theme
    return (
      <Meta
        title={`${localisation.client} :: Reset Password`}
        meta={{
          description: `Reset your ${localisation.client} password`
        }}>
        <main>
          <div className="fade-on-load">
            <LoadPageBannerImage slug={variables.SystemPages.resetPassword.path} fallbackBannerImage={clientProps.bannerImage}>
              {({ image }) => (
                <Banner
                  title={variables.SystemPages.resetPassword.upper}
                  copy={this.props.validToken && clientProps.bannerCopy}
                  classes={clientProps.bannerClasses}
                  image={image}
                />
              )}
            </LoadPageBannerImage>
            <section className={clientProps.sectionClasses}>
              <div className="container">
                {this.props.validToken ? (
                  <form onSubmit={this.handleSubmit} className="form form--skinny panel" noValidate={true}>
                    <PasswordInputs
                      onChange={this.updateResource}
                      onValidationComplete={(passwordsAreValid) => {
                        this.setState({
                          passwordsAreValid
                        })
                      }}
                      password={this.state.resource['password']}
                      passwordConfirmation={this.state.resource['password-confirmation']}
                      isPasswordReset={true}
                      formErrors={{
                        password: this.state.error?.includes('password') || '',
                        passwordConfirmation: this.state.error?.includes('password-confirmation') || ''
                      }}
                    />
                    {this.renderError()}
                    <div className="form__control form__control--actions">
                      <button className="button button--filled">Reset Password</button>
                    </div>
                  </form>
                  ) : (
                  <>
                    <p>{`This link has now expired. Please generate another ${variables.SystemPages.forgottenPassword.lower} link`}</p>
                    <p><NavLink to={`/${variables.SystemPages.forgottenPassword.path}`} className="button">{variables.SystemPages.forgottenPassword.upper}</NavLink></p>
                  </>
                )}
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
  withClientVariables('resetPassword', allClientVariables),
  withHooks((props) => {
    const [validToken, setValidToken] = useState([])

    const passwordsResource = useResource('password')

    const getPasswords = () => {
      passwordsResource.findOne(props.match.params.token, {}).then((response) => {
        setValidToken(true)
      }).catch((error) => {
        setValidToken(false)
      })
    }

    useEffect(getPasswords, [])

    return {
      validToken
    }
  })
)


export default enhance(ResetPassword)