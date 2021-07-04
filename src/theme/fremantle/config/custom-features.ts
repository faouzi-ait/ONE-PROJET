import { CustomThemeType, RecursivePartial } from "javascript/utils/theme/types/ThemeType"
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

export const variables: CustomThemeType['variables'] = {
  ChartBgColor: '202222',
  ChartTextColor: 'ffffff',
  BrandColor: 'E5193A'
}
export const CmsNavigation = []
export const Components: CustomThemeType['components'] = {
  forms: {
    titleOptions: [{
      value: 'Dr',
      label: 'Dr',
    },{
      value: 'Mr',
      label: 'Mr',
    }, {
      value: 'Mrs',
      label: 'Mrs',
    }, {
      value: 'Miss',
      label: 'Miss',
    }, {
      value: 'Ms',
      label: 'Ms',
    }]
  },
}


export const catalogueLayout: RecursivePartial<TemplateTypes> = {
  templateB: {
    programmeDetails: {
      main: [
        'programmeDescription',
        'pdfAsset',
        'activeSeries',
      ],
      side: [
        'genresParentFirst',
        'seriesCount',
        'qualities',
        'languages',
        'productionCompanies',
        'programmeBroadcasters',
        'nonBooleanProgrammeTypes',
        'productionStartYear'
      ],
    },
    contentTabs: {
      loggedIn: [{
          'videoCarousel': 'Watch',
        }, {
          'programmeDetails':'Info',
        }, {
          'myAssets': 'Assets'
        }
      ],
      loggedOut: [
        {
          'loggedOutVideoCarousel': 'Watch',
        }, {
          'programmeDetails':'Info',
        }, {
          'myAssets': 'Assets'
        }
      ]
    },
  }
}

