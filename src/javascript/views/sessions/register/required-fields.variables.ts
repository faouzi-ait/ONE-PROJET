/*
*  These are the required fields for any given UserResource -
*  these same variables are used on the profile page as well as
*  within the cms when editing a user
*/

export default {
  'title': {
    default: true,
    'ae | amc | cineflix | discovery | fremantle | rtv': false,
    test: true
  },
  'first-name': {
    default: true,
    test: true
  },
  'last-name': {
    default: true,
    test: true
  },
  'email': {
    default: true,
    test: true
  },
  'job-title': {
    default: true,
    'ae | fremantle': false,
    test: true
  },
  'company-name': {
    default: true,
    test: true
  },
  'telephone-number': {
    default: true,
    'ae | fremantle | rtv': false,
    test: true
  },
  'mobile-number': {
    default: true,
    'ae': false,
    test: true
  },
  'account-manager': {
    default: true,
    'ae | cineflix | drg | keshet': false,
    test: true
  },
  'buyer-type': {
    default: false,
    'cineflix | itv': true,
    test: true
  },
  'territories': {
    default: false,
    'all3 | cineflix | wildbrain': true,
    test: true
  },
  'regions': {
    default: false,
    'ae': true,
    test: true
  },
  'country-code': {
    default: false,
    test: true
  }
}

