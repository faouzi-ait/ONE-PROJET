import React, { useState } from 'react'
import styled from 'styled-components'

import { cookiePolicyHandler } from 'javascript/components/cookie-policy/cookie-banner'

import Meta from 'react-document-meta'
import SlideToggle from 'javascript/components/slide-toggle'
import withUser from 'javascript/components/hoc/with-user'

import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import { UserType } from 'javascript/types/ModelTypes'

import 'stylesheets/core/components/cookie-policy'
import { useReduxThemeState } from 'javascript/utils/theme/ThemeProvider'
// Services
import { isInternal } from 'javascript/services/user-permissions'

interface Props {
  history: any
  theme: ThemeType
  user: UserType
}

const CookiePolicyPage:  React.FC<Props> = ({
  history,
  theme,
  user
}) => {
  const themeState = useReduxThemeState()
  const analyticsCookiesEnabled =
  theme.features.google.tagManagerId ||
  theme.features.google.analyticsId ||
  theme.features.hotjar.enabled
  const cookiesPolicy = cookiePolicyHandler.get()
  const [analyticsEnabled, setAnalyticsEnabled] = useState(cookiesPolicy.accepted ? cookiesPolicy.analytics : true)
  const functionalCookiesEnabled =
    (theme.features.intercomWidget && user && isInternal(user)) ||
    theme.features.loginPrompt ||
    theme.features.users.meetings.virtual

  const redirect = () => history.push('/')

  const cookiePolicyHasChanged = () => {
    themeState.setTheme(theme) // resetting theme to force layouts/application to re-render
  }

  const toggleAnalyticsEnabled = () => {
    cookiePolicyHandler.set({
      ...cookiesPolicy,
      analytics: !analyticsEnabled
    })
    setAnalyticsEnabled(!analyticsEnabled)
    cookiePolicyHasChanged()
  }

  const acceptCookies = () => {
    cookiePolicyHandler.set({
      accepted: true,
      analytics: analyticsEnabled
    })
    cookiePolicyHasChanged()
    redirect()
  }

  return (
    <Meta
      title={`${theme.localisation.client} :: Cookie Policy`}
      meta={{
        description: 'Manage privacy and cookie settings'
      }}
    >
      <main className="wysiwyg">

        <header className="cookie-policy__page-heading">
          <div className="container">
            <div>
              <h1 className={`cookie-policy__page-heading-title`}>Cookie Policy</h1>
            </div>
            <ButtonWrapper>
              <ActionButton type="button" className="button" onClick={acceptCookies}>Accept cookies</ActionButton>
              <ActionButton type="button" className="button button--filled" onClick={redirect}>Exit</ActionButton>
            </ButtonWrapper>
          </div>
        </header>

        <div className="container cookie-policy">
          <h2>What are cookies?</h2>
          <p>
            Cookies are small files of letters and numbers. These files are either stored in the memory of your
            computer or other device such as mobile phones or tablet devices (these cookies are generally known as
            session cookies) or are placed on the hard drive of your device (generally known as persistent cookies).
          </p>
          <p>
            Cookies are created when you visit a website or other service that uses cookies. Cookies are commonly
            used by websites to help the user’s browsing experience and provide more information about the user’s
            experience and interests. This information is generally used to make content, services and advertising
            more relevant and useful during future visits.
          </p>
          <p>
            For more details about cookies and details of how to delete and disable cookies you can visit
            <a
              href="http://www.aboutcookies.org.uk/"
              target="_blank"
              style={{padding: '0 5px'}}
            >
                http://www.aboutcookies.org.uk/
            </a>
            and also see our section on more information and turning cookies off below.
          </p>
          <h2>How do we use cookies?</h2>
          <p>Our website uses cookies to distinguish you from other users of our websites and to provide increased functionality. This helps us to provide you with a good experience when you browse our website and also allows us to improve our website and our services.</p>
          <p>Unless you have adjusted your browser settings to refuse cookies, our system will issue some cookies as soon you visit our website. These are defined as 'Functional Cookies' below. </p>
          <p>Other cookies, provided you have not switched them off in the setting below, will not be created until you have explicitly given permission by clicing 'Accept cookies'. </p>
          <p>Please note that not all the cookies on our sites are set by us. Please see the section below on cookies set by other parties on our behalf.</p>

          <h2>What cookies do we use?</h2>
          <Section>
            <div><strong>Strictly Necessary Cookies</strong></div>
            <p>
              These cookies are essential so you can browse around the website, log in and use our full set of features.
              Without these cookies, services you have asked for cannot be provided. These cookies are strictly
              necessary and cannot be disabled.
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>Name of Cookie</th>
                  <th>What does it do?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>AUTH_TOKEN</td>
                  <td>If you have logged in to our website, we use this cookie to remember your login username and password. This cookie will expire after 30 days.</td>
                </tr>
              </tbody>
            </table>
          </Section>
          <Section>
            <div><strong>Functional Cookies</strong></div>
            <p>
              These cookies with the support of some third parties provide you with a richer experience
            </p>
            <table className="table">
            <thead>
                <tr>
                  <th>Name of Cookie</th>
                  <th>What does it do?</th>
                </tr>
              </thead>
              <tbody>
                {!functionalCookiesEnabled &&
                  <tr>
                    <td colSpan={2}>No functional cookies to display</td>
                  </tr>
                }
                {theme.features.intercomWidget && user && isInternal(user) &&
                  <tr>
                    <td>intercom-session</td>
                    <td>If you are an internal user logged in to the admin, this cookies allows you to use the intercom messenger. It allows users to access their conversations and have data communicated on logged out pages for 1 week.</td>
                  </tr>
                }
                {theme.features.loginPrompt &&
                  <tr>
                    <td>LOGIN_PROMPT</td>
                    <td>When you are browsing the site as a guest user you will be prompted to log in when visiting a programme page. This cookie is set by us to make sure you only see this prompt once. </td>
                  </tr>
                }
                {theme.features.users.meetings.virtual &&
                  <tr>
                    <td>VIRTUAL_USER_ID</td>
                    <td>When using our virtual meetings feature, this cookie, allows a user to enter and reenter a meeting as an attendee. This cookie will expire after 240 minutes. </td>
                  </tr>
                }
              </tbody>
            </table>
          </Section>
          {analyticsCookiesEnabled && (
            <Section>
              <Analytics>
              <div ><strong>Analytics cookies</strong></div>
                <SlideToggle
                  classes={['small']}
                  identifier="analyticsCookie"
                  off={analyticsEnabled ? 'Enabled' : 'Disabled'}
                  onChange={toggleAnalyticsEnabled}
                  checked={analyticsEnabled}
                />
              </Analytics>
               <p>
                Analytical cookies enable us to gain insights and produce the most relevant content for our users. (These are not essential so can be disabled using the toggle above.)
              </p>
              <table className="table">
              <thead>
                  <tr>
                    <th>Name of Cookie</th>
                    <th>What does it do?</th>
                  </tr>
                </thead>
                <tbody>
                  {(theme.features.google.tagManagerId || theme.features.google.analyticsId) &&
                    <>
                      <tr>
                        <td>_ga</td>
                        <td>Used by 'Google Analytics' to distinguish users. This cookie will expire after 2 years. </td>
                      </tr>
                      <tr>
                        <td>_gid</td>
                        <td>Used by 'Google Analytics' to distinguish users. This cookie will expire after 24 hours. </td>
                      </tr>
                      <tr>
                        <td>_gat</td>
                        <td>Used by 'Google Analytics' to throttle request rate. This cookie will expire after 1 minute.</td>
                      </tr>
                    </>
                  }
                  {theme.features.hotjar.enabled &&
                    <>
                      <tr>
                        <td>_hjid</td>
                        <td>Used by 'Hotjar' to persist the Hotjar User ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID. This cookie will expire after 1 year</td>
                      </tr>
                      <tr>
                        <td>_hjIncludedInPageviewSample</td>
                        <td>Used by 'Hotjar' to let Hotjar know whether that visitor is included in the data sampling defined by your site's pageview limit. This cookie will expire after 30 minutes.</td>
                      </tr>
                    </>
                  }
                </tbody>
              </table>
            </Section>
          )}

        </div>
      </main>
    </Meta>
  )
}

export default withUser(CookiePolicyPage)

const Section = styled.div`
  margin: 40px 0;
  border-bottom: solid 2px dashed rgba(0,0,0.5)
`

const ButtonWrapper = styled.div`
  flex-grow: 2;
  text-align: right;
`

const ActionButton = styled.button`
  margin: 0 5px;
`

const Analytics = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`