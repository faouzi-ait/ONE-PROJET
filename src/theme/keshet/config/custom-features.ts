import { CustomThemeType, RecursivePartial } from "javascript/utils/theme/types/ThemeType"
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

export const variables: CustomThemeType['variables'] = {
  BrandColor: '52347d',
}

export const CmsNavigation = []
export const Components: CustomThemeType['components'] = {}

export const catalogueLayout: RecursivePartial<TemplateTypes> = {
  templateA: {
    index: {
      loggedOut: [
        'banner',
        'videoCarousel',
        'breadcrumbsPlain',
        'programmeDetails',
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
    },
  }
}

