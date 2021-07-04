import { createGlobalStyle } from 'styled-components'

import { autoCueStyles } from 'javascript/components/autocue-modal'
import { buttonStyles } from 'javascript/components/button'
import { notificationStyles } from 'javascript/components/notification'
import { sharerStyles } from 'javascript/components/sharer'
import { tagStyles } from 'javascript/components/tags'
import accountManagerStyles from 'javascript/components/account-manager/accountManagerStyles'
import accountNavigation from 'javascript/components/account-navigation/accountNavigationStyles'
import bannerStyles from 'javascript/components/banner/bannerStyles'
import blockStyles from 'javascript/views/blocks/blockStyles'
import block_pressStyles from 'javascript/views/blocks/_press/_pressStyles'
import block_videoStyles from 'javascript/views/blocks/_video/_videoStyles'
import cardStyles from 'javascript/components/card/cardStyles'
import carouselStyles from 'javascript/components/carousel/carouselStyles'
import footerStyles from 'javascript/components/layout/footer/footerStyles'
import formStyles from 'javascript/components/form/formStyles'
import galleryStyles from 'javascript/components/gallery/galleryStyles'
import headerStyles from 'javascript/components/layout/header/headerStyles'
import modalStyles from 'javascript/components/modal/modalStyles'
import megaMenuStyles from 'javascript/components/mega-menu/megaMenuStyles'
import navigationStyles from 'javascript/components/layout/navigation/navigationStyles'
import pageLoaderStyles from 'javascript/components/page-loader/pageLoaderStyles'
import showHideStyles from 'javascript/components/show-hide/showHideStyles'
import tabStyles from 'javascript/components/tabs/tabStyles'
import typographyStyles from 'javascript/components/typography/typographyStyles'

const GlobalStyle = createGlobalStyle`
  /**
   * Anything inside #app is given extra priority over
   * existing sass files
   */
  #app,
  #app .app,
  #admin .mock-page {
    ${autoCueStyles}
    ${accountManagerStyles}
    ${accountNavigation}
    ${bannerStyles}
    ${blockStyles}
    ${block_pressStyles}
    ${block_videoStyles}
    ${buttonStyles}
    ${cardStyles}
    ${carouselStyles}
    ${footerStyles}
    ${formStyles}
    ${galleryStyles}
    ${headerStyles}
    ${modalStyles}
    ${megaMenuStyles}
    ${navigationStyles}
    ${notificationStyles}
    ${pageLoaderStyles}
    ${sharerStyles}
    ${showHideStyles}
    ${tabStyles}
    ${tagStyles}
  }
  ${typographyStyles}
`

export default GlobalStyle
