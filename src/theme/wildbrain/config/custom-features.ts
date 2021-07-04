import { CustomThemeType, RecursivePartial } from "javascript/utils/theme/types/ThemeType"
import { TemplateTypes } from 'javascript/types/CatalogueTemplates'

export const variables: CustomThemeType['variables'] = {
  BrandColor: '4EC3E0',
  ListFolderIcon: true
}

export const CmsNavigation = []
export const Components: CustomThemeType['components'] = {
}

export const catalogueLayout: RecursivePartial<TemplateTypes>  = {
  templateA: {
    programmeDetails: {
      side: [
        'productionInfoHeading',
        'booleanProgrammeTypes',
        'alternativeTitles',
        'genresChildWithParent',
        'programmeType',
        'qualities',
        'languages',
        'productionYears',
        'nonBooleanProgrammeTypes',
        'talents',
        'login',
      ],
    },
  }
}

