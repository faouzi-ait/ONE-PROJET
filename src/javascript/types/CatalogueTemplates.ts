type IndexEnum =
  'banner' |
  'videoCarousel' |
  'breadcrumbs' |
  'breadcrumbsPlain' |
  'programmeDetails' |
  'contentBlocks' |
  'relatedProgrammes' |
  'recentlyViewed' |
  'loggedOutProgrammeDetails' |
  'contentTabs' |
  'programmeMeta' |
  'loginForm'

type MainProgrammeDetailsEnum =
  'activeSeries' |
  'episodeCount' |
  'marketingCreditLine' |
  'pdfAsset' |
  'programmeDescriptionIfExists' |
  'programmeDescription' |
  'programmeDescriptionWithSubHeading' |
  'programmeDescriptionWithTagline' |
  'programmeHeading' |
  'requestForAsset' |
  'seriesCount'

type SideProgrammeDetailsEnum =
  'alternativeTitles' |
  'booleanProgrammeTypes' |
  'customAttributes' |
  'genres' |
  'genresAlphabetical' |
  'genresParentFirst' |
  'genresParentAndChild' |
  'genresChildWithParent' |
  'languages' |
  'login' |
  'marketingCreditLine' |
  'nonBooleanProgrammeTypes' |
  'productionCompanies' |
  'productionInfoHeading' |
  'productionYears' |
  'productionYearsRange' | 
  'productionStartYear' |
  'qualities' |
  'talents'

type ProgrammeTabsType = {
  'loggedOutVideoCarousel'?: string,
  'myAssets'?: string
  'programmeDetails'?: string,
  'programmeInfo'?: string
  'videoCarousel'?: string
  'loggedOutProgrammeDetails'?: string
}

export interface TemplateTypes {
  templateA: {
    index: {
      loggedIn: IndexEnum[],
      loggedOut: IndexEnum[]
    },
    programmeDetails: {
      main: MainProgrammeDetailsEnum[],
      side: SideProgrammeDetailsEnum[],
    },
  },
  templateB: {
    index: {
      loggedIn: IndexEnum[],
      loggedOut: IndexEnum[]
    },
    programmeDetails: {
      main: MainProgrammeDetailsEnum[],
      side: SideProgrammeDetailsEnum[],
    },
    contentTabs: {
      loggedIn: ProgrammeTabsType[],
      loggedOut: ProgrammeTabsType[]
    }
  }
}

