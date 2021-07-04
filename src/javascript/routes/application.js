import React from 'react'
import pluralize from 'pluralize'

import { hasEnabledOAuthProvider } from 'javascript/components/oauth-login-buttons'

// Default Views
const AnonymousAccessIndex = React.lazy(() => import( /* webpackChunkName: 'application.anon-access-index' */ 'javascript/views/anonymous-access/index'))
const ApprovalsIndex = React.lazy(() => import( /* webpackChunkName: 'application.approvals-index' */ 'javascript/views/approvals/index'))
const CatalogueIndex = React.lazy(() => import( /* webpackChunkName: 'application.catalogue-index' */ 'javascript/views/catalogue/index'))
const CatalogueShow = React.lazy(() => import( /* webpackChunkName: 'application.catalogue-show' */ 'javascript/views/catalogue/show/index'))
const CookiePolicyPage = React.lazy(() => import( /* webpackChunkName: 'application.cookie-policy' */ 'javascript/components/cookie-policy/cookie-policy-page'))
const CustomCatalogueIndex = React.lazy(() => import( /* webpackChunkName: 'application.custom-catalogue-index' */ 'javascript/views/custom-catalogue/index'))
const Dashboard = React.lazy(() => import( /* webpackChunkName: 'application.dashboard' */ 'javascript/views/dashboard/index'))
const DashboardProgrammesView = React.lazy(() => import( /* webpackChunkName: 'application.dashboard-programmes-view' */ 'javascript/views/dashboard/programmes-view'))
const EditEvent = React.lazy(() => import( /* webpackChunkName: 'application.events-edit' */ 'javascript/views/events/edit'))
const EditMeeting = React.lazy(() => import( /* webpackChunkName: 'application.meeting-edit' */ 'javascript/views/meetings/edit'))
const EventReports = React.lazy(() => import( /* webpackChunkName: 'application.events-reports' */ 'javascript/views/events/reports'))
const EventsIndex = React.lazy(() => import( /* webpackChunkName: 'application.events-index' */ 'javascript/views/events/index'))
const EventsReportsReport = React.lazy(() => import( /* webpackChunkName: 'application.events-reports-report' */ 'javascript/views/reporting/events/reports/report'))
const ForgottenPassword = React.lazy(() => import( /* webpackChunkName: 'application.forgotten-password' */ 'javascript/views/sessions/forgotten-password'))
const ListsFolders = React.lazy(() => import( /* webpackChunkName: 'application.lists-folders' */ 'javascript/views/lists/folders'))
const ListsIndex = React.lazy(() => import( /* webpackChunkName: 'application.lists-index' */ 'javascript/views/lists/index'))
const ListsShow = React.lazy(() => import( /* webpackChunkName: 'application.lists-show' */ 'javascript/views/lists/show'))
const MeetingsIndex = React.lazy(() => import( /* webpackChunkName: 'application.meetings-index' */ 'javascript/views/meetings/index'))
const MyAccount = React.lazy(() => import( /* webpackChunkName: 'application.my-account' */ 'javascript/views/account'))
const MyAssetsView = React.lazy(() => import( /* webpackChunkName: 'application.my-assets' */ 'javascript/views/my-assets'))
const NewEvent = React.lazy(() => import( /* webpackChunkName: 'application.events-new' */ 'javascript/views/events/new'))
const NewMeeting = React.lazy(() => import( /* webpackChunkName: 'application.meeting-new' */ 'javascript/views/meetings/new'))
const NewsArticle = React.lazy(() => import( /* webpackChunkName: 'application.news-article' */ 'javascript/views/news/article'))
const NewsIndex = React.lazy(() => import( /* webpackChunkName: 'application.news-index' */ 'javascript/views/news/index'))
const OAuthRedirect = React.lazy(() => import( /* webpackChunkName: 'application.oauth-redirect' */ 'javascript/views/oauth'))
const PagesIndex = React.lazy(() => import( /* webpackChunkName: 'application.pages-index' */ 'javascript/views/pages'))
const PagesShow = React.lazy(() => import( /* webpackChunkName: 'application.pages-show' */ 'javascript/views/pages/show'))
const PassportContent = React.lazy(() => import( /* webpackChunkName: 'application.passport-content' */ 'javascript/views/passport/content'))
const PassportDashboard = React.lazy(() => import( /* webpackChunkName: 'application.passport-dashboard' */ 'javascript/views/passport/index'))
const PassportEvents = React.lazy(() => import( /* webpackChunkName: 'application.passport-events' */ 'javascript/views/passport/events'))
const PassportFlightSchedule = React.lazy(() => import( /* webpackChunkName: 'application.passport-flight-schedule' */ 'javascript/views/passport/flight-schedule'))
const PassportItinerary = React.lazy(() => import( /* webpackChunkName: 'application.passport-itinerary' */ 'javascript/views/passport/itinerary'))
const PrivateVideoView = React.lazy(() => import( /* webpackChunkName: 'application.private-video-view' */ 'javascript/views/private-video-access'))
const ProducerHub = React.lazy(() => import( /* webpackChunkName: 'application.producer-hub' */ 'javascript/views/producer-hub'))
const ProducerHubSeries = React.lazy(() => import( /* webpackChunkName: 'application.producer-hub-series' */ 'javascript/views/producer-hub/series'))
const ProfileIndex = React.lazy(() => import( /* webpackChunkName: 'application.profile-index' */ 'javascript/views/profile/index'))
const ReportingDashboard = React.lazy(() => import( /* webpackChunkName: 'application.reporting-dashboard' */ 'javascript/views/reporting/dashboard/index'))
const ReportingList = React.lazy(() => import( /* webpackChunkName: 'application.reporting-list' */ 'javascript/views/reporting/user/list'))
const ReportingProducer = React.lazy(() => import( /* webpackChunkName: 'application.reporting-producers' */ 'javascript/views/reporting/producer/index'))
const ReportingProgrammes = React.lazy(() => import( /* webpackChunkName: 'application.reporting-programmes' */ 'javascript/views/reporting/programme/index'))
const ReportingUsers = React.lazy(() => import( /* webpackChunkName: 'application.reporting-users' */ 'javascript/views/reporting/user/index'))
const ResetPassword = React.lazy(() => import( /* webpackChunkName: 'application.reset-password' */ 'javascript/views/sessions/reset-password'))
const Session = React.lazy(() => import( /* webpackChunkName: 'application.session-new' */ 'javascript/views/sessions/new'))
const SessionConfirmation = React.lazy(() => import( /* webpackChunkName: 'application.session-confirmation' */ 'javascript/views/sessions/confirmation'))
const SessionRegister = React.lazy(() => import( /* webpackChunkName: 'application.session-register' */ 'javascript/views/sessions/register'))
const Sitemap = React.lazy(() => import( /* webpackChunkName: 'application.sitemap' */ 'javascript/views/sitemap'))
const TeamMembersIndex = React.lazy(() => import( /* webpackChunkName: 'application.team-members-index' */ 'javascript/views/team-members/index'))
const VideoDownload = React.lazy(() => import( /* webpackChunkName: 'application.video-download' */ 'javascript/views/videos/index'))
const VirtualScreeningClient = React.lazy(() => import( /* webpackChunkName: 'application.virtual-client' */ 'javascript/views/virtual-screening/client'))
const VirtualScreeningHost = React.lazy(() => import( /* webpackChunkName: 'application.virtual-host' */ 'javascript/views/virtual-screening/host'))
const WatermarkedVideoDownload = React.lazy(() => import( /* webpackChunkName: 'application.watermarked-video-download' */ 'javascript/views/watermarked-videos/index'))

// Routes

const appRouteConfig = {
  createRoutes: (theme, user) => {
    const routes = []

    if (theme.features.users) {
      routes.push({
        path: `${theme.variables.SystemPages.login.path}`,
        component: Session
      }, {
          path: `${theme.variables.SystemPages.resetPassword.path}/:token`,
          component: ResetPassword
        }, {
          path: theme.variables.SystemPages.forgottenPassword.path,
          component: ForgottenPassword
        }, {
          path: theme.variables.SystemPages.account.path,
          component: MyAccount,
          user: true
        }, {
          path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.approvals.path}`,
          component: ApprovalsIndex,
          user: 'internal',
          permissions: ['manage_approvals']
        }, {
          path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.profile.path}`,
          component: ProfileIndex,
          user: true
        })

      if (theme.features.users.lists) {
        routes.push({
          path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}`,
          component: ListsIndex,
          user: true
        }, {
            path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}/:folder`,
            component: ListsFolders,
            user: true
          }, {
            path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}/:folder/:list`,
            component: ListsShow,
            user: true
          })
      }
      if (theme.features.users.meetings.enabled) {
        routes.push({
          path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}`,
          component: MeetingsIndex,
          user: 'internal'
        }, {
            path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}/new`,
            component: NewMeeting,
            user: 'internal'
          }, {
            path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}/:id/edit`,
            component: EditMeeting,
            user: 'internal'
          })
        if (theme.features.users.meetings.events) {
          routes.push({
            path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.events.path}`,
            component: EventsIndex,
            user: 'internal',
            permissions: ['manage_events']
          }, {
              path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.events.path}/new`,
              component: NewEvent,
              user: 'internal',
              permissions: ['manage_events']
            }, {
              path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.events.path}/:id/edit`,
              component: EditEvent,
              user: 'internal',
              permissions: ['manage_events']
            })
          if (theme.features.reporting) {
            routes.push({
              path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.events.path}/:id/reports`,
              component: EventReports,
              user: true
            }, {
              path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.events.path}/:id/reports/:type`,
              component: EventsReportsReport,
              restricted: true
            })
          }
        }
      }

      if (theme.features.users.meetings.virtual && theme.features.users.meetings) {
        routes.push({
          path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}/virtual-host/:id`,
          component: VirtualScreeningHost,
          user: 'internal'
        }, {
          path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}/virtual/:id`,
          component: VirtualScreeningClient,
        })
      }

      if (theme.features.users.registrations.enabled) {
        routes.push({
          path: 'register',
          component: SessionRegister
        }, {
            path: 'registration-successful',
            component: SessionConfirmation
          })
      }
    }

    if (theme.features.programmes && theme.features.applications.frontend || (!theme.features.applications.frontend && theme.features.users && theme.features.users.lists)) {
      routes.push({
        path: theme.variables.SystemPages.catalogue.path,
        component: CatalogueIndex,
        user: !theme.features.applications.frontend ? 'logged-in' : ''
      },{
        path: `${theme.variables.SystemPages.catalogue.path}/:programme`,
        component: CatalogueShow,
        user: !theme.features.applications.frontend ? 'logged-in' : ''
      },{
        path: `${theme.variables.SystemPages.catalogue.path}/:programme/:video`,
        component: CatalogueShow,
        user: !theme.features.applications.frontend ? 'logged-in' : ''
      })
    }

    if (theme.features.users.limitedAccess &&
          user?.['user-type'] === 'external' &&
          user?.['limited-access']) {
      routes.push({
        path: theme.variables.SystemPages.myProgrammes.path,
        component: CatalogueIndex
      })
    }

    if (theme.features.reporting) {
      routes.push({
        path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.reporting.path}`,
        component: ReportingDashboard,
        user: 'internal',
        permissions: ['view_reporting']
      }, {
        path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.reporting.path}/users`,
        component: ReportingUsers,
        user: 'internal',
        permissions: ['view_reporting']
      }, {
        path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.reporting.path}/users/search`,
        component: ReportingUsers,
        user: 'internal',
        permissions: ['view_reporting']
      }, {
        path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.reporting.path}/${theme.localisation.programme.path}`,
        component: ReportingProgrammes,
        user: 'internal',
        permissions: ['view_reporting']
      },
      {
        path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.reporting.path}/producers`,
        component: ReportingProducer,
        user: 'internal',
        permissions: ['view_reporting']
      },

      {
        path: `${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.reporting.path}/users/:userId/lists/:list`,
        component: ReportingList,
        user: 'internal',
        permissions: ['view_reporting']
      })
    }

    if (theme.features.sitemap) {
      routes.push({
        path: 'sitemap',
        component: Sitemap
      })
    }

    if (theme.features.teamMembers) {
      routes.push({
        path: theme.variables.SystemPages.team.path,
        component: TeamMembersIndex
      })
    }

    if (theme.features.videos.privateVideoAccess) {
      routes.push({
        path: `${theme.localisation.video.path}/:slug`,
        component: PrivateVideoView
      })
      // Needs to be included still as previous video links were sent out with this path
      routes.push({
        path: `${theme.localisation.video.lower}/:slug`,
        component: PrivateVideoView
      })
    }

    if (theme.features.videos.oneTimeVideoDownload) {
      routes.push(
        {
          path: `${theme.localisation.video.path}/download/:video`,
          component: VideoDownload
        }
      )
    }

    if (theme.features.videos.watermarked) {
      routes.push(
        {
          path: `watermarked-videos/:video`,
          component: WatermarkedVideoDownload
        }
      )
    }

    if (theme.features.dashboard.frontend) {
      routes.push({
        path: `${theme.variables.SystemPages.dashboard.path}`,
        component: Dashboard,
        user: 'external_buyer'
      }, {
        path: `${theme.variables.SystemPages.dashboard.path}/${pluralize(theme.localisation.programme.path)}`,
        component: DashboardProgrammesView,
        user: 'external_buyer'
      })
    }

    if (theme.features.producerHub) {
      routes.push({
        path: `${theme.variables.SystemPages.producerHub.path}`,
        component: ProducerHub,
      }, {
        path: `${theme.variables.SystemPages.producerHub.path}/:producerId/${theme.localisation.series.lower}/:seriesRef`,
        component: ProducerHubSeries,
      })
    }

    if (theme.features.passport.frontend) {
      routes.push({
        path: `${theme.localisation.passport.path}`,
        component: PassportDashboard,
        user: true
      }, {
        path: `${theme.localisation.passport.path}/:marketId/:attendeeId/itinerary`,
        component: PassportItinerary,
        user: true
      }, {
        path: `${theme.localisation.passport.path}/:marketId/events`,
        component: PassportEvents,
        user: true
      }, {
        path: `${theme.localisation.passport.path}/:marketId/:contentId/content`,
        component: PassportContent,
        user: true
      }, {
        path: ':marketId/flight-schedule',
        component: PassportFlightSchedule,
      })
    }

    if (theme.features.users.anonymousAccess.enabled) {
      routes.push({
        path: `${theme.variables.SystemPages.anonymousAccess.path}/:id`,
        component: AnonymousAccessIndex,
      })
    }

    if (theme.features.myAssets.enabled) {
      routes.push({
        path: `${theme.variables.SystemPages.myAssets.path}`,
        component: MyAssetsView,
        user: true
      })
    }

    if (theme.features.cookiePolicy) {
      routes.push({
        path: 'cookie-policy',
        component: CookiePolicyPage
      })
    }

    if (theme.features.oauth.enabled && hasEnabledOAuthProvider(theme.features.oauth.providers)) {
      routes.push({
        path: `oauth/:providerName/redirect`,
        component: OAuthRedirect
      })
    }


    routes.push({
      path: theme.variables.SystemPages.news.path,
      component: NewsIndex,
    }, {
      path: `${theme.variables.SystemPages.news.path}/:slug`,
      component: NewsArticle,
    })

    if (theme.features.customCatalogues.enabled) {
      routes.push({
        path: `custom-${theme.localisation.catalogue.path}/:catalogueSlug`,
        component: CustomCatalogueIndex,
      })
    }

    // Any new routes above here //

    if ((typeof theme.features.pages === 'boolean' && theme.features.pages) || theme.features.pages.enabled) {
      routes.push({
        path: ':parent',
        component: PagesIndex
      }, {
          path: ':parent/:slug',
          component: PagesShow
        })
    }
    return routes
  }
}

export default appRouteConfig
