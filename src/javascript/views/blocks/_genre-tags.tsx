import React from 'react'
import GenreTags from 'javascript/components/genre-tags'

const GenresTagsBlock = (block) => {
  return (
    <GenreTags title={block.title} catalogueLink={block.catalogueLink} genres={block.selectedGenres || []} />
  )
}

export default GenresTagsBlock
