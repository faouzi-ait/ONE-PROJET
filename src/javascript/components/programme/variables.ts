export default {
  cardImageSize: {
    default: () => 'small',
    'banijaygroup': (video) => video ? 'small' : 'tall',
    'ae | itv | fremantle': () => 'medium'
  },
  showPlayIcon: {
    default: true,
    'ae': false
  }
}