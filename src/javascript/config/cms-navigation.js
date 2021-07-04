import { CmsNavigation } from 'javascript/config/features'
import pluralize from 'pluralize'
import makeNavigation from './make-navigation'
import imageDimensions from 'javascript/config/image-dimensions'

import { isAdmin } from 'javascript/services/user-permissions'

const cmsNavigation = {
  init: ({ theme, user }) => {
    const navOptions = {
      admin: id => {
        if (theme.features.users) {
          return {
            id,
            name: 'Admin',
            icon: {
              id: 'i-admin-cog',
              width: 25,
              height: 25,
              viewBox: '0 0 34 34'
            },
          }
        }
      },
      companies: id => {
        if (theme.features.users) {
          return {
            id,
            name: 'Companies',
            url: '/admin/companies',
            permissions: ['manage_companies'],
          }
        }
      },
      users: id => {
        if (theme.features.users) {
          return {
            id,
            name: 'Users',
            url: '/admin/users',
            permissions: ['manage_internal_users', 'manage_external_users'],
          }
        }
      },
      roles: id => {
        if (theme.features.users) {
          return {
            id,
            name: 'Roles',
            url: '/admin/roles',
            permissions: ['manage_roles'],
          }
        }
      },
      approvals: id => {
        if (theme.features.users && theme.features.users.registrations.enabled) {
          return {
            id,
            name: 'Approvals',
            url: '/admin/approvals',
            permissions: ['manage_approvals'],
          }
        }
      },
      permissions: id => {
        if (theme.features.users) {
          return {
            id,
            name: 'Permissions',
            url: '/admin/permissions',
            permissions: ['copy_permissions'],
          }
        }
      },
      talent: id => {
        if (theme.features.talents) {
          return {
            id,
            name: pluralize(theme.localisation.talent.upper),
            url: `/admin/${theme.localisation.talent.path}`,
            permissions: ['manage_talents'],
          }
        }
      },
      territories: id => {
        if (
          theme.features.territories.enabled ||
          theme.features.territories.cms
        ) {
          return {
            id,
            name: 'Territories',
            url: '/admin/territories',
            permissions: ['manage_territories'],
          }
        }
      },
      pages: id => {
        if ((typeof theme.features.pages === 'boolean' && theme.features.pages) || theme.features.pages.enabled) {
          return {
            id,
            name: 'Pages',
            url: '/admin/pages',
            permissions: ['manage_pages'],
          }
        }
      },
      teamMembers: id => {
        if (theme.features.teamMembers) {
          return {
            id,
            name: pluralize(theme.localisation.team.upper),
            url: `/admin/${theme.localisation.team.path}`,
            permissions: ['manage_teams'],
          }
        }
      },
      groups: (id) => {
        if (theme.features.groups.enabled) {
          return {
            id,
            name: 'Groups',
            url: '/admin/groups',
            permissions: ['manage_groups']
          }
        }
      },
      anonymousAccess: (id) => {
        if (theme.features.users.anonymousAccess.enabled) {
          return {
            id,
            name: `${theme.localisation.anonymousAccess.upper}`,
            url: `/admin/${theme.localisation.anonymousAccess.path}`,
            permissions: ['manage_anonymous_access']
          }
        }
      },
      programmeManagement: (id) => {
        if (theme.features.programmes) {
          return {
            id,
            name: `${theme.localisation.programme.upper} Management`,
            icon: {
              id: 'i-admin-tv',
              width: 26,
              height: 22,
              viewBox: '0 0 40 35'
            },
          }
        }
      },
      programmes: id => {
        if (theme.features.programmes) {
          return {
            id,
            name: pluralize(theme.localisation.programme.upper),
            url: `/admin/${theme.localisation.programme.path}`,
            permissions: ['manage_programmes']
          }
        }
      },
      programmeTypes: id => {
        if (theme.features.programmeTypes.enabled) {
          return {
            id,
            name: pluralize(theme.localisation.programmeType.upper),
            url: `/admin/${theme.localisation.programmeType.path}`,
            permissions: ['manage_programme_data_options']
          }
        }
      },
      videos: id => {
        if (theme.features.programmes) {
          return {
            id,
            name: pluralize(theme.localisation.video.upper),
            url: `/admin/${theme.localisation.video.path}`,
            permissions: ['manage_videos'],
          }
        }
      },
      series: id => {
        if (theme.features.programmes) {
          return {
            id,
            name: pluralize(theme.localisation.series.upper),
            url: `/admin/${theme.localisation.series.path}`,
            permissions: ['manage_programmes'],
          }
        }
      },
      genres: id => {
        if (theme.features.programmes) {
          return {
            id,
            name: pluralize(theme.localisation.genre.upper),
            url: `/admin/${theme.localisation.genre.path}`,
            permissions: ['manage_programme_data_options'],
          }
        }
      },
      qualities: id => {
        if (theme.features.programmes) {
          return {
            id,
            name: 'Qualities',
            url: '/admin/qualities',
            permissions: ['manage_programme_data_options'],
          }
        }
      },
      languages: id => {
        if (theme.features.programmes) {
          return {
            id,
            name: 'Languages',
            url: '/admin/languages',
            permissions: ['manage_programme_data_options'],
          }
        }
      },
      productionCompanies: id => {
        if (theme.features.programmes) {
          return {
            id,
            name: pluralize(theme.localisation.productionCompany.upper),
            url: `/admin/${theme.localisation.productionCompany.path}`,
            permissions: ['manage_programme_data_options'],
          }
        }
      },
      broadcasters: id => {
        if (theme.features.programmes && (theme.features.programmeOverview.broadcasters.programme || theme.features.programmeOverview.broadcasters.series)) {
          return {
            id,
            name: pluralize(theme.localisation.broadcaster.upper),
            url: `/admin/${theme.localisation.broadcaster.path}`,
            permissions: ['manage_programme_data_options'],
          }
        }
      },
      customAttributes: id => {
        if (theme.features.programmes) {
          return {
            id,
            name: 'Custom Attributes',
            url: '/admin/custom-attributes',
            permissions: ['manage_programme_data_options'],
          }
        }
      },
      weightedSearchTerms: id => {
        if (theme.features.programmeSearch.weightedWords.enabled) {
          return {
            id,
            name: 'Weighted Search Terms',
            url: '/admin/weighted-search-terms',
            permissions: ['manage_programme_data_options'],
          }
        }
      },
      oneTimeVideoDownload: id => {
        if (theme.features.videos.oneTimeVideoDownload) {
          return {
            id,
            name: `${theme.localisation.video.upper} Download Links`,
            url: '/admin/video-download-links',
            permissions: ['manage_programmes', 'manage_videos'],
          }
        }
      },
      import: id => {
        if (theme.features.dataImport.manual) {
          return {
            id,
            name: 'Import',
            url: '/admin/import',
            permissions: ['manage_data_import'],
          }
        }
      },
      assetManagement: id => {
        if (theme.features.assets) {
          return {
            id,
            name: `${theme.localisation.asset.upper} Management`,
            icon: {
              id: 'i-admin-asset',
              width: 26,
              height: 25,
              viewBox: '0 0 36 30'
            },
          }
        }
      },
      assetCategories: id => {
        if (theme.features.assets) {
          return {
            id,
            name: 'Categories',
            url: `/admin/${theme.localisation.asset.path}/categories`,
            permissions: ['manage_assets'],
          }
        }
      },
      assets: id => {
        if (theme.features.assets) {
          return {
            id,
            name: pluralize(theme.localisation.asset.upper),
            url: `/admin/${theme.localisation.asset.path}/management`,
            permissions: ['manage_assets'],
          }
        }
      },
      assetPermissions: id => {
        if (theme.features.assets) {
          return {
            id,
            name: 'Permissions',
            url: `/admin/${theme.localisation.asset.path}/permissions`,
            permissions: ['manage_asset_permissions'],
          }
        }
      },
      assetAccess: id => {
        if (theme.features.assets) {
          return {
            id,
            name: `${pluralize(theme.localisation.asset.upper)} Access`,
            url: `/admin/${theme.localisation.asset.path}/access`,
            permissions: ['manage_assets'],
          }
        }
      },
      appManagement: id => {
        if (theme.features.app.enabled) {
          return {
            id,
            name: `App Management`,
            icon: {
              id: 'i-admin-app',
              width: 36,
              height: 30,
              viewBox: '0 0 90 112.5'
            },
          }
        }
      },
      highlights: id => {
        if (theme.features.app.enabled && theme.features.programmes) {
          return {
            id,
            name: 'Highlights',
            url: `/admin/highlights`,
            permissions: ['manage_highlights']
          }
        }
      },
      highlightPages: id => {
        if (theme.features.app.enabled && theme.features.app.programmeHighlightPages) {
          return {
            id,
            name: 'Highlight Pages',
            url: `/admin/highlight-pages`,
            permissions: ['manage_highlights']
          }
        }
      },
      marketing: id => {
        if (theme.features.marketing) {
          return {
            id,
            name: `Marketing`,
            icon: {
              id: 'i-admin-marketing',
              width: 36,
              height: 30,
            },
          }
        }
      },
      marketingCategories: id => {
        if (theme.features.marketing) {
          return {
            id,
            name: 'Categories',
            url: `/admin/marketing/categories`,
            permissions: ['manage_marketing'],
          }
        }
      },
      marketingActivities: id => {
        if (theme.features.marketing) {
          return {
            id,
            name: 'Activities',
            url: `/admin/marketing/activities`,
            permissions: ['manage_marketing'],
          }
        }
      },
      config: id => {
        return {
          id,
          name: `Config`,
          icon: {
            id: 'i-admin-config',
            width: 25,
            height: 25,
            viewBox: '0 0 36 36'
          },
          subNav: [
            {
              name: 'General',
              url: '/admin/config/general',
              permissions: ['manage_configurations']
            },
            {
              name: 'Social',
              url: '/admin/config/social',
              permissions: ['manage_configurations']
            },
            {
              name: 'Video Providers',
              url: '/admin/config/providers',
              permissions: ['manage_configurations']
            },
            {
              name: 'Localisation',
              url: '/admin/config/localisation',
              permissions: ['manage_configurations']
            },
            {
              name: `${pluralize(theme.localisation.programme.upper)}`,
              url: '/admin/config/programmes',
              permissions: ['manage_configurations']
            },
          ],
        }
      },
      styles: id => {
        if (theme.features.lite) {
          const adminStyles = {
            id,
            name: theme.localisation.styles.upper,
            icon: {
              id: 'i-admin-styles',
              width: 25,
              height: 25,
              viewBox: '0 0 36 36'
            },
            wide: true,
            fadeOut: true,
            subNav: [
              {
                name: 'Colours',
                url: `/admin/styles/colours`,
                permissions: ['manage_configurations']
              },
              {
                name: 'Typography',
                url: `/admin/styles/typography`,
                permissions: ['manage_configurations']
              },
              {
                name: 'Header',
                url: `/admin/styles/header`,
                permissions: ['manage_configurations']
              },
              {
                name: 'Footer',
                url: `/admin/styles/footer`,
                permissions: ['manage_configurations']
              },
              {
                name: 'Buttons',
                url: `/admin/styles/buttons`,
                permissions: ['manage_configurations']
              },
              {
                name: 'Tags',
                url: `/admin/styles/tags`,
                permissions: ['manage_configurations']
              },
              {
                name: 'Tabs',
                url: `/admin/styles/tabs`,
                permissions: ['manage_configurations']
              },
              {
                name: 'Forms',
                url: `/admin/styles/forms`,
                permissions: ['manage_configurations']
              },
              {
                name: 'Cards',
                url: `/admin/styles/cards`,
                permissions: ['manage_configurations']
              },
              {
                name: 'Banners',
                url: `/admin/styles/banners`,
                permissions: ['manage_configurations']
              },
              {
                name: 'Navigation',
                url: `/admin/styles/navigation`,
                permissions: ['manage_configurations']
              },
              {
                name: 'Modals',
                url: '/admin/styles/modals',
                permissions: ['manage_configurations']
              }
            ],
          }
          if (isAdmin(user)) {
            adminStyles.subNav.push({
              name: 'Factory Reset',
              url: '/admin/styles/factory-reset',
              isButton: true,
              permissions: ['manage_configurations']
            })
          }
          return adminStyles
        }
      },
      passport: id => {
        if (theme.features.passport.admin) {
          return {
            id,
            name: theme.localisation.passport.upper,
            icon: {
              id: 'i-admin-passport',
              width: 25,
              height: 25,
              viewBox: '0 0 36 36'
            },
          }
        }
      },
      passportMarkets: id => {
        if (theme.features.passport.admin) {
          return {
            id,
            name: theme.localisation.passport.market.upper,
            url: `/admin/${theme.localisation.passport.market.path}`,
            permissions: ['manage_passport_admin'],
          }
        }
      },
      passportInvoiceTypes: id => {
        if (theme.features.passport.admin) {
          return {
            id,
            name: theme.localisation.passport.tripInvoiceType.upper,
            url: `/admin/${theme.localisation.passport.tripInvoiceType.path}`,
            permissions: ['manage_passport_admin'],
          }
        }
      },
      passportTripTypes: id => {
        if (theme.features.passport.admin) {
          return {
            id,
            name: theme.localisation.passport.tripType.upper,
            url: `/admin/${theme.localisation.passport.tripType.path}`,
            permissions: ['manage_passport_admin'],
          }
        }
      },
      imageDimensions: (id) => {
        if (imageDimensions.dimensions && imageDimensions.dimensions.length) {
          return {
            id,
            name: 'Image Dimensions',
            url: `/admin/image-dimensions`,
            permissions: ['manage_pages', 'manage_programmes']
          }
        }
      },
      contentManagement: (id) => {
        if (theme.features.pages) {
          return {
            id,
            name: 'Content Management',
            icon: {
              id: 'i-admin-content-mgmt',
              width: 27,
              height: 27,
              viewBox: '0 -10 130 160'
            }
          }
        }
      },
      news: (id) => ({
        id,
        name: theme.localisation.news.upper,
        url: `/admin/${theme.localisation.news.path}`,
        permissions: ['manage_news']
      }),
      newsCategories: (id) => ({
        id,
        name: `${theme.localisation.news.upper} ${pluralize(theme.localisation.newsCategory.upper)}`,
        url: `/admin/${theme.localisation.newsCategory.path}`,
        permissions: ['manage_news']
      }),
      regions: (id) => {
        if (theme.features.regions.enabled) {
          return {
            id,
            name: pluralize(theme.localisation.region.upper),
            url: `/admin/${theme.localisation.region.path}`,
            permissions: ['manage_regions']
          }
        }
      },
      catalogues: (id) => {
        return {
          id,
          name: pluralize(theme.localisation.catalogue.upper),
          url: `/admin/${theme.localisation.catalogue.path}`,
          permissions: ['manage_pages', 'manage_catalogues'],
        }
      },
      navigation: (id) => ({
        id,
        name: 'Navigation',
        url: `/admin/navigation`,
        permissions: ['manage_pages', 'manage_news', 'manage_catalogues']
      }),
      videoTypes: (id) => {
        if (theme.features.videos.types) {
          return {
            id,
            name: `${theme.localisation.video.upper} types`,
            url: `/admin/${theme.localisation.video.path}-types`,
            permissions: ['manage_videos']
          }
        }
      }
    }
    return makeNavigation(CmsNavigation, navOptions)
  },
}

export default cmsNavigation
