import { MakeDefaultStyles } from '../types/styles/MakeDefaultStyles'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import defaultColors from './defaultColors'
import defaultTypographyStyles from './defaultTypographyStyles'
import makeDefaultBannerStyles from './makeDefaultBannerStyles'
import makeDefaultButtonStyles from './makeDefaultButtonStyles'
import makeDefaultCardsStyles from './makeDefaultCardsStyles'
import makeDefaultFooterStyles from './makeDefaultFooterStyles'
import makeDefaultFormsStyles from './makeDefaultFormsStyles'
import makeDefaultHeaderStyles from './makeDefaultHeaderStyles'
import makeDefaultModalsStyles from './makeDefaultModalsStyles'
import makeDefaultTabsStyles from './makeDefaultTabsStyles'
import makeDefaultTagsStyles from './makeDefaultTagsStyles'
import makeNavStyles from './makeDefaultNavigationStyles'

const makeInheritedLiteStyles: MakeDefaultStyles<ThemeType['styles']> = ({
  colors,
  typography,
}) => {
  const makeStylesParams = {
    typography,
    colors,
  }
  return {
    colors,
    typography,
    header: makeDefaultHeaderStyles(makeStylesParams),
    background: {
      color: 'cornflowerblue',
    },
    navigation: makeNavStyles(makeStylesParams),
    // Default Styles Below..
    banners: makeDefaultBannerStyles(makeStylesParams),
    buttons: makeDefaultButtonStyles(makeStylesParams),
    cards: makeDefaultCardsStyles(makeStylesParams),
    footer: makeDefaultFooterStyles(makeStylesParams),
    forms: makeDefaultFormsStyles(makeStylesParams),
    modals: makeDefaultModalsStyles(makeStylesParams),
    tabs: makeDefaultTabsStyles(makeStylesParams),
    tags: makeDefaultTagsStyles(makeStylesParams),
  }
}

export default makeInheritedLiteStyles

export const defaultLiteStyles = makeInheritedLiteStyles({
  colors: defaultColors,
  typography: defaultTypographyStyles,
})
