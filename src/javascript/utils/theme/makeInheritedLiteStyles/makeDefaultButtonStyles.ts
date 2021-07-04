import { ButtonType } from 'javascript/utils/theme/types/ApiStylesType'
import { MakeDefaultStyles } from '../types/styles/MakeDefaultStyles'
import { darken } from 'polished'

const makeDefaultButtonStyles: MakeDefaultStyles<ButtonType> = ({
  colors,
  typography,
}) => ({
  /** Primary */
  primaryUppercase: typography.bodyUppercase,
  primaryFontFamily: typography.bodyFontFamily,
  primaryFontSize: typography.bodyFontSize,
  primaryFontWeight: typography.bodyFontWeight,
  primaryBorderWidth: 2,
  primaryColor: '#ffffff',
  primaryColorHover: '#ffffff',
  primaryRadius: 4,
  primaryShadowColor: '#000000',
  primaryShadowColorHover: '#000000',
  primaryShadowType: 'none',
  primaryShadowTypeHover: 'none',
  primaryBgColor: colors.brand,
  primaryBgColorHover: darken(0.1, colors.brand),
  primaryBorderColor: colors.brand,
  primaryBorderColorHover: darken(0.1, colors.brand),
  /** Secondary */
  secondaryUppercase: typography.bodyUppercase,
  secondaryFontFamily: typography.bodyFontFamily,
  secondaryFontSize: typography.bodyFontSize,
  secondaryFontWeight: typography.bodyFontWeight,
  secondaryColor: typography.bodyColor,
  secondaryColorHover: '#ffffff',
  secondaryBorderWidth: 2,
  secondaryRadius: 4,
  secondaryShadowColor: '#000000',
  secondaryShadowColorHover: '#000000',
  secondaryShadowType: 'none',
  secondaryShadowTypeHover: 'none',
  secondaryBgColor: 'transparent',
  secondaryBgColorHover: colors.brand,
  secondaryBorderColor: colors.brand,
  secondaryBorderColorHover: colors.brand,

  iconBgColor: colors.brand,
  iconBgColorHover: darken(0.1, colors.brand),
  iconColor: '#fff',
  iconColorHover: '#fff',
  iconShadowColor: '#000000',
  iconShadowColorHover: '#000000',
  iconShadowType: 'none',
  iconShadowTypeHover: 'none',
  iconRadius: 0
})

export default makeDefaultButtonStyles
