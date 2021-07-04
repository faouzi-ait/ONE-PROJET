import { CustomThemeType, RecursivePartial } from "javascript/utils/theme/types/ThemeType"
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

export const variables: CustomThemeType['variables'] = {
  BrandColor: 'FF4370',
  KidsVersion: true,
  ListFolderIcon: true,
  Placeholders: {
    tall: {
      nonRetina: require('images/theme/programme-placeholder-tall.jpg'),
      retina: require('images/theme/programme-placeholder-tall-retina.jpg')
    }
  }
}
export const CmsNavigation = []
export const Components: CustomThemeType['components'] = {}


export const catalogueLayout: RecursivePartial<TemplateTypes> = {
  templateA: {
    index: {
      loggedIn: [
        'banner',
        'videoCarousel',
        'breadcrumbsPlain',
        'programmeDetails',
        'contentBlocks',
        'relatedProgrammes',
        'recentlyViewed',
      ],
    },
    programmeDetails: {
      main: [
        'pdfAsset',
        'programmeHeading',
        'programmeDescription',
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
        'productionYearsRange',
        'nonBooleanProgrammeTypes',
        'productionCompanies',
        'programmeBroadcasters',
        'talents',
        'login',
      ],
    },
  }
}

