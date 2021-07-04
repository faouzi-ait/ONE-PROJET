import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withUser from 'javascript/components/hoc/with-user'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import withTheme from 'javascript/utils/theme/withTheme'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import { ProgrammeType, ListType, ListProgrammeType, ListVideoType, ListSeryType, UserType } from 'javascript/types/ModelTypes'

import allClientVariables from './variables'

// Components
import ListCard from 'javascript/components/cards/list'

interface Props {
  recommendedList: ListType
  theme: ThemeType
  title?: string
  clientVariables: any
  listItems: (ListVideoType | ListProgrammeType | ListSeryType)[]
  programmes: ProgrammeType
  sharedByUser: UserType
}

const RecommendedList: React.FC<Props> = ({
  recommendedList,
  theme,
  title,
  clientVariables,
  listItems,
  programmes,
  sharedByUser
}) => {

  const renderList = () => {
    return (
      <div className={`grid ${clientVariables.cardsToShow === 4 ? 'grid--four' : 'grid--three'}`}>

        {(listItems.sort((a, b) => (a['list-position'] > b['list-position'] ? 1 : -1)).splice(0, clientVariables.cardsToShow) || []).map(r =>
          <ListCard
            resource={r}
            list={recommendedList}
            programmes={programmes}
            />
        )}
      </div>
    )
  }

  if(!recommendedList){
    return null
  }

  return (
    <div>
      { title && (
        <h2 className="content-block__heading">{ title }</h2>
      )}
      <h3 className="content-block__sub-heading">{`${recommendedList?.name } - Shared by ${sharedByUser?.['first-name']} ${sharedByUser?.['last-name']}`}</h3>
      { renderList() }
      <div className="actions__inner">
        <NavLink
          to={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}/my-${theme.variables.SystemPages.list.path}/${recommendedList?.id}`}
          className="button button--filled">{`View ${theme.localisation.list.lower}`}</NavLink>
      </div>
    </div>
  )
}

export const useRecommendedList = (props) => {
  const { user} = props
  const listResource = useResource('list')
  const [recommendedList, setRecommendedList] = useState(null)
  const [listItems, setListItems] = useState([])
  const programmeResource = useResource('programme')
  const userResource = useResource('user')
  const [sharedByUser, setSharedByUser] = useState(null)

  useEffect(() => {
    if(recommendedList && listItems){
      userResource.findOne(recommendedList['shared-by-id'], {
        fields: {
          users: 'first-name,last-name'
        },
      }).then((response) => {
        setSharedByUser(response)
      })
    }
  }, [recommendedList])

  useEffect(() => {
    if(!listItems){
      return
    }
    const programmeIds = listItems?.['list-videos']?.map(v => v['programme-id'])
    if(!programmeIds){
      return
    }
    programmeResource.findAll({
      filter: {
        ids: programmeIds.join(',')
      },
      include: 'genres',
      fields: {
        programmes: 'genres',
        genres: 'name'
      }
    })
  }, [listItems])

  useEffect(() => {
    const { wistia } = props.videoProviders
    const videos = ['name,poster,parent', wistia && 'wistia-thumbnail-url'].filter(Boolean).join(',')
    listResource.findAll({
      'include': 'list-programmes,list-programmes.programme,list-programmes.programme.genres,list-series,list-series.series,list-series.series.programme,list-series.series.programme.genres,list-videos,list-videos.video,list-videos.video.parent',
      'fields': {
        'lists': 'list-elements,name,programmes-count-without-restricted,videos-count-without-restricted,series-count,global,meeting-list,list-programmes,list-series,list-videos,shared-by-id',
        'list-programmes': 'programme,list-position',
        'list-videos': 'video,programme-id,list-position',
        'list-series': 'series,list-position',
        'programmes': 'thumbnail,title,short-description,genres',
        'series': 'name,short-description,programme',
        'genres': 'name',
        videos
      },
      filter:{
        'user_id': user.id,
        'shared_with_me': true
      },
      'page[size]': 1,
      sort: '-updated_at'
    }).then((response) => {
      setRecommendedList(response[0])
      setListItems([])
    })
  }, [])

  const resources = listResource.getDataAsArray() || []

  return {
    ...props,
    recommendedList,
    listItems: [...resources[0]?.['list-videos'] || [], ...resources[0]?.['list-series'] || [], ...resources[0]?.['list-programmes'] || []],
    sharedByUser,
    programmes: programmeResource.getDataAsArray() || []
  }
}

const enhanceWithFetch = compose(
  withTheme,
  withUser,
  withVideoProviders,
  withClientVariables('clientVariables', allClientVariables),
  withHooks(useRecommendedList),
)

export default enhanceWithFetch(RecommendedList)