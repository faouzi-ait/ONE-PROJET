export default {
  programmeCardDescription: {
    default: (value) => value,
    'ae | amc | fremantle': (value) => null
  },
  programmeCardIntro: {
    default: (value) => null,
    'fremantle': (value) => value
  },
  programmeCardSize: {
    default: null,
    'banijaygroup': 'tall'
  },
  videoCardMainTitle: {
    default: 'videoName',
    'all3': 'programmeName',
    'amc': undefined
  },
  videoCardSmallTitle: {
    default: 'programmeName',
    'all3': 'videoName',
  },
  videoCardCopy: {
    default: 'seriesName',
  },
  videoCardOrder: {
    default: ['cardSmallTitle', 'cardCopy'],
    'ae | all3': ['cardSmallTitle'],
    'amc': ['amcCustomContent'],
    'fremantle': ['fremantleCustomContent'],
  },
  seriesCardMainTitle: {
    default: 'seriesName',
    'amc': undefined
  },
  seriesCardCopy: {
    default: 'seriesDescription',
  },
  seriesCardSmallTitle: {
    default: 'programmeName',
  },
  seriesCardOrder: {
    default: ['cardSmallTitle', 'cardCopy'],
    'ae': ['cardSmallTitle'],
    'amc': ['amcCustomContent'],
    fremantle: [],
  },
  seriesCardIntro: {
    default: (value) => null,
    'fremantle': (value) => value
  },
  seriesCardTitle: {
    default: (value) => value,
    'amc | seven': (value) => null
  },
  iconsOutside: {
    default: false,
    'banijaygroup': true
  },
  displayRestrictedWithTags: {
    default: false,
    'all3 | discovery': true
  },
}