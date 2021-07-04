import { CardType } from 'javascript/utils/theme/types/ApiStylesType'
import { MakeDefaultStyles } from '../types/styles/MakeDefaultStyles'

const makeDefaultCardsStyles: MakeDefaultStyles<CardType> = ({
  colors,
  typography,
}) => ({
  bgColor: colors.background,
  borderColor: colors.background,
  borderWidth: 0,
  radius: 0,
  shadowColor: 'black',
  shadowColorHover: 'black',
  shadowType: 'none',
  shadowTypeHover: 'none',
  headingsColor: typography.headingsColor,
  headingsFontFamily: typography.headingsFontFamily,
  headingsFontSize: typography.headingsFontSize - 4,
  headingsFontWeight: typography.headingsFontWeight,
  headingsLineHeight: typography.headingsLineHeight,
  headingsUppercase: typography.headingsUppercase
})

export default makeDefaultCardsStyles
