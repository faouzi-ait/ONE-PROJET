export interface ThemeVariablesType {
  IgnoredAttrs: string
  ReadOnlyAttrs: string
  BuyerTypes: {
    buyer?: string
    producer?: string
    marketing?: string
    publisher?: string
    licensee?: string
    dvd?: string
    inflight?: string
    broadcaster? : string
    distributor? : string
    other?: string
  }
  FlightCarriers: {
    [shortCode: string]: string
  }
  DropOffLocations: {
    outbound?: string[]
    inbound?: string[]
  },
  ProducerHubDisclaimer: string
  ChartBgColor: string
  ChartTextColor: string
  Brands: {},
  BrandColor: string
  KidsVersion: boolean
  ListFolderIcon: boolean
  Placeholders: {
    small?: {
      nonRetina?: string
      retina?: string
    },
    medium?: {
      nonRetina?: string
      retina?: string
    },
    tall?: {
      nonRetina?: string
      retina?: string
    }
  },
  SystemPages: {
    account: SystemPageType
    anonymousAccess: SystemPageType
    approvals: SystemPageType
    catalogue: SystemPageType
    dashboard: SystemPageType
    events: SystemPageType
    home: SystemPageType
    forgottenPassword: SystemPageType
    list: SystemPageType
    login: SystemPageType
    meeting: SystemPageType
    myAssets: SystemPageType
    myProgrammes: SystemPageType
    news: SystemPageType
    privateVideoAccess: SystemPageType
    producerHub: SystemPageType
    profile: SystemPageType
    register: SystemPageType
    reporting: SystemPageType
    resetPassword: SystemPageType
    sitemap: SystemPageType
    team: SystemPageType
  }
}

export interface SystemPageType {
  id: string | null
  upper: string
  lower: string
  path: string
}