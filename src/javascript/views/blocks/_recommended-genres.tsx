import React from 'react'

import UserStore from 'javascript/stores/user'

import RecommendedGenres from 'javascript/components/recommended-genres'

import compose from 'javascript/utils/compose'
import { useTopGenreScores } from 'javascript/components/recommended-programmes'
import withHooks from 'javascript/utils/hoc/with-hooks'

const RecommendedGenresBlock = (block, props) => {
  const user = UserStore.getUser()
  if (!user) return null
  return (
    <RecommendedTopGenres title={block.title} />
  )
}

const DisplayRecommendedGenres = ({
  title,
  topGenreScores = []
}) => (
   <RecommendedGenres
    title={title}
    topGenres={topGenreScores.map((genreScore) => genreScore.genre)}
   />
)

const enhance = compose(
  withHooks(useTopGenreScores)
)

const RecommendedTopGenres = enhance(DisplayRecommendedGenres)

export default RecommendedGenresBlock
