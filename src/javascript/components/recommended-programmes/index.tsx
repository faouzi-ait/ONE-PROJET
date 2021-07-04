import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'
import programmeQuery from 'javascript/utils/queries/programmes'

import allClientVariables from './variables'
import catalogueCardsClientVariables from 'javascript/views/catalogue/variables'

// Components
import Button from 'javascript/components/button'
import ProgrammeCard from 'javascript/components/programme-card'

import { ProgrammeType, GenreScoreType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  addToList: (programme: ProgrammeType) => (e: any) => void
  recommendedProgrammes: ProgrammeType[]
  history: any
  theme: ThemeType
  viewAllPath?: string
  noResultsText?: string
  title?: string
  topGenreScore: GenreScoreType
  clientVariables: any
}

const RecommendedProgrammes: React.FC<Props> = ({
  addToList,
  recommendedProgrammes,
  history,
  theme,
  viewAllPath,
  noResultsText,
  title,
  topGenreScore,
  clientVariables
}) => {

  const viewAllClicked = () => {
    if (viewAllPath) {
      return history.push(viewAllPath)
    }
    const genreFilter = topGenreScore?.genre?.id ? `?filter[genre]=${topGenreScore.genre.id}` : ''
    history.push(`/${theme.variables.SystemPages.catalogue.path}${genreFilter}`)
  }

  const renderProgrammes = () => {
    const programmeCards = (recommendedProgrammes || []).map((programme) => (
      <ProgrammeCard programme={programme} addToList={addToList} />
    ))
    if (!programmeCards.length) {
      return (
        <div className="grid grid--justify">
          <span className="card__copy">
            {noResultsText || `There are no ${pluralize(theme.localisation.programme.lower)} to show`}
          </span>
        </div>
      )
    }
    return (
      <div className={`grid ${clientVariables.cardsToShow === 4 ? 'grid--four' : 'grid--three'}`}>
        {programmeCards}
      </div>
    )
  }

  return (
    <div>
      { title && (
        <h2 className="content-block__heading">{ title }</h2>
      )}
      { renderProgrammes() }
      { recommendedProgrammes?.length > 0 && (
        <div className="actions__inner">
          <Button onClick={viewAllClicked} className="button button--filled">View all</Button>
        </div>
      )}
    </div>
  )
}

export const useRecommendedProgrammes = (props) => {
  const { topGenreScore, theme, includeRestrictedProgrammes, catalogueCardsCV } = props
  const programmeResource = useResource('programme')

  const recommendedCV = useClientVariables(allClientVariables)

  let filter = {}
  if (!includeRestrictedProgrammes) {
    filter['restricted'] = false
  }

  useEffect(() => {
    const defaultQuery = programmeQuery(theme, catalogueCardsCV)
    if (!topGenreScore) {
      return /* Must wait for topGenreScore GET to complete - will remain null till it has.*/
    }
    if (topGenreScore.hasOwnProperty('genre')) {
      filter['genre'] = topGenreScore.genre.id
    }
    programmeResource.findAll({
      ...defaultQuery,
      'page[size]': recommendedCV.cardsToShow,
      sort: 'random',
      filter
    })
  }, [topGenreScore])

  return {
    recommendedProgrammes: programmeResource.getDataAsArray()
  }
}

export const useTopGenreScores = (props) => {
  const genreScoreResource = useResource('genre-score')
  const [topGenreScore, setTopGenreScore] = useState(null)
  const [topGenreScores, setTopGenreScores] = useState([])

  useEffect(() => {
    genreScoreResource.findAll({
      include: 'genre,genre.featured-programme',
      fields: {
        'genre-scores': 'score,genre',
        'genres': 'id,name,image,featured-programme',
        'programmes': 'title,introduction,promo-video-id,banner-urls,restricted'
      },
      'page[size]': '3'
    }).then((response) => {
      setTopGenreScores(response)
      setTopGenreScore(response[0] || {})
    })
  }, [])

  return {
    topGenreScores,
    topGenreScore
  }
}

const enhance = compose(
  withRouter,
  withTheme,
  withClientVariables('clientVariables', allClientVariables),
)

export const RecommendedProgrammesWithoutFetch = enhance(RecommendedProgrammes)

const enhanceWithFetch = compose(
  withRouter,
  withTheme,
  withClientVariables('clientVariables', allClientVariables),
  withClientVariables('catalogueCardsCV', catalogueCardsClientVariables),
  withHooks(useTopGenreScores),
  withHooks(useRecommendedProgrammes),
)

export default enhanceWithFetch(RecommendedProgrammes)