export default {
  bannerClasses: {
    default: ['intro'],
    'discovery': ['short', 'center'],
    'drg': ['intro', 'circle'],
    'cineflix': ['intro', 'shaded'],
    'all3 | keshet': ['short']
  },
  bannerImage: {
    default: '',
    'all3': 'null',
    'amc | drg | endeavor | itv | keshet | storylab': require('images/theme/pages/register-banner.jpg'),
    'cineflix': require('images/theme/banner-default2.jpg'),
    'rtv': 'liteBanner',
  },
  buttonClasses: {
    default: (loading) => loading ? 'button button--filled button--loading' : 'button button--filled',
    'ae': (loading) => loading ? 'button button--filled button--large button--loading' : 'button button--large button--filled',
    'drg': (loading) => loading ? 'button button--secondary button--small button--loading' : 'button button--secondary button--small'
  },
  buttonText: {
    default: 'Register',
    'drg': 'Submit your registration',
    test: 'register-button'
  },
  containerClasses: {
    default: 'container',
    'drg': 'container wysiwyg'
  },
  formClasses: {
    default: 'form form--skinny',
    'ae': 'form form--inline',
  },
  formErrorClasses: {
    default: 'form__error',
    'amc': 'form__error form__error--inline',
  },
  formOrder: {
    default: [
      'title', 'firstName', 'lastName', 'email', 'countryCode', 'jobTitle',
      'companyName', 'telephoneNumber', 'genres', 'accountManager', 'territories',
      'regions', 'password'
    ],
    'ae': [{
      'Profile': [
        'firstName', 'lastName'
      ]
    },{
      'Company': [
        'jobTitle', 'companyName'
      ]
    },{
      'Contact': [
        'email', 'telephoneNumber', 'territories', 'regions'
      ]
    }, {
      'Password': [ 'password' ]
    }],
    'all3': [
      'title', 'firstName', 'lastName', 'companyName', 'jobTitle', 'countryCode',
      'territories', 'regions', 'programmeType', 'genres', 'contactHeading',
      'telephoneNumber', 'email', 'password'
    ],
    'amc': [
      'title', 'firstName', 'lastName', 'email', 'jobTitle', 'companyName',
      'telephoneNumber', 'genres', 'accountManager', 'territories', 'regions',
      'policyWarning', 'password'
    ],
    'cineflix': [
      'title', 'firstName', 'lastName', 'email', 'jobTitle', 'companyName',
      'telephoneNumber', 'genres', 'territories', 'regions', 'buyerType', 'password'
    ],
    'drg': [
      'title', 'firstName', 'lastName', 'companyName', 'jobTitle', 'contactHeading',
      'telephoneNumber', 'email', 'genres', 'territories', 'regions', 'password'
    ],
    'itv': [
      'title', 'firstName', 'lastName', 'email', 'jobTitle', 'companyName',
      'telephoneNumber', 'genres', 'buyerType', 'accountManager', 'territories',
      'regions', 'password'
    ],
    'wildbrain': [
      'title', 'firstName', 'lastName', 'email', 'countryCode', 'jobTitle',
      'companyName', 'telephoneNumber', 'genres', 'territories', 'regions',
      'accountManager', 'password'
    ],
    'test': [ // Must contain all possible options.
      'title', 'firstName', 'lastName', 'email', 'jobTitle', 'companyName',
      'countryCode', 'telephoneNumber', 'genres', 'accountManager', 'territories',
      'buyerType', 'policyWarning', 'contactHeading', 'programmeType',
      'regions', 'password'
    ]
  },
  genrePreferencesLabel: {
    default: "I'm interested in...",
    'endeavor': 'Content of Interest',
    test: 'GenreTestLabel'
  },
  mainClasses: {
    default: '',
    'drg': 'entertainment_formats main main--circle-bottom-right'
  },
  registerCopy: {
    default: false,
    'amc': `<p>This site is entirely dedicated to broadcast industry professionals and is not for use by individuals of the general public.<p><p>To apply for registration, simply fill out the form below to allow us to process your application. Please note that we reserve the right to decline access to this site.</p>`,
    'itv': `<p>If you are an ITV channel viewer, please go to <a href="https://www.itv.com/hub/itv" target="_blank">https://www.itv.com/hub/itv</a> to find the latest on ITV1, ITV2, ITVBe, ITV3, ITV4 and CITV. Please do not register on this page because itvstudios.com is a business-to-business website for our international programme buyers and their marketing teams, programme producers, merchandise licensees and retailers.</p><br /><p>If you are a programme buyer for a channel or a platform, marketer seeking assets for a show which your acquisition team has acquired from us, a programme producer, merchandise licensee, retailer or publisher, please register below and select the ITV Studios account manager you know. Thank you.</p>`,
    test: `<div data-testid="register-copy">dangerous-html</div>`
  },
  selectClasses: {
    default: [],
    'drg': ['white']
  },
  sectionClasses: {
    default: 'section section--shade',
    'all3 | banijaygroup | discovery': 'section'
  },
  territoriesSelectClasses: {
    default: '',
    'keshet': 'Select--bottom'
  },
  territoriesTitle: {
    default: 'Territory',
    'all3': 'Territories You Are Buying For'
  },
}
