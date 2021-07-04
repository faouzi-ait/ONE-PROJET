import { CustomThemeType, RecursivePartial } from "javascript/utils/theme/types/ThemeType"
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

export const variables: CustomThemeType['variables'] = {
  BrandColor: '7CDAE1',
  Brands: {
    'AcornTV' : require('images/theme/brands/acorn.png'),
    'AMC' : require('images/theme/brands/amc.png'),
    'BBC America' : require('images/theme/brands/bbc-america.png'),
    'IFC' : require('images/theme/brands/ifc.png'),
    'Shudder' : require('images/theme/brands/shudder.png'),
    'SundanceTV' : require('images/theme/brands/sundance-tv.png'),
    'SundanceNow' : require('images/theme/brands/sundance-now.png'),
  },
}

export const CmsNavigation = []
export const Components: CustomThemeType['components'] = {
  addToList: {
    carousel: {
      xlarge: {
        slidesToShow: 4
      }
    }
  }
}

export const catalogueLayout: RecursivePartial<TemplateTypes> = {
  templateA: {
    index: {
      loggedIn: [
        'banner',
        'breadcrumbs',
        'videoCarousel',
        'programmeDetails',
        'contentBlocks',
        'formatProgrammes',
        'relatedProgrammes',
        'recentlyViewed',
      ],
      loggedOut: [
        'banner',
        'breadcrumbs',
        'videoCarousel',
        'programmeDetails',
        'contentBlocks',
        'relatedProgrammes',
        'recentlyViewed',
      ]
    },
    programmeDetails: {
      main: [
        'pdfAsset',
        'programmeHeading',
        'programmeDescription',
        'seriesAndEpisodeCount',
        'episodeCount',
        'activeSeries',
        'requestForAsset',
      ],
    },
  }
}



