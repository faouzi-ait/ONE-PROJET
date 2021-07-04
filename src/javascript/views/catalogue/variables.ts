export default {
  addListClasses: {
    default: 'card__icon',
    'drg': 'card__icon button-circle'
  },
  bannerClasses: {
    default: ['short'],
    'all3': ['short', 'catalogue'],
    'ae | discovery | rtv': ['intro'],
    'drg': ['short','center'],
    'itv': ['align-right', 'intro'],
  },
  bannerImage: {
    default: null,
    all3: 'null',
    'amc | cineflix | demo | discovery | endeavor | fremantle | itv | keshet | storylab': require('images/theme/pages/catalogue-banner.jpg'),
    'rtv': 'liteBanner',
  },
  bannerLabel: {
    default: null,
    'demo | rtv': 'Monkey’s of the Mountain'
  },
  bannerTitlePrefix: {
    default: '',
    'all3 | demo': 'Our '
  },
  bannerVariant: {
    default: 'default',
    'ae': 'a'
  },
  bgBrandClass: {
    default: '',
    'drg': 'u-bg-brand'
  },
  breadcrumbClasses: {
    default: [],
    'banijaygroup': ['shade'],
    'wildbrain': ['bordered']
  },
  buttonClasses: {
    default: (filtered) => filtered ? 'button button--secondary page-controls__right' : 'button button--filled page-controls__right',
    'all3':  () => 'button button--with-icon button--filled page-controls__right',
    'ae': (filtered) => filtered ? 'button button--secondary button--with-icon' : 'button button--filled button--with-icon',
    'banijaygroup':  () => 'button button--filled page-controls__right',
    'itv | wildbrain': (filtered) => filtered ? 'button button--filled-bg page-controls__right' : 'button button--filled page-controls__right',
    'drg | fremantle': (filtered) => filtered ? 'button button--filled page-controls__right' : 'button button--secondary page-controls__right',
    'amc': (filtered) => filtered ? 'button button--filled button--medium button--with-icon' : 'button button--medium button--with-icon',
    'storylab': (filtered) => filtered ? 'button button--filled button--with-icon' : 'button button--filled-bg button--with-icon',
    'endeavor': () => 'button button--filled button--small page-controls__right',
  },
  clearFiltersClasses: {
    default: 'text-button text-button--error page-controls__right',
    ae: 'text-button text-button--large'
  },
  clearFiltersButtonClasses: {
    default: 'text-button text-button--error page-controls__right',
    'all3': 'button page-controls__right'
  },
  containerClasses: {
    default: 'container',
    'cineflix': 'container u-pb+',
  },
  customCatalogueBannerVariant: {
    default: 'default'
  },
  displayListsBlock: {
    default: false,
    'itv': true
  },
  genres: {
    default: (genres = []) => genres.filter(g => !g['parent-id']),
    'cineflix': (genres = []) => genres,
  },
  gridClasses: {
    default: 'grid grid--four fade-on-load',
    'all3 | ae | amc | banijaygroup | cineflix | demo | drg | endeavor | endemol | fremantle': 'grid grid--three fade-on-load'
  },
  hasFilterTitleIcon: {
    default: true,
    'ae | all3 | banijaygroup | drg | endeavor | fremantle | storylab | wildbrain': false,
  },
  filterTitle: {
    default: 'Filter your search',
    'ae': 'Filter Your Results'
  },
  introTextMaxLength: {
    default: 0,
    'amc': 200,
    'cineflix | drg | endeavor | fremantle': 172
  },
  initialPageSize: {
    default: '12',
    'cineflix': '24',
    'endeavor': '48'
  },
  initialSort: {
    default: 'title',
    'ae': '-release-date,title',
    'all3': '-production_end,title',
    'amc': '-updated_at',
    'banijaygroup': '-release-date,-production_start',
    'fremantle': '-release-date,-production_end,title',
    'cineflix | discovery | drg | itv | keshet': '-created_at',
  },
  relevanceSortOption: {
    default: {
      value: '-score',
      label: 'Relevance'
    }
  },
  mainSectionClasses: {
    default: () => '',
    'discovery': (kids) => kids ? 'section section--kids section--collapse' : 'section section--shade section--collapse',
    'fremantle | keshet | wildbrain': () => 'section--shade section--curved',
    'rtv': () => 'section section--collapse'
  },
  pageControlFilterClasses: {
    default: '',
    'amc': 'page-controls__right'
  },
  pageControlSortClasses: {
    default: 'page-controls__control page-controls__center',
    'ae': 'page-controls__control page-controls__right',
    'banijaygroup | cineflix | endeavor': 'page-controls__control per-page'
  },
  pageControlViewClasses: {
    default: 'page-controls__control page-controls__center per-page',
    'ae | banijaygroup | cineflix | endeavor | fremantle': 'page-controls__control per-page',
  },
  pageControlViewLabel: {
    default: 'View:',
    'banijaygroup | discovery | endeavor': 'View per page:'
  },
  pageControlViewPerPageLabel: {
    default: ' per page',
    'ae': null,
    'banijaygroup | discovery | cineflix | endeavor': ''
  },
  paginatorOffset: {
    default: 0,
    'cineflix | storylab | wildbrain' : 100
  },
  displayRestrictedWithTags: {
    default: false,
    'all3 | discovery': true
  },
  sortOrder: {
    default: [
      ['A > Z', 'title'],
      ['Z > A', '-title'],
      ['Latest updated', '-updated_at'],
      ['Oldest updated', 'updated_at'],
      ['Latest created', '-created_at'],
      ['Oldest created', 'created_at'],
      ['Most popular', '-popularity']
    ],
    'ae': [
      ['Newest Released', '-release-date,title'],
      ['A > Z', 'title'],
      ['Z > A', '-title'],
      ['Latest updated', '-updated_at'],
      ['Most popular', '-popularity']
    ],
    'all3': [
      ['Latest content', '-production_end,title'],
      ['A > Z', 'title'],
      ['Z > A', '-title'],
      ['Latest updated', '-updated_at'],
      ['Most popular', '-popularity']
    ],
    'banijaygroup':  [
      ['Latest Releases', '-release-date,-production_start'],
      ['Latest Created', '-created_at'],
      ['Latest Updated', '-updated_at'],
      ['Production Date', '-production_end'],
      ['A > Z', 'title'],
      ['Z > A', '-title'],
    ],
    'cineflix':  [
      ['Latest', '-created_at'],
      ['A > Z', 'title'],
      ['Z > A', '-title'],
      ['Most popular', '-popularity']
    ],
    'fremantle': [
      ['Latest Releases', '-release-date,-production_end,title'],
      ['A > Z', 'title'],
      ['Z > A', '-title'],
      ['Oldest', 'production_end'],
    ],
    'drg': [
      ['A > Z', 'title'],
      ['Z > A', '-title'],
      ['Most recent', '-created_at'],
      ['Oldest', 'created_at'],
      ['Most popular', '-popularity']
    ],
    'endeavor': [
      ['A > Z', 'title'],
      ['Z > A', '-title'],
      ['Year of production', '-production_end'],
    ],
  },
  kidsGenre: {
    default: '25'
  },
  programmeTypesInBanner: {
    default: false,
    'all3': true
  },
  durationTag: {
    default: false,
    'ae': true
  },
  brandLogo: {
    default: false,
    'amc': true
  }
}
