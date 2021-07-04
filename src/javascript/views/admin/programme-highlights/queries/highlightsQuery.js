const highlightsQuery = {
  include: 'programme',
  fields: {
    'programme-highlights': 'position,programme',
    programmes: 'title,thumbnail',
  },
  filter: {
    highlight_category: 'nil',
    // highlight_pages: 'nil',
  },
}

export default highlightsQuery