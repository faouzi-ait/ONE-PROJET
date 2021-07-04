export default {
  grid: {
    default: 'four',
    'all3 | ae | cineflix | discovery | endeavor | itv | keshet': 'three',
    'storylab': 'five'
  },
  mapSize: {
    default: '280x175',
    'discovery | endeavor | fremantle': '560x280'
  },
  validation: {
    default: ["name", "addressOne", "email", "telephone"],
    'discovery': ["name", "addressOne"],
    'itv': ["name", "addressOne", "telephone"],
    'storylab | wildbrain': ["name"]
  }
} 