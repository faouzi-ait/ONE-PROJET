import { CustomThemeType, RecursivePartial } from "javascript/utils/theme/types/ThemeType"
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

export const variables: CustomThemeType['variables'] = {
  BrandColor: 'DB1E34',
}
export const CmsNavigation = []
export const Components: CustomThemeType['components'] = {}

export const catalogueLayout: RecursivePartial<TemplateTypes> = {
  templateB: {
    index: {
      loggedIn: [
        'banner',
        'videoCarousel',
        'breadcrumbsPlain',
        'contentTabs',
        'contentBlocks',
        'formatProgrammes',
        'relatedProgrammes',
        'recentlyViewed',
      ],
      loggedOut: [
        'banner',
        'videoCarousel',
        'breadcrumbsPlain',
        'contentTabs',
        'recentlyViewed',
      ]
    },
  }
}

