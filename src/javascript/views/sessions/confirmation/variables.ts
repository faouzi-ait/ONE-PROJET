export default {
  bannerClasses: {
		'default': ['intro'],
		'all3 | keshet': ['short'],
  },
  bannerImage: {
		'default': null,
    'amc | banijaygroup | storylab': require('images/theme/pages/register-banner.jpg'),
    'itv': require('images/theme/pages/register-success-banner.jpg'),
    'rtv': 'liteBanner',
  },
  sectionClasses: {
    default: 'section section--shade',
    'banijaygroup': 'section'
  },
  pageTitle: {
    default: 'Registration Successful',
    'rtv': 'Registration Complete',
  }
}