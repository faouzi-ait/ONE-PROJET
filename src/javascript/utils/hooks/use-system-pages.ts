import { useEffect } from 'react'
import pluralize from 'pluralize'

import { capitalize } from 'javascript/utils/generic-tools'
import { findAllByModel } from 'javascript/utils/apiMethods'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import { useReduxThemeState } from 'javascript/utils/theme/ThemeProvider'
import snakeToCamel from 'javascript/utils/helper-functions/snakeToCamel'
import useReduxState from 'javascript/utils/hooks/use-redux-state'
import useTheme from 'javascript/utils/theme/useTheme'
import { PageType } from 'javascript/types/ModelTypes'

type UseSystemPagesType = () => {
  fetchSystemPages: (shouldUpdateTheme?: boolean) => void
  systemPages: SystemPagesArrayType
}

export type UseSystemPageType = {
  id: string
  title: string
  slug: string
  'page-type': string
  localisation?: {
    upper: string
    lower: string
    path: string
  }
}

export interface SystemPagesArrayType {
  includesSlug: (slug: string) => UseSystemPageType | false
  includesSlugAndEnabledFeature: (slug: string) => { systemPage: UseSystemPageType | false, enabled: boolean }
  isViewablePage: (slug: string) => boolean
  hasOwnCmsPath: (slug: string) => UseSystemPageType | false
  getFullPath: (slug: string) => string
  map: (cb) => any
  filter: (cb) => any
  sort: (compareFn: (a, b) => number) => any
  length: number
}

interface State {
  systemPages: SystemPagesArrayType
}

interface Actions {
  setSystemPages: (pages: PageType[]) => void
}

type Selectors = {
  getSystemPages: () => SystemPagesArrayType
}

const useSystemPages: UseSystemPagesType = () => {
  const theme = useTheme()
  const themeState = useReduxThemeState()

  const getInitialState: () => State = () => ({
    systemPages: new SystemPagesArray([], theme)
  })

  const systemPagesState = useReduxState<State, Actions, Selectors>({
    key: 'systemPages',
    initialState: getInitialState(),
    actions: {
      setSystemPages: (state, pages) => ({
        ...state,
        systemPages: new SystemPagesArray(pages, theme),
      }),
    },
    selectors: {
      getSystemPages: (state) => state.systemPages,
    }
  })

  const systemPages = systemPagesState.getSystemPages()

  useEffect(() => {
    if (!systemPages?.length) {
      fetchSystemPages()
    }
   }, [systemPages])

  const fetchSystemPages = (shouldUpdateTheme = false) => {
    getSystemPages().then((response) => {
      systemPagesState.setSystemPages(response)
      if (shouldUpdateTheme) {
        themeState.setTheme({
          variables: makeSystemPageVariables(response)
        })
      }
    }).catch((err) => {
      systemPagesState.setSystemPages(null)
    })
  }

  return {
    fetchSystemPages,
    systemPages
  }
}

export default useSystemPages

class SystemPagesArray extends Array {
  theme: ThemeType
  constructor (pages, theme) {
    super(...pages)
    this.theme = theme
  }
  includesSlug = (slug) => this.find((item) => item.slug === slug) || false
  includesSlugAndEnabledFeature = (slug) => {
    const { features } = this.theme
    const featuresActive = {
      'privateVideoAccess': features.videos.privateVideoAccess,
      'meeting': features.users.meetings.enabled,
      'events': features.users.meetings.events,
      'dashboard': features.dashboard.frontend || features.dashboard.admin,
      'passport': features.passport.frontend || features.passport.admin,
      'sitemap': features.sitemap,
      'myAssets': features.myAssets.enabled,
      'producerHub': features.producerHub,
      'anonymousAccess': features.users.anonymousAccess.enabled,
      'myProgrammes': features.users.limitedAccess,
      'team': features.teamMembers
    }
    const sp = this.find((item) => item.slug === slug)
    if (!sp?.['page-type'] || typeof sp['page-type'] !== 'string') {
      return { systemPage: false, enabled: true }
    }
    const pageType = snakeToCamel(sp['page-type'])
    return {
      systemPage: sp,
      enabled: featuresActive.hasOwnProperty(pageType) ? featuresActive[pageType] : true
    }
  }
  getFullPath = (slug) => {
    const sp = this.find((item) => item.slug === slug)
    if (sp?.['page-type'] === 'home') return ''
    if (sp && [
      'approvals',
      'events',
      'list',
      'meeting',
      'profile',
      'reporting',
    ].includes(sp['page-type'])) {
      const accountSlug = this.find((item) => item['page-type'] === 'account').slug || ''
      return `${accountSlug}/${slug}`
    }
    return slug
  }
  hasOwnCmsPath = (slug) => {
    const sp = this.find((item) => item.slug === slug)
    if (!sp?.['page-type']) return false
    const pageType = snakeToCamel(sp['page-type'])
    return [
      'catalogue',
      'news',
      'myProgrammes',
      'anonymousAccess',
      'producerHub',
    ].includes(pageType) ? {
      ...sp,
      localisation: {
        ...this.theme.localisation[pageType],
      }
    } : false
  }
  isViewablePage = (slug) => {
    const dontViewAsPage = [
      'dashboard',
      'private_video_access',
      'register',
      'reset_password',
      'login',
    ]

    const sp = this.find((item) => item.slug === slug)
    if (!sp?.['page-type'] || typeof sp['page-type'] !== 'string') {
      return true
    }
    return !dontViewAsPage.includes(sp['page-type'])
  }
  map = (cb, ...args) => {
    const arr = [...this].map(cb, ...args)
    return new SystemPagesArray(arr, this.theme)
  }
  filter = (cb, ...args) => {
    const arr = [...this].filter(cb, ...args)
    return new SystemPagesArray(arr, this.theme)
  }
  //@ts-ignore
  sort = (compareFn) => {
    const arr = [...this].sort(compareFn)
    return new SystemPagesArray(arr, this.theme)
  }
}

export const pageTypeDisplayName = (pageType = '') => {
  let pageDisplayName = pageType
  if ([
    'meeting',
    'list',
  ].includes(pageType)) {
    pageDisplayName = pluralize(pageType)
  }
  return capitalize(pageDisplayName.replace(/_/g, ' '))
}

const getSystemPages = () => findAllByModel('pages', {
  fields: ['title', 'slug', 'page-type'],
  filter: {
    'system-pages': true,
    all: true
  }
})

const makeSystemPageVariables = (pages) => {
  const makeSystemPageLocalisation = (pgType) => pages.filter(p => p['page-type'] === pgType).map((pgResource) => ({
    id: pgResource.id,
    upper: capitalize(pgResource.title),
    lower: pgResource.title.toLowerCase(),
    path: pgResource.slug
  }))?.[0]
  return {
    SystemPages: {
      account: makeSystemPageLocalisation('account') || {},
      anonymousAccess: makeSystemPageLocalisation('anonymous_access') || {},
      approvals: makeSystemPageLocalisation('approvals') || {},
      catalogue: makeSystemPageLocalisation('catalogue') || {},
      dashboard: makeSystemPageLocalisation('dashboard') || {},
      events: makeSystemPageLocalisation('events') || {},
      forgottenPassword: makeSystemPageLocalisation('forgotten_password') || {},
      home: makeSystemPageLocalisation('home') || {},
      login: makeSystemPageLocalisation('login') || {},
      list: makeSystemPageLocalisation('list') || {},
      meeting: makeSystemPageLocalisation('meeting') || {},
      myAssets: makeSystemPageLocalisation('my_assets') || {},
      myProgrammes: makeSystemPageLocalisation('my_programmes') || {},
      news: makeSystemPageLocalisation('news') || {},
      privateVideoAccess: makeSystemPageLocalisation('private_video_access') || {},
      producerHub: makeSystemPageLocalisation('producer_hub') || {},
      profile: makeSystemPageLocalisation('profile') || {},
      register: makeSystemPageLocalisation('register') || {},
      reporting: makeSystemPageLocalisation('reporting') || {},
      resetPassword: makeSystemPageLocalisation('reset_password') || {},
      sitemap: makeSystemPageLocalisation('sitemap') || {},
      team: makeSystemPageLocalisation('team') || {},
    }
  }
}

export const getSystemPageVariablesFromApi = () => new Promise((resolve, reject) => {
  getSystemPages().then((pages) => {
    resolve(makeSystemPageVariables(pages))
  })
})