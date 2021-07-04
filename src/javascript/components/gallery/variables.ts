export default {
  thumbnailImageSizesWidth: {
    default: 350,
    'ae': 444,
    'discovery | banijaygroup | endeavor': 380
  },
  thumbnailImageSizesHeight: {
    default: 280,
    'ae': 250,
    'cineflix': 350,
    'discovery': 215
  },
  carouselDefaultOptions: {
    default: {
      slidesToShow: 5,
    },
    'ae': {
      arrows: true,
      scrollBar: false,
      slidesToShow: 3
    },
    'all3': {
      arrows: true,
      scrollBar: false,
      slidesToShow: 4,
    },
    'banijaygroup | cineflix | discovery | endeavor | fremantle | keshet': {
      slidesToShow: 3
    }
  },
  carouselMediumOptions: {
    default: {
      slidesToShow: 4,
    },
    'ae | banijaygroup | cineflix | discovery | endeavor | fremantle | keshet': {
      slidesToShow: 3
    }
  },
}