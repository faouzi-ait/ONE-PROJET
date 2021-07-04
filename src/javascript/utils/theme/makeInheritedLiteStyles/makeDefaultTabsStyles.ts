import { TabType } from 'javascript/utils/theme/types/ApiStylesType'
import { MakeDefaultStyles } from '../types/styles/MakeDefaultStyles'

const makeDefaultTabsStyles: MakeDefaultStyles<TabType> = ({
  colors,
  typography,
}) => ({
  fontFamily: typography.bodyFontFamily,
  fontWeight: typography.bodyFontWeight,
  uppercase: typography.bodyUppercase,
  fontSize: typography.bodyFontSize + 2,
  color: colors.brand,
  colorActive: '#ffffff',
  bgColor: '#ffffff',
  bgColorActive: colors.brand,
  radius: 0,
  borderColor: colors.brand,
  borderWidth: 2,
  borderColorActive: colors.brand,
})

export default makeDefaultTabsStyles
