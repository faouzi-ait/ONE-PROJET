import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'

import allClientVariables from './variables'

import compose from 'javascript/utils/compose'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import useResource from 'javascript/utils/hooks/use-resource'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'

import catalogueCardsClientVariables from 'javascript/views/catalogue/variables'

import programmeQuery from 'javascript/utils/queries/programme-search-card'

// Components
import ProgrammeCard from 'javascript/components/programme-card'
import Carousel from 'javascript/components/carousel'

import { ProgrammeType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  addToList: (programme: ProgrammeType) => (e: any) => void
  mostPopularProgrammes: ProgrammeType[]
  theme: ThemeType
  noResultsText?: string
  title?: string
}

const MostPopular: React.FC<Props> = ({
  addToList,
  mostPopularProgrammes,
  theme,
  noResultsText,
  title,
}) => {

  const mostPopularCV = useClientVariables(allClientVariables)

  const renderProgrammes = () => {
    if (!mostPopularProgrammes?.length) {
      return (
        <div className="grid grid--justify">
          {noResultsText || `There are no ${pluralize(theme.localisation.programme.lower)} to show`}
        </div>
      )
    }
    return (
      <Carousel
        options={{
          arrows: true,
          scrollBar: true,
          fullWidth: true,
          ...mostPopularCV.carouselDefaultOptions,
        }}
        responsive={[{
            breakpoint: 1024,
            options: {
              arrows: false,
              dots: true,
              scrollBar: false,
              ...mostPopularCV.carouselLargeOptions,
            }
          }, {
            breakpoint: 768,
            options: {
              slidesToShow: 2,
              ...mostPopularCV.carouselMediumOptions,
            }
          }, {
            breakpoint: 568,
            options: {
              slidesToShow: 1
            }
          }
        ]}
      >
        {(mostPopularProgrammes || []).map((programme) => (
          <ProgrammeCard programme={programme} addToList={addToList} />
        ))}
      </Carousel>
    )
  }

  return (
    <div>
      { title && (
        <h2 className="content-block__heading">{ title }</h2>
      )}
      { renderProgrammes() }
    </div>
  )
}

export const useMostPopularProgrammes = (props) => {
  const { theme } = props
  const programmeSearchResource = useResource('programme-search-result')
  const [mostPopularProgrammes, setMostPopularProgrammes] = useState()
  const defaultQuery = programmeQuery(theme, props.catalogueCardsCV)
  useEffect(() => {
    programmeSearchResource.findAll({
      ...defaultQuery,
      'page[size]': '10',
      'sort': '-popularity'
    })
    .then((results) => {
      setMostPopularProgrammes(results.map((result) => result.programme))
    })
  }, [])

  return {
    mostPopularProgrammes
  }
}

const enhance = compose(
  withTheme,
  withHooks(useMostPopularProgrammes),
  withClientVariables('catalogueCardsCV', catalogueCardsClientVariables),
)

export default enhance(MostPopular)
