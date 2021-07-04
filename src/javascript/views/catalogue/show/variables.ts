export default {
  contentBlockBgSize: {
    default: {},
    'itv': { backgroundSize: 'cover' }
  },
  genreQuery: {
    default: {
      fields: {
        genres: 'name,parent-name',
      },
    },
    'ae | banijaygroup | cineflix | discovery | drg | fremantle | keshet': {
      fields: {
        genres: 'name,parent-id',
      },
    }
  },
  loggedOutProgrammeDetailsSectionClasses: {
    default: 'section',
    'ae | banijaygroup': '',
    'drg': 'section section--circle'
  },
	programmeDetailsSectionClasses: {
    default: 'section',
    'drg': 'section section--circle',
    'amc': 'section section--light',
    'ae': 'section section--shade',
    'endeavor': 'section section--thin',
    'fremantle': '',
    'banijaygroup': 'section section--compact'

  },
	programmeInfoSectionClasses: {
    default: 'section',
    'drg': 'section section--circle',
    'amc': 'section section--light',
    'endeavor': 'section section--shade',
    'fremantle': ''
  }
}