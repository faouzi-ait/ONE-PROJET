// React
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { Provider } from 'react-redux'
import { hotjar } from 'react-hotjar'

import 'picturefill'
import 'picturefill/dist/plugins/mutation/pf.mutation.min'

import store from 'javascript/utils/store'

// Components
import { cookiePolicyHandler } from 'javascript/components/cookie-policy/cookie-banner'
import { ImpersonationStateComponent } from 'javascript/utils/hooks/use-impersonation-state'
import { IsFrontEndAvailable } from 'javascript/utils/hooks/use-fe-available-state'
import EventReport from 'javascript/views/reporting/events/reports/report'
import LayoutView from 'javascript/views/layouts/application'
import GA from 'javascript/components/google-analytics'
import GlobalStyle from 'javascript/utils/theme/GlobalStyle'
import PrintCalendar from 'javascript/views/meetings/print'
import TagManager from 'react-gtm-module'
import ThemeConsumer from 'javascript/utils/theme/ThemeConsumer'
import ThemeProvider from 'javascript/utils/theme/ThemeProvider'
import StylePrefixProvider from 'javascript/utils/style-prefix/style-prefix-provider'
import SuspenseLoader from 'javascript/components/suspense-loader'

const AdminLayoutView = React.lazy(() => import( /* webpackChunkName: 'admin.layout' */ 'javascript/views/layouts/admin'))
const ApplicationLayoutView = React.lazy(() => import( /* webpackChunkName: 'application.layout' */ 'javascript/views/layouts/application'))

function importAll(context) {
  context.keys().forEach(context)
}
// Fonts
importAll(require.context('fonts', false, /\.(ttc|ttf|otf|woff|woff2)$/))

// Images
importAll(require.context('images', true, /\.(jpg|png|svg|pdf)$/))

export const validateAnalyticsCookiePolicy = (trackingId, cookiePolicyActive) => {
  const analyticsDisabled = !cookiePolicyHandler.analyticsAllowed()
  if (trackingId && cookiePolicyActive && analyticsDisabled) {
    return false
  }
  return trackingId
}

let hotjarNeedsInitializing = true

// Define Main Routes, Render App
ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider>
      <StylePrefixProvider>
        <GlobalStyle />
        <ThemeConsumer>
          {theme => {
            let googleTagManagerId = validateAnalyticsCookiePolicy(theme.features.google.tagManagerId, theme.features.cookiePolicy)
            const { enabled, hjid, hjsv } = theme.features.hotjar
            let hotjarID = validateAnalyticsCookiePolicy(hjid, theme.features.cookiePolicy)
            return (
              <BrowserRouter>
                {!window.dataLayer && process.env.TARGET_ENV === 'production' && googleTagManagerId &&
                  TagManager.initialize({ gtmId: googleTagManagerId })
                }
                {hotjarID && enabled && hjsv && hotjarNeedsInitializing &&
                  hotjar.initialize(hjid, hjsv),
                  hotjarNeedsInitializing = false
                }
                <Suspense fallback={<SuspenseLoader />}>
                  <IsFrontEndAvailable renderFrontEnd={() => (
                      <ImpersonationStateComponent>
                        {({ status }) => {
                          if (status === 'pending') {
                            return null
                          }
                          return (
                            <Switch>
                              {theme.variables.SystemPages.login.path !== 'login' &&
                                <Redirect from="/login" to={`${theme.variables.SystemPages.login.path}${location.search}`} />
                              }
                              <Route
                                path={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}/print`}
                                component={PrintCalendar}
                              />
                              <Route
                                path={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.reporting.path}/${theme.variables.SystemPages.events.path}/report`}
                                component={EventReport}
                              />
                              <Route path="/admin" component={AdminLayoutView} />
                              <Route path="/" component={ApplicationLayoutView} />
                            </Switch>
                          )
                        }}
                      </ImpersonationStateComponent>
                    )}
                  />
                </Suspense>
              </BrowserRouter>
            )
          }}
        </ThemeConsumer>
      </StylePrefixProvider>
    </ThemeProvider>
  </Provider>,
  document.getElementById('thisisone'),
)
