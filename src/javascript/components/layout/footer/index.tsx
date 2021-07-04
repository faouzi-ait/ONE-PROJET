// React
import React from 'react'

// Stylesheets
import 'stylesheets/core/components/footer'

// Components
import NavLink from 'javascript/components/nav-link'
import ShareIcons from 'javascript/components/share-icons'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import { LiteFooterTagline } from './styled'
import withTheme from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import allClientVariables from './variables'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import { getKidsPage } from 'javascript/utils/helper-functions/get-kids-page'

import { isLiteClient } from 'javascript/utils/theme/liteClientName'

type Props = {
  theme: ThemeType
  menuItems: any[],
  clientVariables: any
}

const Footer: React.FC<Props> = ({
  theme,
  menuItems,
  clientVariables
}) => {

  const kids = getKidsPage(theme)

  const renderShareIcons = () => (
    <ShareIcons classes={['footer']} />
  )

  const renderLogo = () => {
    if (!clientVariables.logo) {
      return null
    }
    return (
      <ClientProps
        clientProps={{
          logo: {
            'banijaygroup': kids && require('images/theme/kids-logo.png'),
          },
        }}
        renderProp={(clientProps) => (
          <>
            {isLiteClient() && <LiteFooterTagline>Powered by</LiteFooterTagline>}
            {clientVariables.logoLink ? (
                <a target="_blank" className="brand" href={clientVariables.logoLink}>
                  <img src={clientVariables.logo} />
                </a>
              ) : (
                <NavLink to="/" className="brand">
                  <img
                    src={clientProps.logo || clientVariables.logo}
                    alt="Footer logo"
                    />
                </NavLink>
              )
            }
          </>
        )}
      />
    )
  }

  const renderNavigation = () => {
    if(menuItems.length > 0) {
      return (
        <nav className="footer__nav">
          <ul className="footer__list">

            {menuItems.map((menuItem) => (
              <li className="footer__item" key={menuItem.id}>
                <NavLink className="footer__link" to={`${menuItem.slug}`}>{menuItem.title}</NavLink>
                <ClientSpecific client="cineflix">
                  <span> | </span>
                </ClientSpecific>
              </li>
            ))}
          </ul>
        </nav>
      )
    }
  }

  const renderCopy = () => {
    const date = new Date()
    const footerCopy = theme.features.footerCopy && (typeof theme.features.footerCopy === 'string') && theme.features.footerCopy.replace('{{fullYear}}', date.getFullYear().toString())
    if(footerCopy) {
      return <p className="footer__copy" dangerouslySetInnerHTML={{__html: footerCopy}}></p>
    }
  }

  const renderTagline = () => {
    if(clientVariables.tagline) {
      return <p className="footer__logo-tagline">{clientVariables.tagline}</p>
    }
  }

  const renderBottomSection = () => {
    return (
      <div className="footer__bottom">
        {renderCopy()}
        {renderNavigation()}
      </div>
    )
  }

  const contentMap = {
    'shareIcons': renderShareIcons,
    'logo': renderLogo,
    'navigation': renderNavigation,
    'copy': renderCopy,
    'tagline': renderTagline,
    'bottom': renderBottomSection
  }

  const createContent = clientVariables.contentOrder.map((content) => {
    return contentMap[content]()
  })

  return (
    <footer role="contentinfo" className="footer">
      <div className="container">

        <ClientSpecific client="keshet">
          <a href="/about-ki" className="button button--filled">About KI</a>
        </ClientSpecific>

        {createContent}

      </div>
      <ClientSpecific client="itv">
        <div className="footer__foot">
          <p className="footer__foot-item">&copy;ITV Studios. All rights reserved.</p>
          <a className="footer__foot-item" href="/privacy-notices">Privacy Policy</a>
          <a className="footer__foot-item" href="/modern-slavery-statement" target="_blank">Modern Slavery Statement</a>
          <a className="footer__foot-item" href="/terms">Terms & Conditions</a>
          <a className="footer__foot-item" href="/producer-guidelines">Producer Guidelines</a>
          <a className="footer__foot-item" href="/sitemap" rel="nofollow">Sitemap</a>
        </div>
      </ClientSpecific>
    </footer>
  )
}

const enhance = compose(
  withTheme,
  withClientVariables('clientVariables', allClientVariables)
)

export default enhance(Footer)