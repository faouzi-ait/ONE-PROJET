import { TagType } from 'javascript/utils/theme/types/ApiStylesType'
import { MakeDefaultStyles } from '../types/styles/MakeDefaultStyles'

const makeDefaultTagsStyles: MakeDefaultStyles<TagType> = ({
  colors,
  typography,
}) => ({
  fontFamily: typography.bodyFontFamily,
  fontWeight: typography.bodyFontWeight,
  uppercase: typography.bodyUppercase,
  fontSize: typography.bodyFontSize - 2,
  color: colors.brand,
  colorHover: '#ffffff',
  bgColor: '#ffffff',
  bgColorHover: colors.brand,
  radius: 0,
  borderColor: colors.brand,
  borderWidth: 1,
  borderColorHover: colors.brand,
})

export default makeDefaultTagsStyles
