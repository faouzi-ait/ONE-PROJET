export default {
  sectionClasses: {
    default: 'section section--shade',
    'all3 | banijaygroup | itv | storylab': 'section',
    'keshet': 'section section--curved-over'
  },
  containerClasses: {
    default: 'container',
    'ae': 'container container--slim'
  },
  introClasses: {
    default: 'section__copy',
    'amc': 'section__copy heading--five heading--underline-dark'
  },
  introText: {
    default: (listName) => `These folders allow you to collate and organise your ${listName} more effectively`,
    ae: () => null,
    'banijaygroup': (listName) => `Collate and organise your ${listName} more effectively`,
    'drg': (listName) => `The folders below allow you to collate and organise your ${listName} more effectively`,
    'itv': (listName) => `Collate and organise your ${listName}`
  },
  gridClasses: {
    default: 'grid grid--four',
    'ae': 'grid grid--two',
    'all3 | drg | fremantle': 'grid grid--three'
  }
}