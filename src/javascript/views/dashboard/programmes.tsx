import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import withUser from 'javascript/components/hoc/with-user'

// Components
import Tabs from 'javascript/components/tabs'
import {
  RecommendedProgrammesWithoutFetch,
  useRecommendedProgrammes
} from 'javascript/components/recommended-programmes'

// Types
import { ProgrammeType, UserType, GenreScoreType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  addToList: (resource: any) => () => void
  recommendedProgrammes: ProgrammeType[]
  theme: ThemeType
  topGenreScore: GenreScoreType
  user: UserType
}

const DashboardProgrammes: React.FC<Props> = ({
  addToList,
  recommendedProgrammes,
  theme,
  topGenreScore,
  user,
}) => {

  const [loaded, setLoaded] = useState(false)
  const [tabPosition, setTabPosition] = useState(0)
  const [sharedProgrammes, setSharedProgrammes] = useState(null)
  const userProgrammeResource = useResource('user-programme')

  useEffect(() => {
    if (user?.id) {
      const userRelation = {
        name: 'user',
        id: user.id,
      }
      userProgrammeResource.findAllFromOneRelation(userRelation, {
        include: 'programme,programme.genres,programme.custom-attributes,programme.custom-attributes.custom-attribute-type',
        fields: {
          programmes: [
            'id,title,thumbnail,short-description,genres,introduction,data,custom-attributes',
            theme.features.programmeOverview?.logoTitle && 'logo',
            theme.features.programmeOverview?.episodeTag && 'number-of-episodes'
          ].filter(Boolean).join(','),
          genres: 'name,parent-id',
          'custom-attributes': 'custom-attribute-type,value,position'
        },
        'filter[restricted]': false,
        'page[size]': '4',
        sort: '-created-at'
      })
      .then((response) => {
        setSharedProgrammes(response.map((userProgramme) => userProgramme.programme))
      })
    }
  }, [user])

  useEffect(() => {
    setLoaded(!!(sharedProgrammes && recommendedProgrammes))
  }, [sharedProgrammes, recommendedProgrammes])


  const renderProgrammes = () => {
    if (!loaded) return
    let props = {
      addToList,
      topGenreScore
    } as any
    if (tabPosition === 0) {
      props = {
        ...props,
        recommendedProgrammes
      }
    } else {
      props = {
        ...props,
        recommendedProgrammes: sharedProgrammes,
        viewAllPath: `/${theme.variables.SystemPages.dashboard.path}/programmes`,
        noResultsText: `There are no ${pluralize(theme.localisation.programme.lower)} shared with you`
      }
    }
    return (
      <RecommendedProgrammesWithoutFetch {...props} />
    )
  }

  return (
    <section className="section section--shade">
      <div className="container">
        <h2 className="content-block__heading">{ pluralize(theme.localisation.programme.upper) }</h2>
        <Tabs onChange={(e) => setTabPosition(e.value)} >
          <div title="By Activity"></div>
          <div title="By Account Manager"></div>
        </Tabs>
        { renderProgrammes() }
      </div>
    </section>
  )
}

const enhance = compose(
  withUser,
  withTheme,
  withHooks(useRecommendedProgrammes)
)

export default enhance(DashboardProgrammes)