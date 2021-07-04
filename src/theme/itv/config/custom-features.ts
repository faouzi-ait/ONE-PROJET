import { CustomThemeType, RecursivePartial } from "javascript/utils/theme/types/ThemeType"
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

export const variables: CustomThemeType['variables'] = {
  BrandColor: '19BEC8',
  BuyerTypes: {
    buyer: 'Buyer',
    producer: 'Producer',
    marketing: 'Marketing',
    publisher: 'Publisher',
    licensee: 'Licensee',
    other: 'Other'
  },
  FlightCarriers: {
    'AF': 'Air France',
    'BA': 'British Airways',
    'U2': 'Easy Jet',
    '7S': 'Ryan Air',
  },
  DropOffLocations: {
    outbound: ['ITV Accomodation', 'Hotel'],
    inbound: ['Airport']
  },
  ProducerHubDisclaimer: `Information accessed on the ITV Producer Hub does not constitute an official financial report. All data contained in the ITV Producer Hub is by its nature dynamic, subject to
    revision, correction and deletion, and is made available to you for information purposes only. Information and data contained in the ITV Producer Hub must not be relied upon
    and ITV accepts no liability for any such reliance. ITV does not represent that licence information on the ITV Producer Hub gives a complete picture of all licence activity relating
    to a production, or that licences are correctly attributed to the production. ITV gives no representation as to the accuracy or completeness of any information on the ITV
    Producer Hub. Inclusion of financial information on the ITV Producer Hub does not indicate payment is or will become due. Please refer to your distribution reports for details of
    confirmed licences and a detailed financial breakdown.`,
  ChartBgColor: '38394D',
  ChartTextColor: 'EDEDED',
  ListFolderIcon: true
}
export const CmsNavigation = []
export const Components: CustomThemeType['components'] = {}

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
        'videoCarousel',
        'loggedOutProgrammeDetails'
      ]
    },
    programmeDetails: {
      side: [
        'productionInfoHeading',
        'booleanProgrammeTypes',
        'alternativeTitles',
        'genresAlphabetical',
        'qualities',
        'programmeType',
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

