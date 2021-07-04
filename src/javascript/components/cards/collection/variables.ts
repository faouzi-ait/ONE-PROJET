export default {
  sortFilter: {
    default: (order) => ({}),
    'itv': (order) => ({ sort: order === 'manual' ? 'position' : '-published-at' }),
  },
  date: {
    default: false,
    'all3 | banijaygroup | cineflix | discovery | fremantle | itv | keshet | wildbrain': true
  },
  intro: {
    default: false,
  },
  description: {
    default: true,
    'drg | itv': false
  },
  cta: {
    default: false
  },
}
