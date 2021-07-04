export default {
  passwordRules: {
    default: [
      {
        label: 'At least 8 characters',
        stillToBeMet: (value = '') => value.length < 8
      }, {
        label: 'An uppercase letter',
        stillToBeMet: (value = '') => !value.match(/[A-Z]/gm)
      }, {
        label: 'A number',
        stillToBeMet: (value = '') => !value.match(/\d/gm)
      }
    ],
    'ae | test': [
      {
        label: 'At least 8 characters',
        stillToBeMet: (value = '') => value.length < 8
      }, {
        label: 'A lowercase letter',
        stillToBeMet: (value = '') => !value.match(/[a-z]/gm)
      }, {
        label: 'An uppercase letter',
        stillToBeMet: (value = '') => !value.match(/[A-Z]/gm)
      }, {
        label: 'A number',
        stillToBeMet: (value = '') => !value.match(/\d/gm)
      }
    ]
  }
}
