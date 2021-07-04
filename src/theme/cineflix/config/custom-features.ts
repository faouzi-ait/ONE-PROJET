import { CustomThemeType, RecursivePartial } from "javascript/utils/theme/types/ThemeType"
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

export const variables: CustomThemeType['variables'] = {
  BrandColor: '89172b',
  BuyerTypes: {
    buyer: 'Content buyer',
    producer: 'Producer',
    dvd: 'DVD',
    inflight:' Inflight',
    other: 'Other'
  },
  ListFolderIcon: true
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
        'contentBlocks',
        'relatedProgrammes',
        'recentlyViewed',
      ]
    },
    programmeDetails: {
      main: [
        'pdfAsset',
        'programmeHeading',
        'programmeDescriptionWithTagline',
        'seriesAndEpisodeCount',
        'activeSeries',
        'marketingCreditLine',
        'requestForAsset',
      ],
      side: [
        'login',
        'productionInfoHeading',
        'booleanProgrammeTypes',
        'alternativeTitles',
        'genresParentFirst',
        'qualities',
        'languages',
        'nonBooleanProgrammeTypes',
        'productionCompanies',
        'programmeBroadcasters',
        'talents',
      ],
    },
  }
}


