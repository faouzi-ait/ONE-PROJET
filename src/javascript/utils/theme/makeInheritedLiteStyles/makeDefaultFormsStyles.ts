import { FormType } from 'javascript/utils/theme/types/ApiStylesType'
import { MakeDefaultStyles } from '../types/styles/MakeDefaultStyles'

const makeDefaultFormsStyles: MakeDefaultStyles<FormType> = ({
  colors,
  typography,
}) => ({
  /* Label */
  labelFontSize: typography.bodyFontSize - 2,
  labelUppercase: typography.bodyUppercase,
  labelColor: typography.bodyColor,
  /* Input */
  inputFontSize: typography.bodyFontSize,
  inputUppercase: typography.bodyUppercase,
  inputColor: typography.bodyColor,
  inputBgColor: colors.background,
  inputRadius: 0,
  inputBorderColor: colors.shaded,
  inputBorderWidth: 2,
  /* Select */
  selectArrowColor: colors.brand,
})

export default makeDefaultFormsStyles
