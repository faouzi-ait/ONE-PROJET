export default {
  buttonClasses: {
    default: 'button button--filled',
    'drg': 'button button--filled button--search'
  },
  programmeFields: {
    default: 'title-with-genre',
    'endeavor': 'title',
    'ae': 'catalogues,production-end'
  },
  placeholderText: {
    default: (programme) => `Search for ${programme}...`,
    'banijaygroup': () => 'Search...'
  }
}