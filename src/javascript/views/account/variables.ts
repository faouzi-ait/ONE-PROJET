export default {
	bannerImage: {
    default: require('images/theme/pages/account-banner.jpg'),
    'all3': null,
    'amc | amcnetwork': require('images/theme/pages/account-banner.png'),
    'cineflix': require('images/theme/banner-default2.jpg'),
    'rtv': 'liteBanner'
  },
  bannerClasses: {
    default: ['short', 'center'],
    'ae | all3 | endeavor': ['short'],
    'rtv': ['intro'],
  },
  sectionClasses: {
    default: 'section section--shade',
    'ae | all3': 'section'
  },
  containerClasses: {
    default: 'container',
    'ae': 'container container--slim'
  },
  gridClasses: {
    default: 'grid grid--three',
    'ae': 'grid grid--three account-cards',
    'cineflix': 'grid grid--three grid--justify'
  }
}
