export default {
	logo: {
		default: require('images/theme/logo-footer.svg'),
    'ae | amc | endeavor': require('images/theme/logo-header.svg'),
    'cineflix': require('images/theme/cineflixrightsRGB.jpg'),
    'drg | discovery': require('images/theme/logo-footer.png'),
    'keshet | storylab': null
  },
  logoLink: {
    default: null,
    'cineflix': 'http://www.cineflix.com'
  },
  contentOrder: {
    'default': ['logo', 'navigation', 'copy','shareIcons'],
    'all3 | wildbrain': ['logo', 'shareIcons', 'navigation', 'copy'],
    'drg': ['logo', 'navigation', 'shareIcons', 'copy'],
    'cineflix': ['shareIcons', 'tagline', 'logo', 'bottom'],
    'fremantle | storylab': ['logo', 'bottom', 'shareIcons'],
  },
  tagline: {
    default: null,
    'cineflix': 'PART OF THE CINEFLIX MEDIA GROUP'
  }
}