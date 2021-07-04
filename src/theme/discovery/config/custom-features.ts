import { CustomThemeType, RecursivePartial } from "javascript/utils/theme/types/ThemeType"
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

export const variables: CustomThemeType['variables'] = {
  ListFolderIcon: true
}
export const CmsNavigation = []
export const Components: CustomThemeType['components'] = {}

export const catalogueLayout: RecursivePartial<TemplateTypes> = {
  templateA: {
    index: {
      loggedIn: [
        'banner',
        'breadcrumbsPlain',
        'pdfAsset',
        'programmeDetails',
        'videoCarousel',
        'contentBlocks',
        'formatProgrammes',
        'relatedProgrammes',
        'recentlyViewed',
      ],
      loggedOut: [
        'banner',
        'breadcrumbsPlain',
        'loggedOutProgrammeDetails',
        'videoCarousel',
        'recentlyViewed',
      ]
    },
    programmeDetails: {
      main: [
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
        'genresParentOnly',
        'subGenres',
        'programmeType',
        'qualities',
        'languages',
        'productionYears',
        'nonBooleanProgrammeTypes',
        'talents',
        'login',
      ],
    }
  }
}