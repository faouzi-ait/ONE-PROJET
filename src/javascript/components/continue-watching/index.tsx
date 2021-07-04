import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'

import allClientVariables from './variables'

// Components
import Programme from 'javascript/components/programme'
import PageLoader from 'javascript/components/page-loader'
import { findAllByModel } from 'javascript/utils/apiMethods'

import { VideoViewType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

interface RecentlyViewedVideos {
  fetchStatus: {
    loaded: boolean
    errored: boolean
  },
  resources: VideoViewType[]
}
interface Props {
  recentlyViewedVideos: RecentlyViewedVideos
  title?: string
  theme: ThemeType
  clientVariables: any
}

const ContinueWatching: React.FC<Props> = ({
  recentlyViewedVideos,
  title = 'Recently Viewed',
  theme,
  clientVariables
}) => {

  const { resources, fetchStatus } = recentlyViewedVideos

  const findProgrammePath = (video) => {
    return theme?.features.programmeSlugs.enabled ? video['programme-slug'] : video['programme-id']
  }

  const renderVideos = () => {
    if (!fetchStatus.loaded) return
    let videoCards = resources.map(videoView => {
      const { video } = videoView
      const url = `/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath(video)}/${video.id}`
      return (
        <Programme href={url}
          classes={'programme programme--with-actions programme--with-single-action'}
          poster={video.poster?.small.url}
          video={true} k
          ey={video.id}
        >
          <h1 className="programme__copy">{video['programme-name']}</h1>
          <div
            className={
              theme.features.cards &&
              video.name.length > theme.features.cards.ellipsisLength
                ? 'programme__title programme__title--small programme__title--ellipsis'
                : 'programme__title programme__title--small'
            }
            data-title={video.name}
          >
            <span>{video.name}</span>
          </div>
        </Programme>
      )
    })
    if (!videoCards.length) {
      const noVideosMsg = `You have no recently watched ${pluralize(
        theme.localisation.video.lower,
      )}`
      return (
        <div className="grid">
          <span className="card__title">
            {noVideosMsg}
          </span>
        </div>
      )
    }
    return (
      <VideoCarouselDiv className="video-carousel">
        <CarouselDiv className={`grid ${clientVariables.cardsToShow === 4 ? 'grid--four' : 'grid--three'} carousel`}>{videoCards}</CarouselDiv>
      </VideoCarouselDiv>
    )
  }

  return (
    <>
      <h2 className="content-block__heading">{title}</h2>
      <PageLoader {...fetchStatus}>
        {renderVideos()}
      </PageLoader>
    </>
  )

}

const useRecentlyViewedVideos = (props) => {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const [resources, setResources] = useState([])

  const continueCV = useClientVariables(allClientVariables)

  useEffect(() => {
    findAllByModel('video-views', {
      include: ['video'],
      fields: ['video'],
      includeFields: {
        videos: [
          'name','programme-name','poster',
          props.theme.features.programmeSlugs.enabled ? 'programme-slug': 'programme-id'
        ]
      },
      page: {
        size: continueCV.cardsToShow,
      },
      filter: {
        'recently-watched': true,
      },
    })
    .then(resources => {
      setLoaded(true)
      setResources(resources)
    })
    .catch(e => {
      setErrored(true)
    })
  }, [])

  return {
    recentlyViewedVideos: {
      fetchStatus: {
        loaded,
        errored
      },
      resources,
    }
  }
}

const enhance = compose(
  withTheme,
  withHooks(useRecentlyViewedVideos),
  withClientVariables('clientVariables', allClientVariables),
)

export default enhance(ContinueWatching)


const VideoCarouselDiv = styled.div`
  margin-top: 0px !important;
  background-color: transparent !important;
  padding-bottom: 0px !important;
  &:before {
    background: none !important;
  }
`

const CarouselDiv = styled.div`
  background-color: transparent !important;
`