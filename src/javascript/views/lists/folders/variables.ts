export default {
  initialPageSize: {
    default: '12',
    'amc': 32
  },
  actionsClasses: {
    default: 'actions__inner',
    'ae | banijaygroup': 'actions__inner actions__inner--centered'
  },
  sectionClasses: {
    default: null,
    'keshet': 'section section--curved-over',
    'drg | wildbrain': 'section section--shade'
  },
  newListButtonText: {
    default: (list) => `+ New ${list}`,
    'banijaygroup': (list) => `Add new ${list}`
  },
  gridClasses: {
    default: 'grid grid--four',
    'cineflix': 'grid grid--four u-pb+',
    'all3 | drg': 'grid grid--three'
  },
  listDateClasses: {
    default: 'card__copy',
    'all3': 'card__date'
  }
}