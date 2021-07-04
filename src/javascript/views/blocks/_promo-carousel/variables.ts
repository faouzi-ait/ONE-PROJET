export default {
  viewAllButtonClasses: {
    default: 'button',
    'ae': 'button button--with-icon',
    'all3 | banijaygroup | endeavor | fremantle |  keshet': 'button button--filled'
  },
  carouselBreakpointLarge: {
    default: null,
    'all3 | fremantle': 1220,
    'endeavor' : 920,
    'discovery | wildbrain': 1023
  },
  carouselBreakpointMedium: {
    default: 768,
    'banijaygroup': 1000,
    'ae | all3 | fremantle': 920
  },
  carouselBreakpointSmall: {
    default: 768,
    'all3 | fremantle': 620
  },
  carouselOptionsDefault: {
    default: (items) => ({
      slidesToShow: items ? items : 4
    }),
    'ae | banijaygroup | drg | endeavor': (items) => ({
      slidesToShow: items ? items : 3
    }),
  },
  carouselOptionsLarge: {
    default: null,
    'all3 | fremantle' : {
      slidesToShow: 3,
      arrows: false,
      dots: true,
    },
    'cineflix | discovery | endeavor | wildbrain': {
      slidesToShow: 3,
    }
  },
  carouselOptionsMedium: {
    default: (items) => ({
      slidesToShow: items === 1 ? 1 : 2,
      arrows: false,
      dots: true,
      scrollBar: false,
      pager: false,
    })
  },
  carouselOptionsSmall: {
    default: {
      slidesToShow: 1
    }
  },
  showButtonWithTabTitle: {
    default: false,
    'ae | keshet': true
  },
  sizeOption: {
    default: false,
    'ae': true
  },
  actionClasses: {
    default: 'u-align-center content-block__actions',
    all3: 'content-block__actions'
  }
}