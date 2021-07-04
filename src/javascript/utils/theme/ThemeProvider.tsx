import React, { useEffect } from 'react'
import deepmerge from 'deepmerge-concat'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'

import {
  BuyerTypes,
  DropOffLocations,
  Features,
  FlightCarriers,
  IgnoredAttrs,
  Localisation,
  ReadOnlyAttrs,
  Components,
  ChartBgColor,
  ChartTextColor,
  ProducerHubDisclaimer,
  KidsVersion,
  Brands,
  BrandColor,
  ListFolderIcon,
  Placeholders
} from 'javascript/config/features'
import useReduxState from 'javascript/utils//hooks/use-redux-state'
import { ThemeType, CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import { safeLocalStorage } from '../safeLocalStorage'
import makeInheritedLiteStyles, { defaultLiteStyles } from 'javascript/utils/theme/makeInheritedLiteStyles'
import getTheme from 'javascript/utils/theme/getTheme'
import loadFonts from 'javascript/utils/theme/loadFonts'
import { scrubNullValuesFromStyles } from '../helper-functions/scrubNullValuesFromStyles'
import { clientName } from 'javascript/utils/theme/liteClientName'
import { isLiteClient } from 'javascript/utils/theme/liteClientName'
import useFeAvailableState from 'javascript/utils/hooks/use-fe-available-state'

export const defaultTheme: ThemeType = {
  features: Features,
  localisation: Localisation,
  variables: {
    BuyerTypes,
    DropOffLocations,
    FlightCarriers,
    IgnoredAttrs,
    ReadOnlyAttrs,
    ChartBgColor,
    ChartTextColor,
    ProducerHubDisclaimer,
    KidsVersion,
    Brands,
    BrandColor,
    ListFolderIcon,
    Placeholders,
    SystemPages: {
      account: {
        id: null,
        upper: `My Account`,
        lower: `my account`,
        path: `my-account`
      },
      anonymousAccess: {
        id: null,
        path: 'anonymous-access',
        upper: 'Anonymous Access',
        lower: 'anonymous access',
      },
      approvals: {
        id: null,
        upper: 'Approvals',
        lower: 'approvals',
        path: 'approvals',
      },
      catalogue: {
        id: null,
        upper: 'Catalogue',
        lower: 'catalogue',
        path: 'catalogue',
      },
      dashboard: {
        id: null,
        upper: 'Dashboard',
        lower: 'dashboard',
        path: 'dashboard',
      },
      events: {
        id: null,
        upper: 'Events',
        lower: 'events',
        path: 'events',
      },
      home: {
        id: null,
        upper: 'Home',
        lower: 'home',
        path: ''
      },
      forgottenPassword: {
        id: null,
        upper: 'Forgotten Password',
        lower: 'forgotten password',
        path: 'forgotten-password',
      },
      list: {
        id: null,
        upper: 'List',
        lower: 'list',
        path: 'lists',
      },
      login: {
        id: null,
        upper: 'Login',
        lower: `login`,
        path: `login`
      },
      meeting: {
        id: null,
        upper: 'Meeting',
        lower: 'meeting',
        path: 'meetings',
      },
      myAssets: {
        id: null,
        upper: 'My Assets',
        lower: 'my assets',
        path: 'my-assets',
      },
      myProgrammes: {
        id: null,
        upper: `My Programmes`,
        lower: `my programmes`,
        path: `my-programmes`
      },
      news: {
        id: null,
        upper: 'News',
        lower: 'news',
        path: 'news-beta',
      },
      privateVideoAccess: {
        id: null,
        upper: 'Private Video Access',
        lower: 'private video access',
        path: 'private-video-access',
      },
      producerHub: {
        id: null,
        upper: 'Producer Hub',
        lower: 'producer hub',
        path: 'producer-hub',
      },
      profile: {
        id: null,
        upper: 'Profile',
        lower: 'profile',
        path: 'profile',
      },
      register: {
        id: null,
        upper: 'Register',
        lower: 'register',
        path: `register`
      },
      reporting: {
        id: null,
        upper: 'Reporting',
        lower: 'reporting',
        path: 'reporting',
      },
      resetPassword: {
        id: null,
        upper: 'Reset Password',
        lower: 'reset password',
        path: 'reset-password',
      },
      sitemap: {
        id: null,
        upper: 'Sitemap',
        lower: 'sitemap',
        path: 'sitemap',
      },
      team: {
        id: null,
        upper: 'Team',
        lower: 'team',
        path: 'teams',
      },
    }
  },
  customer: {},
  styles: defaultLiteStyles,
  components: Components
}

/** Ensure that arrays are overwritten, not concatenated, during merge */
const overwriteArrayMerge = (_: unknown, sourceArray: any[]) => sourceArray

const deepmergeOptions = {
  arrayMerge: overwriteArrayMerge,
}


const mergeThemes = (
  oldTheme: ThemeType,
  newTheme: CustomThemeType,
): ThemeType => {
  //@ts-ignore
  const mergedTheme: ThemeType = deepmerge(oldTheme, newTheme, deepmergeOptions)

  const inheritedStylesWithoutOverrides = makeInheritedLiteStyles({
    colors: mergedTheme.styles.colors,
    typography: mergedTheme.styles.typography,
  })

  let inheritedStylesWithOverrides: ThemeType['styles']

  if (newTheme.styles) {
    // @ts-ignore
    inheritedStylesWithOverrides = deepmerge(
      inheritedStylesWithoutOverrides,
      scrubNullValuesFromStyles(newTheme.styles),
      deepmergeOptions,
    )
  } else {
    inheritedStylesWithOverrides = inheritedStylesWithoutOverrides
  }

  return {
    ...mergedTheme,
    styles: inheritedStylesWithOverrides,
  }
}

export const getLocalStorageKeyForTheme: (clientName: string) => string = (clientName) => {
  return `${clientName.toUpperCase()}_THEME_LOCALSTORAGE_KEY`
}

export const ThemeContext = React.createContext<ThemeType>(null)

/**
 * A Provider which grabs the theme and makes it available through context.
 *
 * First, it looks for the theme in localStorage. If it's not there, it
 * defaults to the defaultTheme.
 *
 * Then, it grabs any updates from the API (using getTheme) and updates the theme
 * in state.
 *
 * It stores it in Redux, so it can react to changes made in the CMS at runtime.
 */
const ThemeProvider: React.FC<{ isAdmin?: boolean, testTheme?: ThemeType }> = ({ children, isAdmin, testTheme }) => {
  const {
    state,
    setTheme,
  } = useReduxThemeState(testTheme)

  const theme = (state || { theme: defaultTheme }).theme
  const feAvailabilityState = useFeAvailableState()

  useEffect(() => {
    if (!testTheme) {
      getTheme()
        .then(_theme => {
          setTheme(_theme)
          localStorage.setItem(getLocalStorageKeyForTheme(clientName()), JSON.stringify(_theme))
        })
        .catch((err) => {
          console.error(err)
          if (err?.status === 503) {
            feAvailabilityState.makeFrontEndUnavailable()
          }
        })
    }
  }, [])

  useEffect(() => {
    loadFonts(theme.styles, isAdmin)
  }, [theme])

  useEffect(() => {
    if (isLiteClient() && theme.customer.faviconUrls?.default?.retina) {
      const favicon = document.getElementById("favicon")
      //@ts-ignore
      favicon.href = theme.customer.faviconUrls.default.retina
    }
  }, [theme.customer.faviconUrls?.default?.retina])

  return (
    <ThemeContext.Provider value={testTheme || theme}>
      <StyledComponentsThemeProvider theme={theme}>
        <>
          {children}
        </>
      </StyledComponentsThemeProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeProvider

export const useReduxThemeState = (testTheme = undefined) =>
  useReduxState<State, Actions, {}>({
    key: 'theme__state',
    initialState: {
      /** Initialises theme from localstorage */
      theme: testTheme || getThemeFromLocalStorage(),
    },
    actions: {
      setTheme: (state, newTheme) => {
        return {
          theme: mergeThemes(state.theme, newTheme),
        }
      },
    },
    selectors: {},
  })

interface Actions {
  setTheme: (newTheme: CustomThemeType) => void
}

interface State {
  theme: ThemeType
}

const getThemeFromLocalStorage = (): ThemeType => {
  let theme: ThemeType
  try {
    theme = JSON.parse(safeLocalStorage.getItem(getLocalStorageKeyForTheme(clientName())))
  } catch (e) {
    console.warn(e)
  }
  if (!theme) {
    return defaultTheme
  }
  return mergeThemes(defaultTheme, theme)
}
