export default {
  bannerClasses: {
    default: [],
    'drg': ['tall', 'medium', 'circle'],
    'itv': ['gradient', 'catalogue-show'],
    'all3 | banijaygroup | endeavor | fremantle': ['programme'],
    'ae | amc | demo': ['tall'],
  },
  bannerActionClasses: {
    default: 'banner__actions',
    'amc': '',
  },
  bannerActionButtonStyles: {
    default: {},
    'amc': { marginTop: '2px'}
  },
  openPromoVideoButtonClasses: {
    default: 'button button--filled',
    'ae | banijaygroup': 'button button--secondary button--with-icon',
    'demo | itv | wildbrain': 'button button--with-icon button--filled',
    'all3 | endeavor | fremantle': 'icon-button',
  },
  addListClasses: {
    default: 'icon-button',
    'drg': 'button-circle',
    'amc | demo': 'button button--filled button--with-icon button--deep',
    'banijaygroup | itv': 'button button--filled button--with-icon',
    'cineflix': 'button button--secondary',
  },
  showGenres: {
    default: false,
    'all3 | banijaygroup | drg | itv | keshet': true
  },
  showBannerCopy: {
    default: (isPublic) => true,
    'ae | amc | banijaygroup | cineflix | fremantle': (isPublic) => false
  },
  promoButtonCopy:  {
    default: 'Watch Promo',
    'ae': 'Play',
    'discovery': 'Watch Trailer',
    'all3 | endeavor | fremantle': null
  },
  contentOrder: {
    'default': ['newRelease', 'addToList', 'promoVideo', 'pdfSheet', 'format'],
    'ae': ['addToList', 'newRelease', 'promoVideo', 'pdfSheet', 'format'],
		'discovery': ['newRelease', 'addToList', 'pdfSheet', 'promoVideo', 'format'],
  },  
  formatButtonClasses: {
    default: 'text-button',
    'all3': 'button'
  },
  formatButtonCopy: {
    default: 'Available as a format',
    'all3': 'View Format'
  },
  placeholderImage: {
    default: () => null,
    'ae': (cat: string, genre: string) => 
      cat === 'formats' && require('images/theme/banners/formats-placeholder.jpg') || 
      cat === 'scripted' && require('images/theme/banners/scripted-placeholder.jpg') || 
      cat === 'movies' && require('images/theme/banners/movies-placeholder.jpg') ||
      genre === 'lifestyle' && require('images/theme/banners/lifestyle-placeholder.jpg') || 
      genre === 'crime_investigation' && require('images/theme/banners/crime-placeholder.jpg') || 
      genre === 'original_characters' && require('images/theme/banners/original-characters-placeholder.jpg') ||
      genre === 'paranormal' && require('images/theme/banners/paranormal-placeholder.jpg') || 
      genre === 'reality_entertainment' && require('images/theme/banners/reality-placeholder.jpg')
  }
}
