export default {
  tagClasses: {
    default: 'tag',
    'drg': 'tag tag--plain',
  },
  tagGenreColours: {
    default: false,
    'cineflix | discovery | keshet | fremantle': true
  },
  filterNonBooleanProgrammeTypes: {
    default: (types) => [...types],
    'cineflix': (types) => types.filter((v) => v.name!=='Marketing credit line')
  },
  headingClasses: {
    default: 'heading--two',
    drg: 'heading--two programme-details__heading'
  },
  attributeHeadingClasses: {
    default: 'heading--three',
    'ae': 'programme-details__tag-heading',
    'drg | keshet | storylab | wildbrain': 'heading--four'
  },
  languagesHeading: {
    default: (languages) => languages?.length === 1 ? 'Language' : 'Languages'
  },
  productionInfoTitle: {
    default: 'Production Info',
    'ae': null,
    'all3': 'Programme Info',
    'drg': 'Production info'
  },
  productionYearsHeading: {
    default: 'Years',
    'drg': 'Production Years'
  },
  customAttributeDisplayOverride: {
		default: [],
		fremantle: ['runtime', 'versions']
  },
  seriesMinimumDisplay: {
    default: 1,
    'fremantle': 2
  },
  hideSeriesCondition: {
    default: () => null,
    'all3': (programmeType) => programmeType === 'Format',
  },
  firstSeriesOpen: {
    default: true,
    'ae | discovery | fremantle': false
  },
  seriesAndEpisodeCountText: {
    default: (seriesTxt) => `Number of ${seriesTxt}`,
    'cineflix': (seriesTxt) => `${seriesTxt} Breakdown`,
  },
  programmeHeading: {
    default: (programme) => `${programme} Overview`,
    'ae': () => 'Overview',
    'all3': () => 'Series List',
    'amc | drg': (programme) => `${programme} overview`,
  },
  programmeTagsOrder: {
    default: [],
    'ae': ['seriesTag', 'episodeTag', 'durationTag'],
  },
  unlinkedTagClasses: {
    default: 'tag tag--unlinked',
    'ae': 'tag tag--secondary'
  }
}