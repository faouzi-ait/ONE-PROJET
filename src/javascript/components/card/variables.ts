export default {
  smallImageX: {
    default: 280,
    'all3': 410,
    'cineflix': 370,
    'demo | discovery': 419,
  },
  smallImageY: {
    default: 175,
    'all3': 240,
    'ae | amc | itv | fremantle | wildbrain': 158,
    'cineflix': 198,
    'demo | discovery': 233,
  },
  mediumImageX: {
    default: 560,
  },
  mediumImageY: {
    default: 350,
    'ae | discovery | fremantle | itv': 315,
    'cineflix': 300,
    'demo': 311
  },
  largeImageX: {
    default: 840,
  },
  largeImageY: {
    default: 525,
    'itv': 472,
    'demo | discovery': 467,
  },
  tallImageX: {
    default: 280,
    'ae | banijaygroup | endeavor': 560,
  },
  tallImageY: {
    default: 250,
    'ae': 747,
    'banijaygroup | endeavor': 670,
  },
  productionCompanyImageX: {
    default: 380,
  },
  productionCompanyImageY: {
    default: 196,
    'discovery': 48,
  },
  peopleImageX: {
    default: 280,
    'all3 | banijaygroup': 300,
  },
  peopleImageY: {
    default: 280,
    'fremantle': 320,
    'discovery': 180,
    'banijaygroup': 360,
  },
  posterImageX: {
    default: 560,
    'ae': 355,
    'rtv': 370
  },
  posterImageY: {
    default: 315,
    'ae': 290,
    'rtv': 240
  },
  posterLargeImageX: {
    default: 560,
    'ae': 735
  },
  posterLargeImageY: {
    default: 315,
    'ae': 291,
  },
  cardMediaImageClasses: {
    default: 'card__media',
    'cineflix': 'card__media card__media--wide',
  },
  cardMediaImagePlaceholderClasses: {
    default: (video) => `${video && 'card__placeholder'} card__media`,
    'cineflix': (video) => 'card__media card__media--wide',
  },
  titleLogo: {
    default: true,
    'cineflix | endeavor': false,
  },
  tagsPutParentFirst: {
    default: false,
    'cineflix': true,
  },
  tagClasses: {
    default: (t) => `card__tag ${t.alt && 'card__tag--alt'}`,
    'all3': (t) => `card__tag ${t.alt && 'card__tag--alt'} ${t.name.toLowerCase() === 'restricted' && 'card__tag--restricted'}`,
    'banijaygroup':  (t) => `card__tag card__tag--${t.name.toLowerCase()}`,
    'cineflix | drg | discovery | endeavor | fremantle | itv | keshet':  (t) => `card__tag tag tag--${t.name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase()}`,

  },
  contentOrder: {
    default: ['title', 'date', 'tags', 'description'],
    'all3': ['subTitle', 'title', 'description', 'date', 'children', 'tags'],
    'endeavor | cineflix': ['date', 'title', 'tags', 'description'],
    'wildbrain': ['title', 'tags', 'description', 'date'],
    'drg': ['tags', 'title', 'children', 'date'],
    'itv | keshet': ['tags', 'title', 'date', 'description'],
    'ae | storylab': ['title', 'date', 'description', 'tags'],
    'discovery | fremantle': ['tags', 'title', 'description', 'date'],
  },
  renderChildren: {
    default: true,
    'all3 | drg': false,
  }
}
