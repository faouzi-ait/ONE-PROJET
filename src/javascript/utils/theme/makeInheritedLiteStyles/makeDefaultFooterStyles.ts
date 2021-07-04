import { FooterType } from 'javascript/utils/theme/types/ApiStylesType'
import { MakeDefaultStyles } from '../types/styles/MakeDefaultStyles'
import { darken } from 'polished'

const makeDefaultFooterStyles: MakeDefaultStyles<FooterType> = ({
  colors,
  typography,
}) => ({
  bgColor: '#2a2f2f',
  borderColor: colors.brand,
  borderWidth: 0,
  copyColor: '#fff',
  copyFontSize: 12,
  linksColor: colors.brand,
  linksColorHover: darken(0.1, colors.brand),
  logoUrl: false
})

export default makeDefaultFooterStyles
