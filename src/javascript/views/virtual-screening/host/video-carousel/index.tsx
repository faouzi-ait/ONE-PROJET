import React from 'react'
import pluralize from 'pluralize'

import allClientVariables from './variables'
import compose from 'javascript/utils/compose'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useMediaQuery from 'javascript/utils/hooks/use-media-query'
import useVideoProviders from 'javascript/utils/hooks/use-video-providers'
import withModalRenderer, { WithModalType } from 'javascript/components/hoc/with-modal-renderer'
import withTheme, { WithThemeType } from 'javascript/utils/theme/withTheme'
import withUser, { WithUserType } from 'javascript/components/hoc/with-user'
import { isInternal } from 'javascript/services/user-permissions'

// Components
import Carousel from 'javascript/components/carousel'
import EmptySelection from 'javascript/views/virtual-screening/host/empty-selection'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'
import ModalVideo from 'javascript/components/modal-video'
import Programme from 'javascript/components/programme'

// Types
import { VideoType } from 'javascript/types/ModelTypes'

interface Props extends WithModalType, WithThemeType, WithUserType {
  displayProgrammeName?: boolean
  meetingIsLive: boolean
  onPresentVideo: (video: VideoType) => void
  presentationVideo: VideoType
  videos: VideoType[]
}

const VideoSelector: React.FC<Props> = ({
  displayProgrammeName,
  meetingIsLive,
  modalState,
  onPresentVideo,
  presentationVideo,
  theme,
  user,
  videos,
}) => {

  const largeScreen = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)')
  const { wistia } = useVideoProviders()
  const {
    carouselClasses
  } = useClientVariables(allClientVariables)

  const openVideoModal = (video) => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal delay={500} closeEvent={hideModal} modifiers={['video']}>
          <h3 className="modal__title">{video.name}</h3>
          <ModalVideo video={video} closeVideo={hideModal} />
        </Modal>
      )
    })
  }

  const renderVideo = (video, i) => {
    let thumbnail = video.poster.small.url
    let provider = null
    if (wistia && thumbnail === null) {
      thumbnail = video['wistia-thumbnail-url']
      provider = "wistia"
    }

    const seriesOrProgrammeName = video['series-name'] || (displayProgrammeName && video['programme-name']) || ''
    return (
      <div className={['virtual-asset-search__video-article', presentationVideo?.id === video.id && 'selected'].filter(Boolean).join(' virtual-asset-search__video-article--')}>
        <Programme
          classes={carouselClasses} provider={provider} href={video.id} poster={thumbnail}
          video={true} key={video.id} restricted={video.restricted && user && isInternal(user)}
          onClick={e => {
            e.preventDefault()
            openVideoModal(video)
          }}
        >
          <div className={'virtual-asset-search__video-copy'}>
            {meetingIsLive && (
              <div className={'virtual-asset-search__present-button'}>
                <button
                  type="button"
                  onClick={() => onPresentVideo(video)}
                >
                  <Icon id="i-present-video" />
                </button>
              </div>
            )}
            <div className="virtual-asset-search__titles">
              <h1
                className={['virtual-asset-search__titles-name', video.name?.length > 25 && 'ellipsis'].filter(Boolean).join(' virtual-asset-search__titles-name--')}
                data-title={video.name}
              >
                <span>{video.name}</span>
              </h1>
              {seriesOrProgrammeName &&
                <div
                  className={['virtual-asset-search__titles-desc', seriesOrProgrammeName.length > 25 && 'ellipsis'].filter(Boolean).join(' virtual-asset-search__titles-desc--')}
                  data-title={seriesOrProgrammeName}
                >
                  {seriesOrProgrammeName}
                </div>
              }
            </div>
          </div>
        </Programme >
      </div>
    )
  }

  if (videos?.length) {
    return (
      <Carousel
        options={{
          arrows: true,
          scrollBar: true,
          slidesToShow: largeScreen ? 3 : 4,
          groups: true,
        }}
      >
        {videos.map(renderVideo)}
      </Carousel>
    )
  }
  return (
    <EmptySelection
      message={
        `There are no ${pluralize(theme.localisation.video.lower)} available to share, try selecting a ${
        theme.localisation.programme.lower} with ${pluralize(theme.localisation.video.lower)}.`
      }
    />
  )
}

const enhance = compose(
  withTheme,
  withUser,
  withModalRenderer
)

export default enhance(VideoSelector)

export const getVideosForVideoSelector = (videoProviders) => {
  const { brightcove, comcast, jwplayer, knox, wistia } = videoProviders
  return [
    'programme-id,programme-name,series-id,series-name,episode-id,episode-name,name',
    'poster,restricted',
    wistia && 'wistia-id',
    brightcove && 'brightcove-id',
    knox && 'knox-uuid',
    jwplayer && 'jwplayer-id',
    comcast && 'comcast-platform-id',
  ].filter(Boolean).join(',')
}
