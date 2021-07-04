export default {
  addListClasses: {
    default: 'icon-button',
    'drg': 'icon-button button-circle'
  },
  bulkActionClearButtonClasses: {
    default: 'button button--small',
    'all3': 'button button--with-icon'
  },
  bulkActionAddToListButtonClasses: {
    default: 'button button--small',
    'all3': 'button button--filled'
  },
  carouselClasses: {
    default: (isPublic) => [`programme ${!isPublic && 'programme--with-actions'}`],
    'itv': () =>  ['programme programme--video']
  },
  carouselContainerClasses: {
    default: 'container video-carousel__container',
    'cineflix': 'container video-carousel__container u-mb'
  },
  carouselEnabled: {
    default: true,
    'fremantle': false
  },
  largeOptionOverrides: {
    default: {
      arrows: false,
      dots: true,
      scrollBar: false
    },
    ae: {
      slidesToShow: 3,
    },
    'banijaygroup | demo | discovery | endeavor | wildbrain': {
      arrows: false,
      dots: true,
      scrollBar: false,
      slidesToShow: 3
    }
  },
  mediumDots: {
    default: {},
    'ae | itv': {
      arrows: false,
      dots: false
    }
  },
  mediumPager: {
    default: {},
    'itv': { pager: true }
  },
  optionOverrides: {
    default: {groups: true},
    ae: {scrollBar: false, groups: true},
    'storylab': {}
  },
  optionsSlidesToShow: {
    default: 4,
    'ae': 3,
    'demo': 5
  },
  preSelectedFilters: {
    default: false,
    'fremantle': ['series-id', 'language-ids'],
  },
  sectionClasses: {
    default: 'section section--shade',
    'all3': 'section section--shade section--collapse-top',
    'discovery': 'section section--brand',
    'storylab': 'section',
    'banijaygroup | endeavor | fremantle': '',
  },
  scrollingTitle: {
    default: true,
    'ae | banijaygroup': false
  },
  watermarkLinkText: {
    default: 'Generate Download Email',
    'banijaygroup': 'Download',
    'cineflix': 'CLICK FOR DOWNLOAD EMAIL'
  }
}