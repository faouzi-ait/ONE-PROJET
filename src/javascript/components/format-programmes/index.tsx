import React from 'react'
import { withRouter } from 'react-router-dom'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

import recentlyViewedClientVariables from 'javascript/components/recently-viewed/variables'
import allClientVariables from './variables'

// Components
import Carousel from 'javascript/components/carousel'
import ProgrammeCard from 'javascript/components/programme-card'

import { ProgrammeType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  addToList: (programme: ProgrammeType) => (e: any) => void
  history: any
  theme: ThemeType
  programmes?: ProgrammeType[]
  clientVariables: any
  carouselClientVariables: any
  formatIds: string
}

const FormatProgrammes: React.FC<Props> = ({
  addToList,
  history,
  theme,
  programmes,
  clientVariables,
  carouselClientVariables
}) => {

  const renderProgrammes = () => {
    const programmeCards = (programmes || []).map((programme) => (
      <ProgrammeCard programme={programme} addToList={addToList} />
    ))
    return (
        <Carousel
          classes={['recent']}
          options={{
            ...carouselClientVariables.carouselOptionsDefault,
            ...clientVariables.carouselOptionsOverrides
          }}
          responsive={[{
            breakpoint: 1024,
            options: {
              ...carouselClientVariables.carouselOptionsLarge,
              ...clientVariables.carouselOptionsOverridesLarge
            }}, {
            breakpoint: 768,
            options: carouselClientVariables.carouselOptionsMedium
          }, {
            breakpoint: 568,
            options: carouselClientVariables.carouselOptionsSmall
          }]}
        >
          {programmeCards}
        </Carousel>
    )
  }

  return (
    <section className={clientVariables.sectionClasses}>
      <div className="container">
        <h1 className="section__header">{clientVariables.headingText}</h1>
      </div>
      { renderProgrammes() }
    </section>
  )
}

const enhance = compose(
  withRouter,
  withClientVariables('carouselClientVariables', recentlyViewedClientVariables),
  withClientVariables('clientVariables', allClientVariables)
)

export default enhance(FormatProgrammes)