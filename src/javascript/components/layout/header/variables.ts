export default {
	backupLogo: {
		default: require('images/theme/logo-header.svg'),
		'drg': require('images/theme/logo-header.png')
	},
	contentLeft: {
		'default': ['logo', 'megaMenu'],
		'ae': ['logo', 'megaMenu', 'listsLink'],
		'cineflix': ['logo', 'megaMenu', 'topNavigation'],
		'keshet': ['logo', 'megaMenu', 'shareIcons'],
	},
	contentRight: {
		'default': ['welcomeMessage', 'userControls', 'searchBar', 'searchControls', 'navigation'],
		'ae': ['searchBar', 'searchControls', 'welcomeMessage', 'userControls', 'navigation'],
		'all3': ['welcomeMessage', 'catalogueLink', 'searchOpenUserControls', 'searchBar', 'searchControls', 'navigation'],
		'cineflix': ['welcomeMessage', 'userControls', 'searchBar', 'navigation', 'searchControls']
	},
	externalLink: {
		'default': false
	},
	hideLogoImage: {
		'default': false,
		'cineflix | storylab': true
	},
	kidsLogoImage: {
		'default': null,
		'banijaygroup': require('images/theme/kids-logo.png')
	},
	menuButtonClasses: {
		'default': 'button button--icon',
		'ae | all3 | amc | drg': 'burger'
	},
	searchButtonClasses: {
		'default': 'button button--icon',
		'ae': 'text-button'
	},
	showControlsOnSearch: {
		default: true,
		'banijaygroup | discovery': false
	},
	sticky: {
		'default': false,
		'ae | cineflix | endeavor | fremantle | storylab': true
	},
	stickyHide: {
		'default': false,
		'cineflix': true
	},
}