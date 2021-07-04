import { CustomThemeType, RecursivePartial } from "javascript/utils/theme/types/ThemeType"
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

export const variables: CustomThemeType['variables'] = {
  BrandColor: 'F6A200',
  ChartTextColor: '040203'
}
export const CmsNavigation = []
export const Components: CustomThemeType['components'] = {
  addToList: {
    carousel: {
      xlarge: {
        slidesToShow: 4
      },
      large: {
        dots: false
      }
    }
  }
}

export const catalogueLayout: RecursivePartial<TemplateTypes> = {
  templateA: {
    index: {
      loggedIn: [
        'banner',
        'videoCarousel',
        'breadcrumbs',
        'programmeDetails',
        'contentBlocks',
        'formatProgrammes',
        'relatedProgrammes',
        'recentlyViewed',
      ],
      loggedOut: [
        'banner',
        'videoCarousel',
        'breadcrumbs',
        'programmeDetails',
        'contentBlocks',
        'relatedProgrammes',
        'recentlyViewed'
      ]
    },
    programmeDetails: {
      side: [
        'productionInfoHeading',
        'booleanProgrammeTypes',
        'alternativeTitles',
        'genres',
        'productionCompanies',
        'programmeBroadcasters',
        'qualities',
        'languages',
        'nonBooleanProgrammeTypes',
        'talents',
        'login',
      ],
    },
  }
}

