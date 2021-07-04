export default {
  bannerClasses: {
		'default': ['short'],
    'itv': ['intro'],
    'rtv': ['intro'],
  },
  bannerImage: {
    'default': require('images/theme/pages/profile-banner.jpg'),
    'all3': 'null',
    'cineflix': null,
    'rtv': 'liteBanner'
  },
  changePasswordButtonClasses: {
    default: (errors) => ['button', 'filled', (errors['password'] || errors['password-confirmation']) && 'alert'].join(' button--'),
    'drg': (errors) => ['button', 'small', (errors['password'] || errors['password-confirmation']) && 'alert'].join(' button--')
  },
  changePasswordSaveButtonClasses: {
    default: (loading) => ['button', loading && 'loading'].join(' button--'),
    'amc': (loading) => ['button', 'center', 'medium', loading && 'loading'].join(' button--'),
    'drg': (loading) => ['button', 'small', 'secondary', loading && 'loading'].join(' button--')
  },
  formClass: {
    default: 'form form--skinny',
    'ae': 'form form--inline'
  },
  formSectionClass: {
    default: null,
    'all3': 'section__popout'
  },
  mainSectionClass: {
    default: null,
    'drg': 'u-bg-brand'
  },
  saveButtonClasses: {
    default: (loading) => ['button', 'filled', loading && 'loading'].join(' button--'),
    'drg': (loading) => ['button', 'small', 'secondary', loading && 'loading'].join(' button--')
  },
  selectClasses: {
    default: [],
    'drg': ['white']
  },
  showBuyerType: {
    default: false,
    'cineflix': true
  },
  sectionClasses: {
    default: 'section section--shade',
    'banijaygroup': 'section'
  },
}
