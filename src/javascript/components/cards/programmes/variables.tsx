export default {
  addListClasses: {
    default: 'card__icon',
    'drg': 'card__icon button-circle'
  },
  programmeCardSize: {
    default: null,
    'amc': 'large',
    'banijaygroup': 'tall',
    'ae | itv': 'medium'
  },
  genres: {
    default: (genres = []) => genres.filter(g => !g['parent-id']),
    'cineflix': (genres = []) => genres,
  },
  introLength: {
    default: 255,
    'amc': 200,
    'cineflix | drg | endeavor | fremantle': 172
  },
  durationTag: {
    default: false,
    'ae': true
  },
  seriesCounter: {
    default: false,
    'drg': true
  }
}