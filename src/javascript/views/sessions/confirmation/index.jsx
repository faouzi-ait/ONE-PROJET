import React from 'react'
import NotFoundComponent from 'javascript/components/not-found'
import Banner from 'javascript/components/banner'
import Meta from 'react-document-meta'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'

import compose from 'javascript/utils/compose'
import { NO_CUSTOM_BANNER } from "javascript/utils/constants"
import allClientVariables from './variables'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'

const renderConfirmationCopyWithAccountManager = (user, accountManager) =>
  <React.Fragment>
    <h2>Thanks for registering {user['first-name']}!</h2>
    <br />
    <p>Your {accountManager} <strong>{user.am['first-name']} {user.am['last-name']}</strong> is aware of your registration, and will approve your account shortly.</p>
    <p>We will notify you by sending an email to <strong>{user.email}</strong> when they do.</p>
  </React.Fragment>

const renderConfirmationCopyWithoutAccountManager = (user, accountManager) =>
  <React.Fragment>
    <h2>Thanks for registering {user['first-name']}!</h2>
    <br />
    <p>We are aware of your registration, you will be assigned an {accountManager}, who will approve your account shortly.</p>
    <p>We will notify you by sending an email to <strong>{user.email}</strong> when they do.</p>
  </React.Fragment>

const renderBasicConfirmationCopy = (user) =>
  <React.Fragment>
    <h2>Thanks for registering {user['first-name']}</h2>
    <br />
    <p>Our commercial team are now reviewing your registration, and will be in touch with you shortly.</p>
  </React.Fragment>

class Confirmation extends React.Component {
  renderConfirmationCopy = () => {
    const user = this.props.location.state
    if (this.props.theme.features.accountManager || this.props.theme.features.territories.enabled) {
      if(user.am){
        return renderConfirmationCopyWithAccountManager(user, this.props.theme.localisation.accountManager.lower)
      } else {
        return renderConfirmationCopyWithoutAccountManager(user, this.props.theme.localisation.accountManager.lower)
      }
    } else {
      return renderBasicConfirmationCopy(user)
    }
  }

  render() {
    const { theme, confirmationCV } = this.props
    const user = this.props.location.state
    if (user) {
      return (
        <Meta
          title={`${this.props.theme.localisation.client} :: ${confirmationCV.pageTitle}`}
          meta={{
            description: 'Congratulations, your registration was successful',
          }}
        >
          <main>
            <div className="fade-on-load">
              <LoadPageBannerImage slug={'register'} fallbackBannerImage={confirmationCV.bannerImage}>
                {({ image }) => (
                  <Banner
                    title={confirmationCV.pageTitle}
                    classes={confirmationCV.bannerClasses}
                    image={image}
                  />
                )}
              </LoadPageBannerImage>
              <section className={confirmationCV.sectionClasses}>
                <div className="container container--slim wysiwyg">
                  {this.renderConfirmationCopy()}
                </div>
              </section>
            </div>
          </main>
        </Meta>
      )
    } else {
      return <NotFoundComponent />
    }
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('confirmationCV', allClientVariables)
)


export default enhance(Confirmation)