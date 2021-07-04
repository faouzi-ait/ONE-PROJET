export default {
  showIntro: {
    default: false,
    'keshet': true
  },
  carouselMediumBreakpoint: {
    default: 768,
    'banijaygroup': 1000
  },
  blockOrder: {
    default: (block) => {},
    'itv': (block) => block ? { order: block.order } : { order: 'manual' },
  },
  validation: {
    default: [
      'title'
    ],
    'ae | cineflix | itv': []
  },
  showButtonWithTitle: {
    default: true,
    'ae': false
  }
}