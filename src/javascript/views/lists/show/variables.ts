export default {
  editButtonClasses: {
    default: 'button button--small button--filled',
    'banijaygroup': 'button button--with-icon button--filled',
    'discovery | fremantle | wildbrain': 'button button--filled',
  },
  errorButtonClasses: {
    default: 'button button--small button--error',
    'ae': 'button button--with-icon button--small button--error',
    'banijaygroup': 'button button--small'
  },
  exitButtonClasses: {
    default: 'button button--small button--null',
    'ae': 'button button--with-icon button--small button--null',
    'banijaygroup': 'button button--small button--filled'
  },
  notesButtonClasses: {
    default: 'button button--small button--filled',
    'ae': 'button button--with-icon button--small button--success',
    'discovery': 'button button--filled',
    'banijgroup': 'button button--small',
    'storylab': 'button button--small button--filled button--list',
    'wildbrain': 'button button--small button--filled button--success',
  },
  gridClasses: {
    default: 'grid grid--four',
    'cineflix': 'grid grid--four u-pb+',
    'ae | all3 | banijaygroup | drg': 'grid grid--three'
  },
  containerStyling: {
    default: {},
    'itv': {
      paddingBottom: 100
    }
  },
  shouldRenderDeleteButton: {
    default: (selectedTotal) => true,
    'amc': (selectedTotal) => selectedTotal === 1,
  },
  durationTag: {
    default: false,
    'ae': true
  },
}