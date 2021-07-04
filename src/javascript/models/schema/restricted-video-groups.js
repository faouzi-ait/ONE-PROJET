const restrictedVideoGroups = {
  'expires-after': '',
  'restricted-video': {
    jsonApi: 'hasOne',
    type: 'videos',
  },
  'restricted-group': {
    jsonApi: 'hasOne',
    type: 'groups',
  },
}

export default restrictedVideoGroups
