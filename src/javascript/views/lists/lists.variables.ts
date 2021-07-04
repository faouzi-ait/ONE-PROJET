export default {
  stickyControls: {
    default: true,
    'fremantle': false
  },
  bannerImage: {
    default: require('images/theme/pages/lists-banner.jpg'),
    all3: 'null',
    'cineflix': require('images/theme/banner-default2.jpg'),
    'rtv': 'liteBanner',
  },
  bannerClasses: {
    default: ['intro'],
    'ae | all3 |  amc | keshet': ['short'],
  },
  breadcrumbClasses: {
    default: ['bordered'],
    'ae': [],
    'banijaygroup': ['shade']
  },
  selectButtonClasses: {
    default: 'text-button',
    'amc': 'button button--filled button--small',
    'demo |disovery': 'button button--small button--filled button--list',
    'cineflix': 'button button--small button--delta-reverse',
    'fremantle': 'button button--small'
  }
}