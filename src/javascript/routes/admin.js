import React from 'react'
import pluralize from 'pluralize'

import { isAdmin } from 'javascript/services/user-permissions'

const AdminConfigProviders = React.lazy(() => import( /* webpackChunkName: 'admin.config-providers' */ 'javascript/views/admin/config/providers'))
const AnonymousAccessIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.anon-access-index' */ 'javascript/views/admin/anonymous-access/index'))
const AnonymousAccessNew = React.lazy(() => import( /* webpackChunkName: 'admin.anon-access-new' */ 'javascript/views/admin/anonymous-access/new'))
const AnonymousAccessShow = React.lazy(() => import( /* webpackChunkName: 'admin.anon-access-show' */ 'javascript/views/admin/anonymous-access/show'))
const ApprovalsIndex = React.lazy(() => import( /* webpackChunkName: 'admin.approvals-index' */ 'javascript/views/admin/approvals/index'))
const AssetAccessReports = React.lazy(() => import( /* webpackChunkName: 'admin.asset-access-reports' */ 'javascript/views/admin/assets/access-reports/index'))
const AssetCategoriesIndex = React.lazy(() => import( /* webpackChunkName: 'admin.asset-categories' */ 'javascript/views/admin/assets/categories/index'))
const AssetManagementEdit = React.lazy(() => import( /* webpackChunkName: 'admin.asset-management-edit' */ 'javascript/views/admin/assets/edit'))
const AssetManagementIndex = React.lazy(() => import( /* webpackChunkName: 'admin.asset-management-index' */ 'javascript/views/admin/assets/index'))
const AssetPermissionsIndex = React.lazy(() => import( /* webpackChunkName: 'admin.asset-permissions-index' */ 'javascript/views/admin/assets/permissions'))
const BannersForm = React.lazy(() => import( /* webpackChunkName: 'admin.banners-form' */ 'javascript/views/admin/styling/banners'))
const ButtonsForm = React.lazy(() => import( /* webpackChunkName: 'admin.buttons-form' */ 'javascript/views/admin/styling/buttons'))
const BroadcastersIndex = React.lazy(() => import( /* webpackChunkName: 'admin.broadcasters-index' */ 'javascript/views/admin/broadcasters/index'))
const CardsForm = React.lazy(() => import( /* webpackChunkName: 'admin.cards-form' */ 'javascript/views/admin/styling/cards'))
const CollectionContent = React.lazy(() => import( /* webpackChunkName: 'admin.collection-content' */ 'javascript/views/admin/pages/collection-content'))
const CollectionImagesView = React.lazy(() => import( /* webpackChunkName: 'admin.collection-images-view' */ 'javascript/views/admin/pages/collection-images'))
const CompaniesIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.companies-index-view' */ 'javascript/views/admin/companies/index'))
const ConfigGeneralView = React.lazy(() => import( /* webpackChunkName: 'admin.config-general' */ 'javascript/views/admin/config/general'))
const ConfigLocalisationView = React.lazy(() => import( /* webpackChunkName: 'admin.config-localisation' */ 'javascript/views/admin/config/localisation'))
const ConfigProgrammesView = React.lazy(() => import( /* webpackChunkName: 'admin.config-programmes' */ 'javascript/views/admin/config/programmes'))
const ConfigSocialView = React.lazy(() => import( /* webpackChunkName: 'admin.config-social' */ 'javascript/views/admin/config/social'))
const CustomAttributesIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.custom-attribute-types' */ 'javascript/views/admin/custom-attribute-types/index'))
const CustomCataloguesContent = React.lazy(() => import( /* webpackChunkName: 'admin.custom-catalogues-content' */ 'javascript/views/admin/custom-catalogues/content'))
const CustomCataloguesImages = React.lazy(() => import( /* webpackChunkName: 'admin.custom-catalogues-images' */ 'javascript/views/admin/custom-catalogues/images'))
const CustomCataloguesIndex = React.lazy(() => import( /* webpackChunkName: 'admin.custom-catalogues-index' */ 'javascript/views/admin/custom-catalogues/index'))
const CustomCataloguesProgrammes = React.lazy(() => import( /* webpackChunkName: 'admin.custom-catalogues-programmes' */ 'javascript/views/admin/custom-catalogues/programmes'))
const EpisodesIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.episodes-index' */ 'javascript/views/admin/episodes/index'))
const EpisodesVideoView = React.lazy(() => import( /* webpackChunkName: 'admin.episodes-video' */ 'javascript/views/admin/episodes/videos'))
const FactoryReset = React.lazy(() => import( /* webpackChunkName: 'admin.episodes-video' */ 'javascript/views/admin/styling/factory-reset'))
const FooterForm = React.lazy(() => import( /* webpackChunkName: 'admin.footer-form' */ 'javascript/views/admin/styling/footer'))
const FormsForm = React.lazy(() => import( /* webpackChunkName: 'admin.forms-form' */ 'javascript/views/admin/styling/forms'))
const GenresIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.genres' */ 'javascript/views/admin/genres/index'))
const GroupsIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.groups' */ 'javascript/views/admin/groups/index'))
const GroupsUsersIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.groups-users' */ 'javascript/views/admin/groups/users/index'))
const HeaderForm = React.lazy(() => import( /* webpackChunkName: 'admin.header-form' */ 'javascript/views/admin/styling/header'))
const ImageCropper = React.lazy(() => import( /* webpackChunkName: 'admin.image-cropper' */ 'javascript/views/admin/image-cropper/index'))
const ImageDimensions = React.lazy(() => import( /* webpackChunkName: 'admin.image-dimensions' */ 'javascript/views/admin/image-dimensions/index'))
const ImportIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.import-index' */ 'javascript/views/admin/import/index'))
const LanguagesIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.languages' */ 'javascript/views/admin/languages/index'))
const ManageProgrammeProductionCompanies = React.lazy(() => import( /* webpackChunkName: 'admin.manage-prog-prod-comp' */ 'javascript/views/admin/programmes/manage-programme-production-companies'))
const MarketingActivitiesIndex = React.lazy(() => import( /* webpackChunkName: 'admin.marketing-activities' */ 'javascript/views/admin/marketing/activities/index'))
const MarketingCategoriesIndex = React.lazy(() => import( /* webpackChunkName: 'admin.marketing-categories' */ 'javascript/views/admin/marketing/categories/index'))
const ModalsForm = React.lazy(() => import( /* webpackChunkName: 'admin.modals-form' */ 'javascript/views/admin/styling/modals'))
const MultipleVideoView = React.lazy(() => import( /* webpackChunkName: 'admin.mulitple-video-view' */ 'javascript/views/admin/multiple-videos/index'))
const NavigationIndex = React.lazy(() => import( /* webpackChunkName: 'admin.navigation-index' */ 'javascript/views/admin/navigation/index'))
const NavigationForm = React.lazy(() => import( /* webpackChunkName: 'admin.navigation-form' */ 'javascript/views/admin/styling/navigation'))
const NewsCategories = React.lazy(() => import( /* webpackChunkName: 'admin.news-categories' */ 'javascript/views/admin/news/categories'))
const NewsEdit = React.lazy(() => import( /* webpackChunkName: 'admin.news-edit' */ 'javascript/views/admin/news/management/edit'))
const NewsImages = React.lazy(() => import( /* webpackChunkName: 'admin.news-images' */ 'javascript/views/admin/news/management/images'))
const NewsManagement = React.lazy(() => import( /* webpackChunkName: 'admin.news-mngmt' */ 'javascript/views/admin/news/management'))
const PageImagesView = React.lazy(() => import( /* webpackChunkName: 'admin.pages-images' */ 'javascript/views/admin/pages/page-images'))
const PagesEditView = React.lazy(() => import( /* webpackChunkName: 'admin.pages-edit' */ 'javascript/views/admin/pages/edit'))
const PagesIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.pages-index' */ 'javascript/views/admin/pages/index'))
const PassportAttendeeEdit = React.lazy(() => import( /* webpackChunkName: 'admin.passport-attendee-edit' */ 'javascript/views/admin/passport/attendee/edit'))
const PassportAttendeeNew = React.lazy(() => import( /* webpackChunkName: 'admin.passport-attendee-new' */ 'javascript/views/admin/passport/attendee/new'))
const PassportContentsEdit = React.lazy(() => import( /* webpackChunkName: 'admin.passport-contents-edit' */ 'javascript/views/admin/passport/contents/edit'))
const PassportContentsNew = React.lazy(() => import( /* webpackChunkName: 'admin.passport-contents-new' */ 'javascript/views/admin/passport/contents/new'))
const PassportEventsEdit = React.lazy(() => import( /* webpackChunkName: 'admin.passport-events-edit' */ 'javascript/views/admin/passport/events/edit'))
const PassportEventsNew = React.lazy(() => import( /* webpackChunkName: 'admin.passport-events-new' */ 'javascript/views/admin/passport/events/new'))
const PassportHotelsEdit = React.lazy(() => import( /* webpackChunkName: 'admin.passport-hotels-edit' */ 'javascript/views/admin/passport/hotels/edit'))
const PassportHotelsNew = React.lazy(() => import( /* webpackChunkName: 'admin.passport-hotels-new' */ 'javascript/views/admin/passport/hotels/new'))
const PassportLocationsEdit = React.lazy(() => import( /* webpackChunkName: 'admin.passport-locations-edit' */ 'javascript/views/admin/passport/locations/edit'))
const PassportLocationsNew = React.lazy(() => import( /* webpackChunkName: 'admin.passport-locations-new' */ 'javascript/views/admin/passport/locations/new'))
const PassportMarketsEdit = React.lazy(() => import( /* webpackChunkName: 'admin.passport-markets-edit' */ 'javascript/views/admin/passport/markets/edit'))
const PassportMarketsIndex = React.lazy(() => import( /* webpackChunkName: 'admin.passport-markets-index' */ 'javascript/views/admin/passport/markets/index'))
const PassportMarketsNew = React.lazy(() => import( /* webpackChunkName: 'admin.passport-markets-new' */ 'javascript/views/admin/passport/markets/new'))
const PassportMarketsShow = React.lazy(() => import( /* webpackChunkName: 'admin.passport-markets-show' */ 'javascript/views/admin/passport/markets/show'))
const PassportSpreadsheetIndex = React.lazy(() => import( /* webpackChunkName: 'admin.passport-spreadsheet' */ 'javascript/views/admin/passport/spreadsheet/index'))
const PassportTripInvoiceTypeIndex = React.lazy(() => import( /* webpackChunkName: 'admin.passport-trip-invoice-type' */ 'javascript/views/admin/passport/trip-invoice-type/index'))
const PassportTripTypeIndex = React.lazy(() => import( /* webpackChunkName: 'admin.passport-trip-type' */ 'javascript/views/admin/passport/trip-type/index'))
const PermissionsIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.permissions' */ 'javascript/views/admin/permissions/index'))
const PrivateVideoAccessIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.private-video-access' */ 'javascript/views/admin/videos/private-access'))
const ProductionCompaniesIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.production-companies' */ 'javascript/views/admin/production-companies/index'))
const ProgrammeHighlightsIndex = React.lazy(() => import( /* webpackChunkName: 'admin.programme-highlights' */ 'javascript/views/admin/programme-highlights/index'))
const ProgrammeHighlightPagesImages = React.lazy(() => import( /* webpackChunkName: 'admin.programme-highlight-page-images' */ 'javascript/views/admin/programme-highlight-pages/images'))
const ProgrammeHighlightPagesIndex = React.lazy(() => import( /* webpackChunkName: 'admin.programme-highlight-pages' */ 'javascript/views/admin/programme-highlight-pages/index'))
const ProgrammesBroadcasters = React.lazy(() => import( /* webpackChunkName: 'admin.programmes-broadcasters' */ 'javascript/views/admin/programmes/broadcasters'))
const ProgrammesContentView = React.lazy(() => import( /* webpackChunkName: 'admin.programmes-content' */ 'javascript/views/admin/programmes/content'))
const ProgrammesEditView = React.lazy(() => import( /* webpackChunkName: 'admin.programmes-edit' */ 'javascript/views/admin/programmes/edit'))
const ProgrammesImagesView = React.lazy(() => import( /* webpackChunkName: 'admin.programmes-images' */ 'javascript/views/admin/programmes/images'))
const ProgrammesIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.programmes-index' */ 'javascript/views/admin/programmes/index'))
const ProgrammesNewView = React.lazy(() => import( /* webpackChunkName: 'admin.programmes-new' */ 'javascript/views/admin/programmes/new'))
const ProgrammesShowView = React.lazy(() => import( /* webpackChunkName: 'admin.programmes-show' */ 'javascript/views/admin/programmes/show'))
const ProgrammesTypesIndex = React.lazy(() => import( /* webpackChunkName: 'admin.programmes-types' */ 'javascript/views/admin/programme-types/index'))
const ProgrammesVideoView = React.lazy(() => import( /* webpackChunkName: 'admin.programmes-video-views' */ 'javascript/views/admin/programmes/videos'))
const QualitiesIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.qualities' */ 'javascript/views/admin/qualities/index'))
const RegionsIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.regions' */ 'javascript/views/admin/regions/index'))
const RolesIndex = React.lazy(() => import( /* webpackChunkName: 'admin.roles' */ 'javascript/views/admin/roles/index'))
const SeriesBroadcasters = React.lazy(() => import( /* webpackChunkName: 'admin.series-broadcasters' */ 'javascript/views/admin/series/broadcasters'))
const SeriesImagesView = React.lazy(() => import( /* webpackChunkName: 'admin.series-images' */ 'javascript/views/admin/series/images'))
const SeriesIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.series-index' */ 'javascript/views/admin/series/index'))
const SeriesManagement = React.lazy(() => import( /* webpackChunkName: 'admin.series-mgmt-index' */ 'javascript/views/admin/series-management/index'))
const SeriesProductionCompanies = React.lazy(() => import( /* webpackChunkName: 'admin.series-prod-comp' */ 'javascript/views/admin/series/series-production-companies'))
const SeriesVideoView = React.lazy(() => import( /* webpackChunkName: 'admin.series-video-view' */ 'javascript/views/admin/series/videos'))
const StylesColoursView = React.lazy(() => import( /* webpackChunkName: 'admin.styles-colors' */ 'javascript/views/admin/styling/colours'))
const StylesTypographyView = React.lazy(() => import( /* webpackChunkName: 'admin.styles-typography' */ 'javascript/views/admin/styling/typography'))
const TabsForm = React.lazy(() => import( /* webpackChunkName: 'admin.tabs-form' */ 'javascript/views/admin/styling/tabs'))
const TagsForm = React.lazy(() => import( /* webpackChunkName: 'admin.tags-form' */ 'javascript/views/admin/styling/tags'))
const TalentsIndex = React.lazy(() => import( /* webpackChunkName: 'admin.talents' */ 'javascript/views/admin/talents/index'))
const TeamMembersImages = React.lazy(() => import( /* webpackChunkName: 'admin.team-members-images' */ 'javascript/views/admin/team-members/images'))
const TeamMembersIndex = React.lazy(() => import( /* webpackChunkName: 'admin.team-members-index' */ 'javascript/views/admin/team-members/index'))
const TerritoriesIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.territories' */ 'javascript/views/admin/territories/index'))
const UsersEditView = React.lazy(() => import( /* webpackChunkName: 'admin.users-edit' */ 'javascript/views/admin/users/edit'))
const UsersIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.users-index' */ 'javascript/views/admin/users/index'))
const UsersNewView = React.lazy(() => import( /* webpackChunkName: 'admin.users-new' */ 'javascript/views/admin/users/new'))
const UsersShowView = React.lazy(() => import( /* webpackChunkName: 'admin.users-show' */ 'javascript/views/admin/users/show'))
const VideoDownloadLinksIndex = React.lazy(() => import( /* webpackChunkName: 'admin.video-download-links' */ 'javascript/views/admin/video-download-links/index'))
const VideosIndexView = React.lazy(() => import( /* webpackChunkName: 'admin.videos-index' */ 'javascript/views/admin/videos/index'))
const VideoTypesIndex = React.lazy(() => import( /* webpackChunkName: 'admin.videos-types' */ 'javascript/views/admin/video-types/index'))
const WeightedSearchTermsIndex = React.lazy(() => import( /* webpackChunkName: 'admin.videos-types' */ 'javascript/views/admin/weighted-search-terms/index'))

const cmsRouteConfig = {
  createRoutes: (theme, user) => {
    const routes = []
    if (theme.features.programmes) {
      routes.push({
        path: `${theme.localisation.programme.path}`,
        component: ProgrammesIndexView,
        permissions: [ 'manage_programmes' ]
      }, {
        path: `${theme.localisation.video.path}`,
        component: VideosIndexView,
        permissions: [ 'manage_videos' ]
      }, {
        path: `${theme.localisation.programme.path}/new`,
        component: ProgrammesNewView,
        permissions: [ 'manage_programmes' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme/edit`,
        component: ProgrammesEditView,
        permissions: [ 'manage_programmes' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme`,
        component: ProgrammesShowView,
        permissions: [ 'manage_programmes' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme/${theme.localisation.video.path}`,
        component: ProgrammesVideoView,
        permissions: [ 'manage_programmes', 'manage_videos' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme/content`,
        component: ProgrammesContentView,
        permissions: [ 'manage_programmes' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme/${theme.localisation.productionCompany.path}`,
        component: ManageProgrammeProductionCompanies,
        permissions: [ 'manage_programmes' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme/${theme.localisation.series.path}`,
        component: SeriesIndexView,
        permissions: [ 'manage_programmes' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme/${theme.localisation.series.path}/:series/${theme.localisation.video.path}`,
        component: SeriesVideoView,
        permissions: [ 'manage_programmes', 'manage_videos' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme/${theme.localisation.series.path}/:series/${theme.localisation.productionCompany.path}`,
        component: SeriesProductionCompanies,
        permissions: [ 'manage_programmes' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme/${theme.localisation.series.path}/:series/episodes`,
        component: EpisodesIndexView,
        permissions: [ 'manage_programmes' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme/${theme.localisation.series.path}/:series/episodes/:episode/${theme.localisation.video.path}`,
        component: EpisodesVideoView,
        permissions: [ 'manage_programmes', 'manage_videos' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme/images`,
        component: ProgrammesImagesView,
        permissions: [ 'manage_programmes' ]
      }, {
        path: pluralize(theme.localisation.genre.path),
        component: GenresIndexView,
        permissions: [ 'manage_programme_data_options' ]
      }, {
        path: 'qualities',
        component: QualitiesIndexView,
        permissions: [ 'manage_programme_data_options' ]
      }, {
        path: 'languages',
        component: LanguagesIndexView,
        permissions: [ 'manage_programme_data_options' ]
      }, {
        path: pluralize(theme.localisation.productionCompany.path),
        component: ProductionCompaniesIndexView,
        permissions: [ 'manage_programme_data_options' ]
      }, {
        path: 'custom-attributes',
        component: CustomAttributesIndexView,
        permissions: [ 'manage_programme_data_options' ]
      }, {
        path: `:resourceType/:resourceId/image-cropper/:imageName/:variant`,
        component: ImageCropper,
        permissions: [ 'manage_programmes', 'manage_pages' ]
      }, {
        path: `${theme.localisation.series.path}`,
        component: SeriesManagement,
        permissions: [ 'manage_programmes' ]
      })
    }

    if(theme.features.programmeSearch.weightedWords.enabled) {
      routes.push({
        path: 'weighted-search-terms',
        component: WeightedSearchTermsIndex,
        permissions: [ 'manage_programme_data_options' ]
      })
    }

    if (theme.features.programmeOverview.seriesImages) {
      routes.push({
        path: `${theme.localisation.programme.path}/:programme/${theme.localisation.series.path}/:series/images`,
        component: SeriesImagesView,
        permissions: ['manage_programmes'],
      })
    }

    if (theme.features.videos.oneTimeVideoDownload) {
      routes.push({
        path: 'video-download-links',
        component: VideoDownloadLinksIndex,
        permissions: ['manage_programmes', 'manage_videos'],
      })
    }

    if (theme.features.dataImport.manual) {
      routes.push({
        path: 'import',
        component: ImportIndexView,
        permissions: ['manage_data_import'],
      })
    }

    if (theme.features.users) {
      routes.push({
        path: 'companies',
        component: CompaniesIndexView,
        permissions: [ 'manage_companies' ]
      }, {
        path: 'users',
        component: UsersIndexView,
        permissions: [ 'manage_internal_users', 'manage_external_users' ]
      }, {
        path: 'users/new',
        component: UsersNewView,
        permissions: [ 'manage_internal_users', 'manage_external_users' ]
      }, {
        path: 'users/:user/edit',
        component: UsersEditView,
        permissions: [ 'manage_internal_users', 'manage_external_users' ]
      }, {
        path: 'users/:user',
        component: UsersShowView,
        permissions: [ 'manage_internal_users', 'manage_external_users' ]
      }, {
        path: 'roles',
        component: RolesIndex,
        permissions: [ 'manage_roles' ]
      }, {
        path: 'permissions',
        component: PermissionsIndexView,
        permissions: [ 'copy_permissions' ]
      })

      if (
        theme.features.territories.enabled ||
        theme.features.territories.cms
      ) {
        routes.push({
          path: 'territories',
          component: TerritoriesIndexView,
          permissions: ['manage_territories'],
        })
      }

      if (theme.features.users.registrations.enabled) {
        routes.push({
          path: 'approvals',
          component: ApprovalsIndex,
          permissions: ['manage_approvals'],
        })
      }

      if (theme.features.groups.enabled) {
        routes.push({
          path: 'groups',
          component: GroupsIndexView,
          permissions: [ 'manage_groups' ]
        }, {
          path: 'groups/:groupId/users',
          component: GroupsUsersIndexView,
          permissions: [ 'manage_groups' ]
        })
      }

      if (theme.features.users.anonymousAccess.enabled) {
        routes.push({
          path: theme.localisation.anonymousAccess.path,
          component: AnonymousAccessIndexView,
          permissions: [ 'manage_anonymous_access' ]
        }, {
          path: `${theme.localisation.anonymousAccess.path}/new`,
          component: AnonymousAccessNew,
          permissions: [ 'manage_anonymous_access' ]
        }, {
          path: `${theme.localisation.anonymousAccess.path}/:id`,
          component: AnonymousAccessShow,
          permissions: [ 'manage_anonymous_access' ]
        })
      }
    }

    if (theme.features.teamMembers || theme.features.producerHub) {
      routes.push(
        {
          path: theme.localisation.team.path,
          component: TeamMembersIndex,
          permissions: ['manage_teams'],
        },
        {
          path: `${theme.localisation.team.path}/:id/images`,
          component: TeamMembersImages,
          permissions: ['manage_teams'],
        },
      )
    }

    if (theme.features.app.enabled) {
      if (theme.features.programmes) {
        routes.push({
          path: 'highlights',
          component: ProgrammeHighlightsIndex,
          permissions: [ 'manage_highlights' ]
        })
      }
      if (theme.features.app.programmeHighlightPages) {
        routes.push({
          path: 'highlight-pages',
          component: ProgrammeHighlightPagesIndex,
          permissions: [ 'manage_highlights' ]
        }, {
          path: 'highlight-pages/:highlightPageId/images',
          component: ProgrammeHighlightPagesImages,
          permissions: [ 'manage_highlights' ]
        }, {
          path: 'highlights/:highlightPageId',
          component: ProgrammeHighlightsIndex,
          permissions: [ 'manage_highlights' ]
        })
      }
    }

    if (theme.features.assets) {
      routes.push(
        {
          path: `${pluralize(theme.localisation.asset.lower)}/categories`,
          component: AssetCategoriesIndex,
          permissions: ['manage_assets'],
        },
        {
          path: `${pluralize(theme.localisation.asset.lower)}/management`,
          component: AssetManagementIndex,
          permissions: ['manage_assets'],
        },
        {
          path: `${pluralize(theme.localisation.asset.lower)}/management/:id/edit`,
          component: AssetManagementEdit,
          permissions: ['manage_assets'],
        },
        {
          path: `${pluralize(theme.localisation.asset.lower)}/permissions`,
          component: AssetPermissionsIndex,
          permissions: ['manage_asset_permissions'],
        },
        {
          path: `${pluralize(theme.localisation.asset.lower)}/access`,
          component: AssetAccessReports,
          permissions: ['manage_assets'],
        },
      )
    }

    if ((typeof theme.features.pages === 'boolean' && theme.features.pages) || theme.features.pages.enabled) {
      routes.push(
        {
          path: 'pages',
          component: PagesIndexView,
          permissions: ['manage_pages'],
        },
        {
          path: 'pages/:id/edit',
          component: PagesEditView,
          permissions: ['manage_pages'],
        },
        {
          path: 'pages/collection/:collectionId/content',
          component: CollectionContent,
          permissions: ['manage_pages'],
        },
        {
          path: 'pages/collection/:collection/images',
          component: CollectionImagesView,
          permissions: ['manage_pages'],
        },
        {
          path: 'pages/page/:page/images',
          component: PageImagesView,
          permissions: ['manage_pages'],
        },
      )
    }

    routes.push({
      path: theme.localisation.news.path,
      component: NewsManagement,
      permissions: [ 'manage_news' ]
    }, {
      path: theme.localisation.newsCategory.path,
      component: NewsCategories,
      permissions: [ 'manage_news' ]
    }, {
      path: `${theme.localisation.news.path}/:slug/edit`,
      component: NewsEdit,
      permissions: ['manage_news'],
    }, {
      path: `${theme.localisation.news.path}/:slug/images`,
      component: NewsImages,
      permissions: ['manage_news'],
    })

    if (theme.features.videos.multipleUpload) {
      routes.push({
        path: `${theme.localisation.programme.path}/:programme/${theme.localisation.video.path}/multiple`,
        component: MultipleVideoView,
        permissions: [ 'manage_programmes', 'manage_videos' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme/${theme.localisation.series.path}/:series/${theme.localisation.video.path}/multiple`,
        component: MultipleVideoView,
        permissions: [ 'manage_programmes', 'manage_videos' ]
      }, {
        path: `${theme.localisation.programme.path}/:programme/${theme.localisation.series.path}/:series/episodes/:episode/${theme.localisation.video.path}/multiple`,
        component: MultipleVideoView,
        permissions: [ 'manage_programmes', 'manage_videos' ]
      })
    }

    routes.push(
      {
        path: `config/general`,
        component: ConfigGeneralView,
        permissions: ['manage_configurations']
      },
      {
        path: `config/social`,
        component: ConfigSocialView,
        permissions: ['manage_configurations']
      },
      {
        path: `config/providers`,
        component: AdminConfigProviders,
        permissions: ['manage_configurations']
      },
      {
        path: `config/localisation`,
        component: ConfigLocalisationView,
        permissions: ['manage_configurations']
      },
      {
        path: `config/programmes`,
        component: ConfigProgrammesView,
        permissions: ['manage_configurations']
      },
    )

    if (theme.features.lite) {
      routes.push(
        {
          path: `styles/colours`,
          component: StylesColoursView,
          permissions: ['manage_configurations']
        },
        {
          path: `styles/typography`,
          component: StylesTypographyView,
          permissions: ['manage_configurations']
        },
        {
          path: 'styles/tabs',
          component: TabsForm,
          permissions: ['manage_configurations']
        },
        {
          path: 'styles/tags',
          component: TagsForm,
          permissions: ['manage_configurations']
        },
        {
          path: 'styles/navigation',
          component: NavigationForm,
          permissions: ['manage_configurations']
        },
        {
          path: 'styles/buttons',
          component: ButtonsForm,
          permissions: ['manage_configurations']
        },
        {
          path: 'styles/header',
          component: HeaderForm,
          permissions: ['manage_configurations']
        },
        {
          path: 'styles/footer',
          component: FooterForm,
          permissions: ['manage_configurations']
        },
        {
          path: 'styles/banners',
          component: BannersForm,
          permissions: ['manage_configurations']
        },
        {
          path: 'styles/modals',
          component: ModalsForm,
          permissions: ['manage_configurations']
        },
        {
          path: 'styles/forms',
          component: FormsForm,
          permissions: ['manage_configurations']
        },
        {
          path: 'styles/cards',
          component: CardsForm,
          permissions: ['manage_configurations']
        },
      )
      if (isAdmin(user)) {
        routes.push({
          path: 'styles/factory-reset',
          component: FactoryReset,
          permissions: ['manage_configurations']
        })
      }
    }

    if (theme.features.marketing) {
      routes.push(
        {
          path: `marketing/categories`,
          component: MarketingCategoriesIndex,
          permissions: ['manage_marketing'],
        },
        {
          path: `marketing/activities`,
          component: MarketingActivitiesIndex,
          permissions: ['manage_marketing'],
        },
      )
    }

    if (theme.features.programmeTypes.enabled) {
      routes.push({
        path: theme.localisation.programmeType.path,
        component: ProgrammesTypesIndex,
        permissions: [ 'manage_programme_data_options' ]
      })
    }

    if (theme.features.videos.privateVideoAccess) {
      routes.push({
        path: `${theme.localisation.video.path}/:video/private-access`,
        component: PrivateVideoAccessIndexView,
        permissions: ['manage_videos'],
      })
    }


    if (theme.features.talents) {
      routes.push({
        path: theme.localisation.talent.path,
        component: TalentsIndex,
        permissions: ['manage_talents'],
      })
    }

    if (theme.features.passport.admin) {
      routes.push(
        {
          path: theme.localisation.passport.market.path,
          component: PassportMarketsIndex,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/new`,
          component: PassportMarketsNew,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId`,
          component: PassportMarketsShow,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId/edit`,
          component: PassportMarketsEdit,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId/location/new`,
          component: PassportLocationsNew,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId/location/:locationId/edit`,
          component: PassportLocationsEdit,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId/hotel/new`,
          component: PassportHotelsNew,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId/hotel/:hotelId/edit`,
          component: PassportHotelsEdit,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId/event/new`,
          component: PassportEventsNew,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId/event/:eventId/edit`,
          component: PassportEventsEdit,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId/content/new`,
          component: PassportContentsNew,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId/content/:contentId/edit`,
          component: PassportContentsEdit,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId/spreadsheet`,
          component: PassportSpreadsheetIndex,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId/attendee/new`,
          component: PassportAttendeeNew,
          permissions: ['manage_passport_admin'],
        },
        {
          path: `${theme.localisation.passport.market.path}/:marketId/attendee/:attendeeId/edit`,
          component: PassportAttendeeEdit,
          permissions: ['manage_passport_admin'],
        },
        {
          path: theme.localisation.passport.tripInvoiceType.path,
          component: PassportTripInvoiceTypeIndex,
          permissions: ['manage_passport_admin'],
        },
        {
          path: theme.localisation.passport.tripType.path,
          component: PassportTripTypeIndex,
          permissions: ['manage_passport_admin'],
        },
      )
    }

    routes.push({
      path: 'image-dimensions',
      component: ImageDimensions,
      permissions: [ 'manage_pages', 'manage_programmes' ]
    })

    if (theme.features.regions.enabled) {
      routes.push({
        path: theme.localisation.region.path,
        component: RegionsIndexView,
        permissions: ['manage_regions'],
      })
    }
    routes.push({
      path: `${theme.localisation.catalogue.path}/:catalogueId/content`,
      component: CustomCataloguesContent,
      permissions: [ 'manage_pages', 'manage_catalogues' ]
    }, {
      path: `${theme.localisation.catalogue.path}/:catalogueId/images`,
      component: CustomCataloguesImages,
      permissions: [ 'manage_pages', 'manage_catalogues' ]
    }, {
      path: `${theme.localisation.catalogue.path}/:catalogueId/${theme.localisation.programme.path}`,
      component: CustomCataloguesProgrammes,
      permissions: [ 'manage_pages', 'manage_catalogues' ]
    }, {
      path: theme.localisation.catalogue.path,
      component: CustomCataloguesIndex,
      permissions: [ 'manage_pages', 'manage_catalogues' ]
    })

    routes.push({
      path: 'navigation',
      component: NavigationIndex,
      permissions: [ 'manage_pages', 'manage_news', 'manage_catalogues' ]
    })

    routes.push({
      path: `${theme.localisation.video.path}-types`,
      component: VideoTypesIndex,
      permissions: [ 'manage_videos' ]
    })

    if (theme.features.programmes && (theme.features.programmeOverview.broadcasters.programme || theme.features.programmeOverview.broadcasters.series)) {
      routes.push({
        path: theme.localisation.broadcaster.path,
        component: BroadcastersIndex,
        permissions: [ 'manage_programme_data_options' ]
      })

      if (theme.features.programmeOverview.broadcasters.programme) {
        routes.push({
          path: `${theme.localisation.programme.path}/:programme/${theme.localisation.broadcaster.path}`,
          component: ProgrammesBroadcasters,
          permissions: [ 'manage_programme_data_options' ]
        })
      }

      if (theme.features.programmeOverview.broadcasters.series) {
        routes.push({
          path: `${theme.localisation.programme.path}/:programme/${theme.localisation.series.path}/:series/${theme.localisation.broadcaster.path}`,
          component: SeriesBroadcasters,
          permissions: [ 'manage_programme_data_options' ]
        })
      }
    }




    return routes
  },
}

export default cmsRouteConfig
