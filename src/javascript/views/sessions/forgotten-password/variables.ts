export default {
	bannerTitle: {
		'default': (title) => title,
		'itv': (title) => 'Reset Password'
	},
	bannerCopy: {
		'default': 'Enter your email address below and if an account matching the address exists we will send you a link to reset your password.',
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
		'amc | drg | itv | keshet': require('images/theme/pages/forgotten-password-banner.jpg'),
		'rtv': 'liteBanner',
	},
	sectionClasses: {
    default: 'section section--shade',
    'banijaygroup': 'section'
  },
}