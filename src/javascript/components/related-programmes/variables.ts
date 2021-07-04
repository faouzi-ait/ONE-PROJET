import pluralize from 'pluralize'

export default {
  sectionClasses: {
    default: 'section section--shade',
    'all3': 'section',
    'ae': '',
    'banijaygroup | endeavor | fremantle': 'section section--brand'
  },
  title: {
    default: (localisation) => `Related ${pluralize(localisation.programme.upper)}`,
    'ae': (localisation) => `Similar ${pluralize(localisation.programme.upper)}`,
    'drg | fremantle': (localisation) => `Related ${pluralize(localisation.programme.lower)}`,
    'banijaygroup | endeavor': (localisation) => `Related`,
  },

}