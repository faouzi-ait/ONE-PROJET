import { BannerType } from 'javascript/utils/theme/types/ApiStylesType'
import { MakeDefaultStyles } from '../types/styles/MakeDefaultStyles'

const makeDefaultBannerStyles: MakeDefaultStyles<BannerType> = ({
  colors,
  typography,
}) => ({
  headingsFontSize: typography.headingsFontSize * 2,
  headingsColor: '#ffffff',
  copyFontSize: typography.bodyFontSize + 4,
  copyColor: '#ffffff',
  overlayColor: '#000000',
  overlayOpacity: 40,
})

export default makeDefaultBannerStyles
