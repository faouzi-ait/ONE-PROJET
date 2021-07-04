import { ProgrammeType } from 'javascript/types/ModelTypes'
import { ThemeType, CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

const getProgrammePath = (programme: ProgrammeType, theme: ThemeType | CustomThemeType) => {
  let programmePath = programme.id
  if(theme?.features.programmeSlugs.enabled) {
    programmePath = programme.slug
  }
  return programmePath
}

export default getProgrammePath