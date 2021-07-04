import { HeaderType } from 'javascript/utils/theme/types/ApiStylesType'
import { MakeDefaultStyles } from '../types/styles/MakeDefaultStyles'
import { darken } from 'polished'

const makeDefaultHeaderStyles: MakeDefaultStyles<HeaderType> = ({
  colors,
  typography,
}) => ({
  bgColor: colors.background,
  borderColor: colors.brand,
  borderWidth: 0,
  copyColor: '#FFFFFF',
  iconColor: colors.brand,
  iconColorHover: darken(0.1, colors.brand),
  linksColor: colors.brand,
  linksColorHover: darken(0.1, colors.brand),
  logoUrl: undefined,
  shadowType: 'none',
  shadowColor: '#000000',
})

export default makeDefaultHeaderStyles
