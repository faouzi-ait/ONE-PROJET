export default {
  actionsClasses: {
    default: 'actions actions--center',
    'all3': '',
    'ae': 'actions'
  },
  bannerClasses: {
    default: ['intro'],
    'ae | keshet': ['short'],
  },
  bannerImage: {
    default: require('images/theme/pages/meetings-banner.jpg'),
    'all3': 'null',
    'cineflix': require('images/theme/banner-default.jpg'),
    'rtv': 'liteBanner',
  },
  breadcrumbClasses: {
    default: ['bordered'],
    ae: []
  },
  cancelButtonClasses: {
    default: 'button',
    'ae': 'button button--error button--large'
  },
  createButtonClasses: {
    default: 'button button--filled',
    'ae': 'button button--filled button--large'
  },
  shouldValidateLocation: {
    default: false,
    'all3 | amc | demo | itv | rtv | storylab | wildbrain': true
  },
  unregisteredButtonClasses: {
    default: 'button',
    'ae': 'button button--secondary',
    'banijaygroup': 'button button--small',
    'drg': 'button button--filled button--small'
  },
  registeredButtonClasses: {
    default: 'button button--filled',
    'ae': 'button button--secondary',
    'banijaygroup | drg': 'button button--filled button--small'
  },
  titleLabel: {
    defaut: null,
    'ae': 'Meeting title'
  },
  titleInputClasses: {
    default: ['large'],
    'ae': []
  },
  wrapperClasses: {
    default: '',
    'ae | discovery': 'section section--shade',
    'banijaygroup | itv': 'section section--shade section--collapse',
    'keshet': 'section section--shade section--curved'
  },
}