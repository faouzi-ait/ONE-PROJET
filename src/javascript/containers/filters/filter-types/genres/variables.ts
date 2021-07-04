export default {
  genreTagClasses: {
    default: 'tag',
    'all3': 'tag tag--brand'
  },
  checkboxFilterClasses: {
    default: '',
    'all3': 'checkbox-filters'
  },
  genreSortOrder: {
    default: 'name',
    'itv': 'position'
  },
  genreTitle: {
    default: false,
    'ae': 'Sub-Genres',
    'cineflix': 'Genre'
  },
  subGenreToggleText: {
    default: (genre) => `sub-${genre}`,
    'fremantle': (genre) => genre
  },
  showSelectedGenres: {
    default: true,
    'ae': false
  },  
  openFirstGenre: {
    default: false,
    'ae': true
  }
}