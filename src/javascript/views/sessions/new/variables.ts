export default {
  bannerClasses: {
    default: ['short', 'center'],
    'ae | rtv': ['intro'],
    'all3 | endeavor': ['short'],
    'itv': ['short', 'center', 'dark']
  },
  bannerImage: {
    default: null,
    'all3': 'null',
    'amc | keshet | itv | storylab': require('images/theme/pages/login-banner.jpg'),
    'rtv': 'liteBanner'
  },
  bannerTitle: {
    default: 'Login',
    'itv': 'Sign In'
  },
  loadingButtonClasses: {
    default: 'button button--filled button--loading',
    'drg': 'button button--secondary button--small button--loading'
  },
  buttonClasses: {
    default: 'button button--filled',
    'drg': 'button button--secondary button--small'
  },
  forgotPasswordButtonClasses: {
    default: 'text-button',
    'amc | banijaygroup | cineflix | keshet': null
  },
  registerButtonClasses: {
    default: null,
    'ae | all3 | drg | endeavor | fremantle': 'text-button'
  },
  loginIntro: {
    default: null,
    'itv' : `<h2 class="ql-align-center">Thank you for visiting ITV Studios</h2><p class="ql-align-center">Screen ITV Studios content, browse our extensive catalogue and much more. For ITV Hub, <a href=" https://www.itv.com/hub/user/signin">go here</a></p>`,
  },
  loginCopy: {
    default: null,
    'itv' : `<p class="ql-align-center">If you're an industry exec wanting to see more from ITV Studios, set up an account</p><br /><p class="ql-align-center"><a href="/register" class="button">Sign up now</a></p><br /><p  class="ql-align-center">If you're watching ITV in the UK, it's ITV Hub you're looking for</p><br/ ><p class="ql-align-center"><a href="https://www.itv.com/hub/itv" class="button">ITV Hub</a></p>`,
  },
  sectionClasses: {
    default: 'section section--shade',
    'all3 | banijaygroup | discovery': 'section'
  },
  forgottenPasswordText: {
    default: (forgottenPassword) => `${forgottenPassword}?`,
    'ae': (forgottenPassword) => 'Forgot your username or password?',
    'itv': (forgottenPassword) =>  'Forgotten your password?'
  },
  registerText: {
    default: 'Register',
    'ae': 'Would you like to register?'
  },
  loginButtonText: {
    default: 'Login',
    'itv': 'Sign in'
  },
  showInputPlaceholders: {
    default: false,
    'ae': true
  }
}