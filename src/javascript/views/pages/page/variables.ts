export default {
  bannerClasses: {
    default: ['intro'],
    'ae': ['overlap'],
    'drg': ['intro', 'long'],
    'itv': ['short'],
    'storylab': ['long']
  },
  bannerVariant: {
    default: 'default',
    'ae': 'b'
  },
  staticBannerVariant: {
    default: () => 'default',
    ae: (slug) => slug === 'catalogue' ? 'a' : 'default'
  },
  breadcrumbClasses: {
    default: ['bordered'],
    'ae': [],
  },
  showIntro: {
    default: true,
    'ae | itv | storylab | wildbrain': false
  },
  forceRedirect: {
    default: false,
    'ae': true
  }
}
