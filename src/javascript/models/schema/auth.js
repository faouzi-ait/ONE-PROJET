
/*
IS THIS USED ANYWHERE??? I WOULD EXPECT NOT!! THIS SHOULD BE USING UserResource???
*/

const auth = {
  'title': '',
  'first-name': '',
  'last-name': '',
  'email': '',
  'job-title': '',
  'user-type': '',
  'company-name': '',
  'telephone-number': '',
  'mobile-number': '',
  /* #region  cineflix | itv */
  'buyer-type': '',
  /* #endregion */

  'roles': {
    'jsonApi': 'hasMany',
    'type': 'roles'
  },
  'account-manager': {
    'jsonApi': 'hasOne',
    'type': 'users'
  },
  'company': {
    'jsonApi': 'hasOne',
    'type': 'companies'
  },
  'territories': {
    'jsonApi': 'hasMany',
    'type': 'territories'
  },
  'genres': {
    'jsonApi': 'hasMany',
    'type': 'genres'
  }
}

export default auth