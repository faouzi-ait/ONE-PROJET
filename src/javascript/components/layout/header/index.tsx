// React
import React, {useState, useEffect, useRef} from 'react'
import { withRouter } from 'react-router-dom'

import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import allClientVariables from './variables'

import { UserType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

// Stylesheets
import 'stylesheets/core/components/header'
import 'stylesheets/core/components/brand'

// Components
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import NavLink from 'javascript/components/nav-link'
import ProgrammeSearchSuggestions from 'javascript/components/programme-search-suggestions'
import TopNavigation from 'javascript/components/layout/top-navigation'
import ThemeConsumer from 'javascript/utils/theme/ThemeConsumer'
import ShareIcons from 'javascript/components/share-icons'
import MegaMenu from 'javascript/components/mega-menu'
import withHooks from 'javascript/utils/hoc/with-hooks'
import { useImpersonationState } from 'javascript/utils/hooks/use-impersonation-state'
import { getKidsPage } from 'javascript/utils/helper-functions/get-kids-page'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

interface PrivatePagesType {
  slug: string
}

export interface MenuItemsType {
  children: MenuItemsType[]
  id: string
  published: boolean
  slug: string
  title: string
}

type Props = {
  location: {
    pathname: string
    hostname: string
  }
  theme: ThemeType
  header: any
  newSession: any
  endSession: any
  navToggle: any
  menuToggle: any
  user: UserType
  history: any
  isCurrentlyImpersonating: boolean
  privatePages: PrivatePagesType[]
  featuredMenuItems: MenuItemsType[]
  megaMenuItems: MenuItemsType[]
}

const Header: React.FC<Props> = ({
  endSession,
  featuredMenuItems,
  header,
  history,
  isCurrentlyImpersonating,
  location,
  megaMenuItems,
  menuToggle,
  navToggle,
  newSession,
  privatePages,
  theme,
  user,
}) => {
  const [kids, setKids] = useState(false)
  const [searchIsOpen, setSearchIsOpen] = useState(false)
  const [sticky, setSticky] = useState(null)
  // @ts-ignore
  const [scrollPosition, setScrollPosition] = useState(0)
  const [stickyHide, setStickyHide] = useState(false)
  const searchButton = useRef(null)

  const headerCV = useClientVariables(allClientVariables, {
    menuButtonClasses: {
      'banijaygroup': `button button--icon ${kids && 'button--reversed'}`
    },
    searchButtonClasses: {
      'all3': `button button--icon ${searchIsOpen && 'button--search'}`,
      ' banijaygroup': `button button--icon ${kids && 'button--reversed'}`
    }
  })

  useEffect(() => {
    setKids(getKidsPage(theme))
  }, [theme.variables.KidsVersion])

  useEffect(() => {
    {headerCV.sticky &&
      window.addEventListener('scroll', stickyHeader, { passive: true })
    }
  }, [header])

  useEffect(() => {
    if(headerCV.stickyHide){
      setStickyHide(false)
    }
  }, [location])
   

  const stickyHeader = () => {
    const scrollTop = window.pageYOffset
    setSticky(scrollTop)

    if(headerCV.stickyHide && scrollTop >= 250){
      setScrollPosition((scrollPosition) => {
        setStickyHide(scrollTop > scrollPosition)
        setScrollPosition(scrollTop)
        return scrollTop
      })
    }
  }

  const renderUserControls = () => {
    if (!headerCV.showControlsOnSearch && searchIsOpen) return false
    if(theme.features.navigation.centeredNav){
      if(!user) {
        return (
          <span key={'user-controls'}>
            <Button test-id="login_button" onClick={newSession} className="button button--ghost">Login</Button>
          </span>
        )
      }
    } else {
      if (user) {
        return (
          <Button key={'user-controls'} onClick={endSession} className="text-button text-button--logout">Logout</Button>
        )
      } else {
        return (
          <ClientChoice>
          <ClientSpecific client="default">
          <span key={'user-controls'}>
            <NavLink to="/register" className="text-button">Register</NavLink>
            <Button test-id="login_button" onClick={newSession} className="text-button">Login</Button>
          </span>
          </ClientSpecific>
          <ClientSpecific client="ae">
            <NavLink to="/register" className="text-button">
              <Icon id="i-register" classes="button__icon" />
              Register
            </NavLink>
            <button test-id="login_button" onClick={newSession} className="text-button">
              <Icon id="i-user" width="26" height="26" classes="button__icon" />
              Login
            </button>
          </ClientSpecific>
        </ClientChoice>
        )
      }
    }
  }

  const renderWelcomeMessage = () => {
    if (user) {
      if (!searchIsOpen) {
        if(theme.features.navigation.centeredNav){
          return (
            <NavLink key={'welcome-msg'} to={`${theme.variables.SystemPages.account.path}`} className="text-button">
              {theme.variables.SystemPages.account.upper}
            </NavLink>
          )
        } else {
          return (
            <ClientChoice>
              <ClientSpecific client="default">
                <p key={'welcome-msg'} className="header__welcome">
                  Welcome back, <NavLink to={`/${theme.variables.SystemPages.account.path}`} className="header__user">{user['first-name']}</NavLink>
                </p>
              </ClientSpecific>
              <ClientSpecific client="ae">
                <NavLink to={`/${theme.variables.SystemPages.account.path}`} className="text-button text-button--acount">
                  <span className="button__count">{user['first-name']?.substr(0,1)}{user['last-name']?.substr(0,1)}</span>
                  {user['first-name']}
                </NavLink>
              </ClientSpecific>
            </ClientChoice>
          )
        }
      }
    }
  }

  const renderCatalogueLink = () => {
    if (!searchIsOpen) {
      return (
        <NavLink key={'catalogue-link'} className="text-button" to={`/${theme.variables.SystemPages.catalogue.path}`}>
          {theme.variables.SystemPages.catalogue.upper}
        </NavLink>
      )
    }
  }

  const renderListsLink = () => {
    if (user && !searchIsOpen) {
      return (
        <NavLink key={'lists-link'} class="text-button" to={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}`}>
          <ClientSpecific client="ae">
            <Icon id="i-lists" classes="button__icon" />
          </ClientSpecific>
          {theme.variables.SystemPages.list.upper}
        </NavLink>
      )
    }
  }

  const renderExternalLink = () => {
    if (!searchIsOpen) {
      return (
        <a href={`${headerCV.externalLink.url}`} className="button button--filled" target="_blank">
          {headerCV.externalLink.text}
        </a>
      )
    }
  }

  const renderSearchControls = () => {
    //if catalogue is set to private and the user is logged out, don't show this
    const cataloguePageIsPrivate = !!privatePages.find((pg) => pg.slug === theme.variables.SystemPages.catalogue.path)
    if (theme.features.pages.private && cataloguePageIsPrivate && !user) {
      return null
    }

    return (
      <Button key={'search-controls'} onClick={searchToggle} className={headerCV.searchButtonClasses} ref={searchButton}>
        {searchIsOpen ? (
          <Icon id="i-close" classes="button__icon" />
        ) : (
            <Icon id="i-mag" classes="button__icon" />
          )}
        <span>Search</span>
      </Button>
    )
  }

  const renderNavigation = () => {
    return (
      <Button key={'navigation'} test-id="menu_toggle" onClick={navToggle} className={headerCV.menuButtonClasses}>
        <ClientChoice>
          <ClientSpecific client="default">
            <Icon id="i-hamburger" classes="button__icon" />
          </ClientSpecific>
          <ClientSpecific client ="amc | all3 | drg">
            <span className="burger__line"></span>
            <span className="burger__line"></span>
            <span className="burger__line"></span>
          </ClientSpecific>
        </ClientChoice>
        Menu
      </Button>
    )
  }

  const renderMegaMenu = () => {
    if(!theme.features.navigation.megaNav || megaMenuItems.length === 0 || searchIsOpen) {
      return false
    }
    return (
      <nav role="navigation" className="mega-menu" key={'megaMenu'}>
        <Button className="text-button" type="button" onClick={menuToggle}>
          <ClientSpecific client="ae">
            <Icon id="i-browse" width="32" height="31" viewBox="0 0 32 31" classes="button__icon" />
          </ClientSpecific>
          Browse
        </Button>
        <MegaMenu menuItems={megaMenuItems} menuToggle={menuToggle} />
      </nav>
    )
  }

  const renderSearch = () => {
    if(searchIsOpen) {
      return (
        // @ts-ignore
        <ProgrammeSearchSuggestions
          key={'search'}
          onSubmit={search}
          modifiers={['global']}
          focusOnMount={true}
          onSuggestionSelected={(e, p) => {
            history.push(`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(p.suggestion.programme, theme)}`)}
          }
        />
      )
    }
   }

   const searchToggle = () => {
     if(searchIsOpen){
      searchButton.current.blur()
     }
     setSearchIsOpen(!searchIsOpen)
   }

  const renderLogo = () => {
    return (
      <NavLink exact to="/" className="brand">
        <ThemeConsumer>
          {(theme) => {
            if (headerCV.hideLogoImage) {
              return null
            }
            if (kids && headerCV.kidsLogoImage) {
              return <img src={headerCV.kidsLogoImage} />
            }
            return (
              <img src={theme.customer?.logoImageUrls?.default || headerCV.backupLogo} className="header__logo"></img>
            )
          }}
        </ThemeConsumer>
        <ClientSpecific client="cineflix">
          <Icon id="i-logo" width="245" height="69" viewBox="0 0 207 58" classes="header__logo" />
        </ClientSpecific>
        <ClientSpecific client ="storylab">
          <Icon id="i-logo" width="206" height="53" viewBox="0 0 206 53" classes="header__logo" />
        </ClientSpecific>
      </NavLink>
    )
  }

  const search = (query) => {
    if (query['filter[search]'] === '') {
      return
    }
    searchToggle()
    const params = Object.keys(query).map(key => key + '=' + encodeURI(query[key])).join('&')
    history.push(`/${theme.variables.SystemPages.catalogue.path}?${params}`)
  }

  const renderShareIcons = () => {
    return (
      <ShareIcons classes={['header']} />
    )
  }

  const renderTopNavigation = () => {
    if(!theme.features.navigation.centeredNav || featuredMenuItems.length === 0) {
      return false
    }
    return (
      <TopNavigation key={'top-navigation'} menuItems={featuredMenuItems} />
    )
  }

  const contentMap = {
    'welcomeMessage': renderWelcomeMessage,
    'catalogueLink': renderCatalogueLink,
    'userControls': renderUserControls,
    'searchOpenUserControls': !searchIsOpen ? renderUserControls : () => {},
    'searchBar': renderSearch,
    'searchControls': renderSearchControls,
    'navigation': renderNavigation,
    'externalLink': renderExternalLink,
    'listsLink': renderListsLink,
    'logo': renderLogo,
    'shareIcons': renderShareIcons,
    'topNavigation': renderTopNavigation,
    'megaMenu': renderMegaMenu
  }

  const createContent = (content) => content.map((content) => {
    return contentMap[content]()
  })

  const meetingsUrl = `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}`

  return (
    <ClientProps
      clientProps={{
        headerClasses: {
          'default': ['header', searchIsOpen && 'header--searching', location.pathname === meetingsUrl && 'header--meetings', stickyHide && 'header--hide', sticky && 'header--sticky', isCurrentlyImpersonating && 'header--impersonating'].filter(x => x).join(' '),
          'banijaygroup': ['header', kids && 'header--kids', searchIsOpen && 'header--searching', location.pathname === meetingsUrl && 'header--meetings', isCurrentlyImpersonating && 'header--impersonating'].filter(x => x).join(' ')
        },
      }}
      renderProp={(clientProps) => (
        <header role="banner" className={clientProps.headerClasses}>
        <div className="container">
          {createContent(headerCV.contentLeft)}
          <div className="header__controls">
            {createContent(headerCV.contentRight)}
          </div>
        </div>
      </header>
      )}
    />
  )
}

const enhance = compose(
  withRouter,
  withTheme,
  withHooks(() => {
    const { status } = useImpersonationState()
    return {
      isCurrentlyImpersonating: status === 'impersonating',
    }
  })
)

export default enhance(Header)
