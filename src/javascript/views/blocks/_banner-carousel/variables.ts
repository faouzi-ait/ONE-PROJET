export default {
  pageImageSizes: {
    default: {
      xlarge: '1600x600',
      large: '1024x600',
      medium: '768x500',
      small: '568x426'
    },
    ae: {
      xlarge: '1600x660',
      large: '1024x420',
      medium: '768x380',
      small: '568x380'
    },
    'all3': {
      xlarge: '1000x478',
      large: '750x478',
      medium: '768x432',
      small: '568x426'
    },
    'amc': {
      xlarge: '1600x900',
      large: '1024x576',
      medium: '768x730',
      small: '768x730'
    },
    'cineflix': {
      xlarge: '1600x600',
      large: '1024x600',
      medium: '768x540',
      small: '320x480'
    },
    'drg': {
      xlarge: '1600x1100',
      large: '1024x900',
      medium: '768x700',
      small: '568x626'
    },
    'banijaygroup | demo | discovery': {
      xlarge: '1600x900',
      large: '1024x600',
      medium: '768x500',
      small: '568x500'
    },
    'endeavor': {
      xlarge: '1600x1000',
      large: '1024x800',
      medium: '768x500',
      small: '568x500'
    },
    'fremantle': {
      xlarge: '1600x700',
      large: '1024x600',
      medium: '768x400',
      small: '568x244'
    },
    'itv': {
      xlarge: '1600x600',
      large: '1024x600',
      medium: '768x500',
      small: '568x213'
    },
    'keshet': {
      xlarge: '1600x750',
      large: '1024x425',
      medium: '768x425',
      small: '568x425'
    }
  },
  carouselOptionsDefault: {
    default: (items) => ({
      slidesToShow: items,
      arrows: true,
      fullWidth: true,
    }),
    'cineflix | discovery | keshet': (items) => ({
      slidesToShow: items,
      arrows: true,
      fullWidth: true,
      dots: true
    }),
    'banijaygroup': (items) => ({
      slidesToShow: items,
      pager: true,
      pagerText: true,
      fullWidth: true,
    }),
  },
  carouselOptionsLarge: {
    default: {
      arrows: false,
      dots: true,
    },
    'banijaygroup': {
      dots: false
    },
    'ae | all3 | itv | keshet': {
      arrows: true
    },
    'fremantle': {
      arrows: true,
      dots: false
    },
  },
  carouselOptionsMedium: {
    default: (items) => ({
      slidesToShow: items === 1 ? 1 : 2
    }),
  },
  carouselOptionsSmall: {
    default: {
      slidesToShow: 1
    },
    'ae | fremantle | all3 | itv | keshet': {
      slidesToShow: 1,
      arrows: false,
      dots: true
    },
  },
  bannerClasses: {
    default: () => [],
    'ae': (programme) => [programme ? programme.catalogues.map(g => g.name.replace(/[^A-Z0-9]+/gi, '_').toLowerCase()) : null],
    'amc | drg | demo': () => ['tall'],
    'drg': (programme) => [programme ? programme.genres.filter(g => !g['parent-id']).map(g => g.name.replace(/[^A-Z0-9]+/gi, '_').toLowerCase()) : null],
    'keshet': () => ['full'],
  },
  showLogo: {
    default: false,
    'itv': true
  },
  showProgrammeDetails: {
    default: true,
    'ae | discovery': false
  },
  slideButtonClasses: {
    default: 'button button--filled',
    'ae': 'button button--secondary',
    'fremantle': 'button button--with-icon button--filled'
  },
  tagsOrder: {
    default: [],
    'banijaygroup | fremantle': ['genres'],
    'ae': ['catalogues', 'duration']
  },
  itemsOption: {
    default: true,
    'all3': false
  }
}