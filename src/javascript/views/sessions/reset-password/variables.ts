export default {
	bannerCopy: {
		'default': 'Create a new password here. Once you have reset your password you will be re-directed to the homepage where you can log in with your email address and new password.',
		'itv': 'Security is important to us and your password should never be shared with anyone else. Using your email address, please reset your password and keep your account secure.',
	},
	bannerClasses: {
		'default': ['short', 'center'],
		'ae | rtv': ['intro'],
		'amc': ['short', 'center', 'narrow'],
		'cineflix': ['short', 'center', 'shaded'],
		'all3 | endeavor': ['short'],
		'itv': ['intro', 'center']
	},
	bannerImage: {
		'default': null,
		'all3': 'null',
		'amc | drg | itv': require('images/theme/pages/forgotten-password-banner.jpg'),
		'rtv': 'liteBanner',
	},
	sectionClasses: {
    default: 'section section--shade',
    'banijaygroup': 'section'
  },
}