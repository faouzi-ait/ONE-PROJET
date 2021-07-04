const categoriesQuery = {
  include: 'programme-highlights,programme-highlights.programme,genre',
  fields: {
    'programme-highlight-categories': 'name,position,programme-highlights,genre',
    'programme-highlights': 'programme,position',
    'programmes': 'title,thumbnail',
    'genres': 'name'
  }
}

export default categoriesQuery