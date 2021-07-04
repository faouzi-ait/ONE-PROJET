export default {
  genreButtonClasses: {
    default: () => 'button',
    'ae': (genre) => `button button--filled button--xlarge button--with-icon button--${genre}`,
    'banijaygroup': () => 'button button--secondary',
    'demo | storylab': () => 'button button--filled',
    'drg': (genre) => `button button--filled button--small u-mb- button--${genre}`
  },
  catalogueButtonClasses: {
    default: 'button button--filled',
  },
  catalogueButtonText: {
    default: (catalogue) => `View ${catalogue}`,
    'banijaygroup': () => 'View full catalogue'
  }
}
