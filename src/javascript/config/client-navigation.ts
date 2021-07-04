import { checkFEPermissions, isExternal } from 'javascript/services/user-permissions'

import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import { UserType } from 'javascript/types/ModelTypes'

type ClientNavigationType = (theme: ThemeType, user: UserType) => SlugPermissionsType

type SlugPermissionsType = (slug: string, title: string) => {
  navType: 'sitePage' | 'cmsResource'
  navTitle: string
  shouldRender: boolean
  hideOnMobile?: boolean
  anonymousRoute?: boolean
}

const clientNavigation: ClientNavigationType = (theme, user) => {
  const { localisation, features, variables } = theme
  return (slug, title) => {
    const routeSlug = slug[0] === '/' ? slug : `/${slug}`
    switch (routeSlug) {
      // myAccount
      case `/${variables.SystemPages.account.path}`: {
        return {
          navType: 'sitePage',
          navTitle: variables.SystemPages.account.upper,
          shouldRender: features.users && !!user,
        }
      }
      // profile
      case `/${variables.SystemPages.profile.path}`: {
        return {
          navType: 'sitePage',
          navTitle: variables.SystemPages.profile.upper,
          shouldRender: features.users && !!user,
        }
      }
      // lists
      case `/${variables.SystemPages.list.path}`: {
        return {
          navType: 'sitePage',
          navTitle: variables.SystemPages.list.upper,
          shouldRender: features.users && features.users.lists && !!user,
        }
      }
      // meetings
      case `/${variables.SystemPages.meeting.path}`: {
        return {
          navType: 'sitePage',
          navTitle: variables.SystemPages.meeting.upper,
          shouldRender: features.users.meetings.enabled && checkFEPermissions(user, { user: 'internal' }),
          hideOnMobile: true
        }
      }
      // events
      case `/${variables.SystemPages.events.path}`: {
        return {
          navType: 'sitePage',
          navTitle: variables.SystemPages.events.upper,
          shouldRender: features.users.meetings.events && checkFEPermissions(user, { user: 'internal', permissions: ['manage_events'] }),
          hideOnMobile: true
        }
      }
      // approvals
      case `/${variables.SystemPages.approvals.path}`: {
        return {
          navType: 'sitePage',
          navTitle: `${variables.SystemPages.approvals.upper}`,
          shouldRender: features.users.registrations.enabled && checkFEPermissions(user, { user: 'internal', permissions: ['manage_approvals'] }),
        }
      }
      // reporting
      case `/${variables.SystemPages.reporting.path}`: {
        return {
          navType: 'sitePage',
          navTitle: variables.SystemPages.reporting.upper,
          shouldRender: features.users && features.reporting && checkFEPermissions(user, { user: 'internal', permissions: ['view_reporting'] }),
          hideOnMobile: true
        }
      }
      // dashboard
      case `/${variables.SystemPages.dashboard.path}`: {
        return {
          navType: 'sitePage',
          navTitle: variables.SystemPages.dashboard.upper,
          shouldRender: features.dashboard.frontend && features.applications.frontend && checkFEPermissions(user, { user: 'external_buyer' }),
        }
      }
      // catalogue
      case `/${variables.SystemPages.catalogue.path}`: {
        const requiredFeatures = features.programmes && features.applications.frontend || (!features.applications.frontend && features.users && features.users.lists)
        return {
          navType: 'sitePage',
          navTitle: variables.SystemPages.catalogue.upper,
          shouldRender: requiredFeatures && checkFEPermissions(user, { user: !features.applications.frontend ? 'logged-in' : '' }),
        }
      }
      // anonymousAccess
      case `/${variables.SystemPages.anonymousAccess.path}`: {
        return {
          navType: 'sitePage',
          navTitle: variables.SystemPages.anonymousAccess.upper,
          shouldRender: features.users.anonymousAccess.enabled && !user,
          anonymousRoute: true
        }
      }
      // myAssets
      case `/${variables.SystemPages.myAssets.path}`: {
        return {
          navType: 'sitePage',
          navTitle: variables.SystemPages.myAssets.upper,
          shouldRender: features.myAssets.enabled && !!user,
          hideOnMobile: true
        }
      }
      // passport
      case `/${localisation.passport.path}`: {
        return {
          navType: 'sitePage',
          navTitle: localisation.passport.upper,
          shouldRender: features.passport.frontend && !!user,
        }
      }
      // producerHub
      case `/${variables.SystemPages.producerHub.path}`: {
        return {
          navType: 'sitePage',
          navTitle: variables.SystemPages.producerHub.upper,
          shouldRender: features.producerHub && (user?.['has-production-companies'] || checkFEPermissions(user, { user: 'internal', permissions: ['view_producer_hub'] })),
          hideOnMobile: true
        }
      }
      // myProgrammes
      case `/${variables.SystemPages.myProgrammes.path}`: {
        return {
          navType: 'sitePage',
          navTitle: variables.SystemPages.myProgrammes.upper,
          shouldRender: features.users.limitedAccess && !!user && isExternal(user) && user['limited-access'],
        }
      }
      default: {
        return {
          navType: 'cmsResource', // i.e. nav items made by user within the cms
          navTitle: title,
          shouldRender: true
        }
      }
    }
  }
}

export default clientNavigation
