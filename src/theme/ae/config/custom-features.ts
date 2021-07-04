import { CustomThemeType, RecursivePartial } from "javascript/utils/theme/types/ThemeType"
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

export const variables: CustomThemeType['variables'] = {
  ListFolderIcon: true,
  Placeholders: {
    tall: {
      nonRetina: require('images/theme/programme-placeholder-tall.jpg'),
      retina: require('images/theme/programme-placeholder-tall-retina.jpg')
    }
  },
  BrandColor: '3E5F7D',
  ChartBgColor: '1A2430',
  ChartTextColor: 'ffffff'
}
export const CmsNavigation = []
export const Components: CustomThemeType['components'] = {}

export const catalogueLayout: RecursivePartial<TemplateTypes> = {
  templateA: {
    index: {
      loggedIn: [
        'banner',
        'videoCarousel',
        'contentBlocks',
        'programmeDetails',
        'formatProgrammes',
        'relatedProgrammes',
        'recentlyViewed',
      ],
      loggedOut: [
        'banner',
        'videoCarousel',
        'loginForm',
      ]
    },
    programmeDetails: {
      main: [
        'programmeHeading',
        'pdfAsset',
        'programmeTags',
        'programmeDescription',
        'activeSeries',
        'requestForAsset',
      ],
      side: [
        'booleanProgrammeTypes',
        'alternativeTitles',
        'catalogues',
        'genresParentOnly',
        'subGenres',
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
}

