export default {
  showLogos: {
    default: true,
    'discovery | endeavor': false
  },
  sectionClasses: {
    default: 'section section--shade',
    'banijaygroup': 'section section--shade section--centered',
    'all3 | fremantle | storylab | wildbrain': 'section',
    'keshet': 'section section--curved-over'
  },
  totalCarouselSlides: {
    default: 15,
    'ae': 10,
    'all3': 6
  },
  carouselOptionsDefault: {
    default: {
      slidesToShow: 4,
      arrows: true,
      dots: true,
      scrollBar: false
    },
    'all3': {
      slidesToShow: 4,
      arrows: true,
      dots: false
    },
    'discovery | drg | fremantle | itv | wildbrain': {
      arrows: true,
      slidesToShow: 6,
      dots: false
    },
    'amc': {
      slidesToShow: 6,
      arrows: true,
      dots: false,
      scrollBar: true,
    },
    'cineflix | storylab': {
      arrows: true,
      slidesToShow: 5
    },
    'demo': {
      slidesToShow: 3,
      dots: false,
      scrollBar: true,
    },
    'ae': {
      slidesToShow: 3,
      arrows: true,
      dots: false,
    }
  },
  carouselOptionsLarge: {
    default: {
      arrows: false
    },
    'all3': {
      arrows: false,
      dots: true,
      scrollBar: false,
      slidesToShow: 3
    },
    'cineflix': {
      slidesToShow: 3
    },
    'ae | demo': {
      arrows: true,
      dots: false
    },
    'discovery | itv': {
      slidesToShow: 4
    },
    'wildbrain': {
      slidesToShow: 5
    }
  },
  carouselOptionsMedium: {
    default: {
      slidesToShow: 2
    },
    'drg': {
      slidesToShow: 4,
    }
  },
  carouselOptionsSmall: {
    default: {
      slidesToShow: 1
    },
    'ae | demo': {
      slidesToShow: 1,
      arrows: false,
      dots: true,
      scrollBar: false
    }
  },
  showGenres: {
    default: false,
    'demo': true
  },
  durationTag: {
    default: false,
    'ae': true
  },
  programmeComponent: {
    default: true,
    'ae | demo' : false
  }
}