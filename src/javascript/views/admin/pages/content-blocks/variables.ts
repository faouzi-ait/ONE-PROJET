export default {
  mockPageWrapperClass: {
    default: 'mock-page__wrapper',
    'amc': 'mock-page__wrapper custom',
  },
  sectionClasses: {
    default: (block) => [block.type !== 'banner-carousel' && 'content-block', block.type, block.background].join(' content-block--'),
    'amc': (block) => [block.type !== 'banner-carousel' && 'content-block', block.type, block.background, block.fullWidth && 'full'].join(' content-block--'),
  },
  backgroundSize: {
    default: '3200x1000',
    'amc | keshet': '1600x600',
  },
  backgroundCover: {
    default: null,
    'itv': 'cover'
  },
  blocksWithoutContainers: {
    default: [
      'html-markup',
      'banner-carousel',
      'promo-carousel',
      'text-and-items',
      'related-pages',
      'banner-scroller',
      'production-companies',
      'shorthand'
    ],
  }
}