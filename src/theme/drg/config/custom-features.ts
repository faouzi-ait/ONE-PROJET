import { CustomThemeType, RecursivePartial } from "javascript/utils/theme/types/ThemeType"
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

export const variables: CustomThemeType['variables'] = {
  BrandColor: '00aeff',
  ChartBgColor: 'ffffff',
  ChartTextColor: '383c4b'
}

export const CmsNavigation = []

export const Components: CustomThemeType['components'] = {
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
        'loggedOutProgrammeDetails',
        'recentlyViewed',
      ]
    },
    programmeDetails: {
      main: [
        'pdfAsset',
        'programmeHeading',
        'programmeDescriptionWithSubHeading',
        'seriesAndEpisodeCount',
        'activeSeries',
        'requestForAsset',
      ],
      side: [
        'productionInfoHeading',
        'alternativeTitles',
        'genresParentAndChild',
        'qualities',
        'programmeType',
        'languages',
        'productionYears',
        'customAttributes',
        'productionCompanies',
        'programmeBroadcasters',
        'talents',
        'login',
      ],
    }
  }
}


