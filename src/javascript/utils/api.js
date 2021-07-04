import JsonApi from 'javascript/utils/devour-client'
import apiConfig from 'javascript/config'
import modelData from 'javascript/models'
import camelCase from 'lodash/camelCase'
import pluralize from 'pluralize'
import insertApiMiddleware from 'javascript/utils/insertApiMiddleware'

/**
 * This file will be a global spot where we define
 * all devour-client's models.
 */
export const getApi = () => {

  const api = new JsonApi(apiConfig)
  api.headers = Object.assign(apiConfig.headers, api.headers)
  insertApiMiddleware(api)

  const modelKeys = [
    'account-manager',
    'asset-material-search-result',
    'bulk-user-group',
    'brightcove-account',
    'broadcaster',
    'catalogue',
    'company',
    'impersonated-user',
    'production-companies-programme',
    'production-companies-sery',
    'knox-account',
    'meeting',
    'meeting-followup',
    'programme-broadcaster',
    'programme-type',
    'private-video-access',
    'region',
    'restricted-asset-material-company',
    'restricted-asset-material-group',
    'restricted-asset-material-user',
    'restricted-programme-company',
    'restricted-programme-group',
    'restricted-programme-user',
    'restricted-series-company',
    'restricted-series-group',
    'restricted-series-user',
    'restricted-video-company',
    'restricted-video-group',
    'restricted-video-user',
    'series-broadcaster',
    'territory',
    'video-type',
    'virtual-meeting',
    'virtual-meeting-attendee',
    'virtual-meeting-chat-message',
    'weighted-word',
    'wistia-account'
  ]

  modelKeys.forEach(key => {
    api.define(key, modelData[camelCase(pluralize.plural(key))])
  })

  // KEEP FULLY DEFINED MODELS BELOW modelKeys MAPPING (otherwise it can overwrite collection paths)

  /** Add new models here */
  api.define('anonymous-access-item', modelData.anonymousAccessItems)
  api.define('anonymous-access', modelData.anonymousAccesses)
  api.define('approval', modelData.approvals)
  api.define('asset-category', modelData.assetCategories)
  api.define('asset-item', modelData.assetItems)
  api.define('asset-material-search-result', modelData.assetMaterialSearchResults, { collectionPath: 'asset-materials/search'})
  api.define('asset-material', modelData.assetMaterials)
  api.define('collection', modelData.collections)
  api.define('content-position', modelData.contentPositions)
  api.define('custom-attribute-type', modelData.customAttributeTypes)
  api.define('custom-attribute', modelData.customAttributes)
  api.define('episode', modelData.episodes)
  api.define('genre-score', modelData.genreScores)
  api.define('genre', modelData.genres)
  api.define('group', modelData.groups)
  api.define('image-configuration', modelData.imageConfigurations)
  api.define('image', modelData.images)
  api.define('language', modelData.languages)
  api.define('limited-access-programme-user', modelData.limitedAccessProgrammeUser)
  api.define('list-duplicate', modelData.listDuplicates)
  api.define('list-programme', modelData.listProgrammes)
  api.define('list-sery', modelData.listSeries)
  api.define('list-share', modelData.listShares)
  api.define('list-video', modelData.listVideos)
  api.define('list', modelData.lists)
  api.define('like', modelData.likes)
  api.define('meta-datum', modelData.metaData)
  api.define('news-article-search-result', modelData.newsArticleSearchResults, { collectionPath: 'news-articles/search'})
  api.define('news-article', modelData.newsArticles)
  api.define('news-category', modelData.newsCategories)
  api.define('page-image', modelData.pageImages)
  api.define('page', modelData.pages)
  api.define('production-company', modelData.productionCompanies)
  api.define('programme-alternative-title', modelData.programmeAlternativeTitles)
  api.define('programme-highlight-category', modelData.programmeHighlightCategories)
  api.define('programme-highlight', modelData.programmeHighlights)
  api.define('programme-highlight-page', modelData.programmeHighlightPages)
  api.define('programme-search-result', modelData.programmeSearchResults, { collectionPath: 'programmes/search' })
  api.define('programme-talent', modelData.programmeTalents)
  api.define('programme-types', modelData.programmeTypes)
  api.define('programme-view', modelData.programmeViews)  
  api.define('programme', modelData.programmes)
  api.define('quality', modelData.qualities)
  api.define('responsive-image', modelData.responsiveImages)
  api.define('role', modelData.roles)
  api.define('series-image', modelData.seriesImages)
  api.define('series-search-result', modelData.seriesTalents, { collectionPath: 'series/search' })
  api.define('series-talent', modelData.seriesTalents)
  api.define('series', modelData.series)
  api.define('talent-type', modelData.talentTypes)
  api.define('talent', modelData.talents)
  api.define('territory', modelData.territories)
  api.define('user-programme', modelData.userProgrammes)
  api.define('user-search-result', modelData.userSearchResults, { collectionPath: 'users/search' })
  api.define('user', modelData.users)
  api.define('video-download-link', modelData.videoDownloadLinks)
  api.define('video-search-result', modelData.videoSearchResults, { collectionPath: 'videos/search' })
  api.define('video-view', modelData.videoViews)
  api.define('video', modelData.videos)
  api.define('watermarked-video', modelData.watermarkedVideos)

  // Passport
  api.define('passport-content', modelData.passport.contents, { collectionPath: 'contents'})
  api.define('passport-flight', modelData.passport.flights, { collectionPath: 'flights'} )
  api.define('passport-flight-schedule', modelData.passport.flightSchedules, { collectionPath: 'flight-schedules'} )
  api.define('passport-hotel', modelData.passport.hotels, { collectionPath: 'hotels'})
  api.define('passport-hotel-reservation', modelData.passport.hotelReservations, { collectionPath: 'hotel-reservations'} )
  api.define('passport-location', modelData.passport.locations, { collectionPath: 'locations'})
  api.define('passport-market', modelData.passport.markets, { collectionPath: 'markets'} )
  api.define('passport-market-duplicate', modelData.passport.marketDuplicates, { collectionPath: 'market-duplicates'} )
  api.define('passport-market-event', modelData.passport.marketEvents, { collectionPath: 'market-events'} )
  api.define('passport-market-event-user', modelData.passport.marketEventUsers, { collectionPath: 'market-event-users'} )
  api.define('passport-notification', modelData.passport.notifications, { collectionPath: 'notifications'} )
  api.define('passport-recharge', modelData.passport.recharges, { collectionPath: 'recharges'} )
  api.define('passport-support-user', modelData.passport.supportUsers, { collectionPath: 'support-users'} )
  api.define('passport-transfer', modelData.passport.transfers, { collectionPath: 'transfers'} )
  api.define('passport-trip', modelData.passport.trips, { collectionPath: 'trips'} )
  api.define('passport-trip-invoice-type', modelData.passport.tripInvoiceTypes, { collectionPath: 'trip-invoice-types'} )
  api.define('passport-trip-type', modelData.passport.tripTypes, { collectionPath: 'trip-types'} )
  api.define('passport-trip-search-result', modelData.passport.tripSearchResults, { collectionPath: 'trips/search'} )

  // Reporting
  api.define('reports-dashboard', modelData.reports.dashboard, { collectionPath: 'reports/dashboard' })
  api.define('reports-by-dashboard-category-download', modelData.reports.byDashboard.categoryDownload)
  api.define('reports-by-dashboard-most-viewed-programme', modelData.reports.byDashboard.mostViewedProgramme)
  api.define('reports-by-dashboard-top-genre', modelData.reports.byDashboard.topGenre)
  api.define('reports-by-dashboard-top-users-login-action', modelData.reports.byDashboard.topUsersLoginAction)
  api.define('reports-by-dashboard-user-time-spent-on-programme', modelData.reports.byDashboard.userTimeSpentOnProgramme)

  api.define('reports-user', modelData.reports.user, { collectionPath: 'reports/users' })
  api.define('reports-by-user-user-activity', modelData.reports.byUser.userActivities)
  api.define('reports-by-user-user-list', modelData.reports.byUser.userList)
  api.define('reports-by-user-user-overview-information', modelData.reports.byUser.userOverviewInformation)
  api.define('reports-by-user-videos-watched', modelData.reports.byUser.videosWatched)

  api.define('reports-system', modelData.reports.system, { collectionPath: 'reports/system' })
  api.define('reports-by-system-overview', modelData.reports.bySystem.overview, { collectionPath: 'overview' })
  api.define('reports-by-system-user-activity', modelData.reports.bySystem.userActivities, { collectionPath: 'user-activities' })

  api.define('reports-programme', modelData.reports.programme, { collectionPath: 'reports/programmes' })
  api.define('reports-by-programme-user-view', modelData.reports.byProgramme.userView)
  api.define('reports-by-programme-user-activity', modelData.reports.byProgramme.userActivities)

  api.define('reports-producer', modelData.reports.programme, { collectionPath: 'reports/producers' })
  api.define('reports-by-producer-screeners-sent', modelData.reports.byProducer.screenerSent, { collectionPath: 'screeners-sent' })
  api.define('reports-by-producer-recipients-of-screener', modelData.reports.byProducer.recipientsOfScreener)
  api.define('reports-by-producer-user-activity', modelData.reports.byProducer.programmePageView)

  // Producer-hub
  api.define('licence', modelData.producerHub.licences)
  api.define('licence-amount', modelData.producerHub.licenceAmounts)
  api.define('programme-amount', modelData.producerHub.programmeAmounts)
  api.define('series-amount', modelData.producerHub.seriesAmounts)

  api.define('team', modelData.teams)
  api.define('team-member', modelData.teamMembers)
  api.define('team-region', modelData.teamRegions)
  api.define('team-department', modelData.teamDepartments)

  return api
}

export default getApi()
