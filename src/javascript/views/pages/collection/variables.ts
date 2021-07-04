export default {
  defaultOrder: {
    default: [
      {
        value: 'manual',
        label: 'Manual',
        sort: 'position'
      }, {
        value: 'alphabetical',
        label: 'A-Z',
        sort: 'title'
      }, {
        value: 'date',
        label: 'Date Added',
        sort: '-published-at'
      }
    ],
  },
  featuredCard: {
    default: false,
    'itv' : true
  },
  showIntroInPage: {
    default: true,
    'itv': false
  },
  showIntroInBanner: {
    default: false,
    'ae': true
  },
  bannerClasses: {
    default: ['intro'],
    'keshet': ['short'],
    'ae': ['overlap']
  },
  pageControlsSectionClasses: {
    default: 'section section--collapse',
    'demo | discovery | fremantle | drg': 'section section--collapse section--shade'
  },
  sectionClasses: {
    default: 'section section--shade',
    'all3': 'section'
  },
  pageControlClasses: {
    default: 'page-controls',
    'amc': 'page-controls page-controls--underlined'
  },
  gridClasses: {
    default: 'grid grid--four',
    'ae | amc': 'grid grid--three'
  },
  breadcrumbClasses: {
    default: ['bordered'],
    'ae': [],
  },
  pageClasses: {
    default: () => null,
    'ae': (collectionName) => collectionName
  }
}