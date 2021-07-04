import * as customConfig from 'javascript/config/custom-features'
import deepmerge from 'deepmerge-concat'
import { ThemeType, RecursivePartial } from 'javascript/utils/theme/types/ThemeType'
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

import defaultApiFeatures from 'javascript/config/default-api-features'
import defaultApiLocalisation from 'javascript/config/default-api-localisation'

/** Ensure that arrays are overwritten, not concatenated, during merge */
const overwriteArrayMerge = (_: unknown, sourceArray: any[]) => sourceArray

const customFeatures = {
  // Custom Features can be added here for development purposes whilst awaiting on addition to the api
}
export const Features: ThemeType['features'] = deepmerge(defaultApiFeatures, customFeatures)
/*
* When getTheme gets back API request for Features all will be overwritten with API values if they exist.
* The above merge order is for setting default values before updating from BE.
* Hardcoded values DO NOT take precedence in theme context object
*/

const customLocalisation = {
  // Custom Localisation can be added here for development purposes whilst awaiting on addition to the api
}
export const Localisation: ThemeType['localisation'] = deepmerge(defaultApiLocalisation, customLocalisation)

// Custom data attributes to ignore on the front end, comma seperated list, lowercase
// @ts-ignore
export const IgnoredAttrs = customConfig.variables.IgnoredAttrs || 'banner text colour'

// Custom data attributes to readOnly in the Admin cms, comma seperated list, lowercase
// @ts-ignore
export const ReadOnlyAttrs = customConfig.variables.ReadOnlyAttrs || ''


// Google Maps API Key
// @ts-ignore
export const MapsKey = customConfig.variables.MapsKey || 'AIzaSyBftBauBBCn-lR4OX6pPMjXk9keqs-JJ1E'


// Main brand color ( used by reporting )
// @ts-ignore
export const BrandColor = customConfig.variables.BrandColor || '12c49d'
// @ts-ignore
export const ChartBgColor = customConfig.variables.ChartBgColor || 'ffffff'
// @ts-ignore
export const ChartTextColor = customConfig.variables.ChartTextColor || '000000'

// Brand buyer types
// @ts-ignore
export const BuyerTypes = customConfig.variables.BuyerTypes || {}

// Passport flight Carriers
const defaultFlightCarriers = {
  'BA': 'British Airways',
  'U2': 'Easy Jet'
}
// @ts-ignore
export const FlightCarriers = customConfig.variables.FlightCarriers || defaultFlightCarriers

// Passport pick up locations
const defaultPickUpLocations = {
  outbound: ['Airport'],
  inbound: ['Hotel']
}
// @ts-ignore
export const PickUpLocations = customConfig.variables.PickUpLocations || defaultPickUpLocations

// Passport drop off locations
const defaultDropOffLocations = {
  outbound: ['Hotel'],
  inbound: ['Airport']
}
// @ts-ignore
export const DropOffLocations = customConfig.variables.DropOffLocations || defaultDropOffLocations

// @ts-ignore
export const ProducerHubDisclaimer = customConfig.variables.ProducerHubDisclaimer || ''

// Navigation Menus - These mapped arrays are for order only
// They conditionally render based on features
// i.e. the order should contain all possible permutations

// @ts-ignore
export const KidsVersion  = customConfig.variables.KidsVersion || false

// @ts-ignore
export const Brands = customConfig.variables.Brands || {}

// @ts-ignore
export const ListFolderIcon  = customConfig.variables.ListFolderIcon || false

// @ts-ignore
const defaultPlaceholders = {
  small: {
    nonRetina: require('images/theme/programme-placeholder.jpg'),
    retina: require('images/theme/programme-placeholder-retina.jpg')
  }
}

export const Placeholders = customConfig.variables.Placeholders ? deepmerge(defaultPlaceholders, customConfig.variables.Placeholders) : defaultPlaceholders

const defaultCmsNavigation = [
  'admin',
  [
    'companies',
    'users',
    'roles',
    'approvals',
    'permissions',
    'territories',
    'regions',
    'teamMembers',
    'groups',
    'anonymousAccess',
    'imageDimensions',
  ],
  'programmeManagement',
  [
    'programmes',
    'videos',
    'series',
    'catalogues',
    'genres',
    'programmeTypes',
    'videoTypes',
    'qualities',
    'languages',
    'talent',
    'productionCompanies',
    'broadcasters',
    'customAttributes',
    'weightedSearchTerms',
    'oneTimeVideoDownload',
    'import'
  ],
  'contentManagement',
  [
    'pages',
    'news',
    'newsCategories',
    'navigation'
  ],
  'assetManagement',
  [
    'assetCategories',
    'assets',
    'assetPermissions',
    'assetAccess'
  ],
  'appManagement',
  [
    'highlights',
    'highlightPages',
  ],
  'config',
  'styles',
  'marketing',
  [
    'marketingCategories',
    'marketingActivities'
  ],
  'passport',
  [
    'passportMarkets',
    'passportInvoiceTypes',
    'passportTripTypes'
  ]
]
export const CmsNavigation = customConfig.CmsNavigation.length ? customConfig.CmsNavigation : defaultCmsNavigation

const defaultComponents: ThemeType['components'] = {
  addToList: {
    carousel: {
      xlarge: {
        slidesToShow: 6,
        arrows: true,
        scrollBar: true
      },
      large: {
        slidesToShow: 4,
        dots: true,
        arrows: false,
        scrollBar: false
      },
      medium: {
        slidesToShow: 2
      },
      small: {
        slidesToShow: 1
      }
    }
  },
  forms: {
    titleOptions: [{
      value: 'Mr',
      label: 'Mr',
    }, {
      value: 'Mrs',
      label: 'Mrs',
    }, {
      value: 'Miss',
      label: 'Miss',
    }, {
      value: 'Ms',
      label: 'Ms',
    }]
  },
}
export const Components: ThemeType['components'] = customConfig.Components ? deepmerge(defaultComponents, customConfig.Components, { arrayMerge: overwriteArrayMerge }) : defaultComponents


const customCatalogueLayout = customConfig.catalogueLayout
const defaultCatalogueLayout: RecursivePartial<TemplateTypes> = {
  templateA: {
    index: {
      loggedIn: [
        'banner',
        'videoCarousel',
        'breadcrumbsPlain',
        'programmeDetails',
        'contentBlocks',
        'formatProgrammes',
        'relatedProgrammes',
        'recentlyViewed',
      ],
      loggedOut: [
        'banner',
        'videoCarousel',
        'breadcrumbsPlain',
        'loggedOutProgrammeDetails',
        'recentlyViewed',
      ]
    },
    programmeDetails: {
      main: [
        'pdfAsset',
        'programmeHeading',
        'programmeDescriptionIfExists',
        'seriesAndEpisodeCount',
        'activeSeries',
        'requestForAsset',
      ],
      side: [
        'productionInfoHeading',
        'booleanProgrammeTypes',
        'alternativeTitles',
        'genres',
        'programmeType',
        'qualities',
        'languages',
        'productionYears',
        'nonBooleanProgrammeTypes',
        'productionCompanies',
        'programmeBroadcasters',
        'talents',
        'login',
      ],
    },
  },
  templateB: { // to be used with 'my assets' feature
    index: {
      loggedIn: [
        'banner',
        'breadcrumbsPlain',
        'contentTabs',
        'contentBlocks',
        'relatedProgrammes',
        'recentlyViewed',
        'formatProgrammes'
      ],
      loggedOut: [
        'banner',
        'breadcrumbsPlain',
        'contentTabs',
        'recentlyViewed',
      ]
    },
    contentTabs: {
      loggedIn: [
        {
          'programmeDetails':'Programme Details',
        }, {
          'myAssets': 'Assets'
        }
      ],
      loggedOut: [
        {
          'loggedOutProgrammeDetails':'Programme Details',
        }, {
          'myAssets': 'Assets'
        }
      ]
    },
    programmeDetails: {
      main: [
        'programmeHeading',
        'programmeDescriptionIfExists',
        'pdfAsset',
        'activeSeries',
        'requestForAsset',
      ],
      side: [
        'booleanProgrammeTypes',
        'alternativeTitles',
        'catalogues',
        'genres',
        'programmeType',
        'qualities',
        'languages',
        'productionYears',
        'nonBooleanProgrammeTypes',
        'productionCompanies',
        'programmeBroadcasters',
        'talents',
        'login',
      ],
    },
  }
}

export const catalogueLayout = deepmerge(
  defaultCatalogueLayout,
  customCatalogueLayout,
  { arrayMerge: overwriteArrayMerge }
)
