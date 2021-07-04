import React, { useEffect, useState, useMemo } from 'react'
import pluralize from 'pluralize'
import { NavLink } from 'react-router-dom'
import { isInternal } from 'javascript/services/user-permissions'

import allClientVariables from './variables'

// Hooks
import compose from 'javascript/utils/compose'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useSortedVideos from 'javascript/utils/hooks/use-sorted-videos'
import withTheme from 'javascript/utils/theme/withTheme'
import withUser from 'javascript/components/hoc/with-user'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

// Component
import BulkActionManager from 'javascript/components/bulk-selection/bulk-action-manager'
import BulkActionButton from 'javascript/components/bulk-selection/actions/bulk-action-button'
import BulkToggleBox from 'javascript/components/bulk-selection/selectors/bulk-toggle-box'
import Icon from 'javascript/components/icon'
import Programme from 'javascript/components/programme'
import Carousel, { BlankCarouselItem } from 'javascript/components/carousel'
import CustomSelect from 'javascript/components/custom-select'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientChildWrapper from 'javascript/utils/client-switch/components/client-child-wrapper'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'

// Types
import VideoProviders from 'javascript/types/VideoProviders'
import { ProgrammeType, UserType, VideoType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'


interface Props {
  addToList: (resource: Partial<VideoType>[]) => any
  programme: ProgrammeType
  public: boolean
  user: UserType
  openModal: (video: VideoType) => void
  openFormModal: (video: VideoType) => void
  theme: ThemeType
  token?: string
  videoProviders: VideoProviders,
}

const VideoCarousel: React.FC<Props> = ({
  programme,
  public: isPublic,
  addToList,
  user,
  openModal,
  openFormModal,
  theme,
  token,
  videoProviders,
}) => {

  const videoCarouselCV = useClientVariables(allClientVariables, {
    seriesOptionsLabel: {
      default: 'All',
      'fremantle': `All ${pluralize(theme.localisation.series.upper)}`
    },
    languagesOptionsLabel: {
      default: 'All Languages',
    },
    videoTypeOptionsLabel: {
      default: 'All Types',
    }
  })

  const [revision, setRevision] = useState(0)
  const sortedVideos = useSortedVideos({ pageSize: videoCarouselCV.carouselEnabled ? 5 : 'all' })
  const availableSeries = sortedVideos.getAvailableSeries()
  const availableLanguages = sortedVideos.getAvailableLanguages()
  const availableVideoTypes = sortedVideos.getAvailableVideoTypes()
  const selectedVideos = sortedVideos.getCurrentSortedVideos()

  useEffect(() => {
    if (programme?.id) {
      sortedVideos.resetInitialState({ programmeId: programme.id, token, isPublic, preSelectMetaOnly: videoCarouselCV.preSelectedFilters })
    }
  }, [programme?.id])

  const generateOptions = (arr, allLabel) => ([
    {
      value: 'all',
      label: allLabel,
    },
    ...arr.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  ])

  const avaliableSeriesOptions = useMemo(() => {
    return generateOptions(availableSeries, videoCarouselCV.seriesOptionsLabel)
  }, [JSON.stringify(availableSeries)])

  const availableLanguageOptions = useMemo(() => {
    return generateOptions(availableLanguages, videoCarouselCV.languagesOptionsLabel)
  }, [JSON.stringify(availableLanguages)])

  const availableVideoTypeOptions = useMemo(() => {
    return generateOptions(availableVideoTypes, videoCarouselCV.videoTypeOptionsLabel)
  }, [JSON.stringify(availableVideoTypes)])

  const fetchVideoResourcesFor = (type: 'series' | 'languages' | 'videoTypes') => ({target}) => {
    switch (type) {
      case 'series': {
        sortedVideos.setSelectedSeries(target.value)
        setRevision(revision + 1)
        break
      }
      case 'languages': {
        sortedVideos.setSelectedLanguage(target.value)
        break
      }
      case 'videoTypes': {
        sortedVideos.setSelectedVideoType(target.value)
        break
      }
    }
  }

  const showAddToListButton = !isPublic && selectedVideos.length > 0
  const carouselActivePosition = sortedVideos.getActivePosition()

  const renderVideo = () => {
    let lastAvailableGroup = ''
    return (video, index) => {
      if (videoCarouselCV.carouselEnabled && (index > carouselActivePosition + 30 || index < carouselActivePosition - 30)) {
        return <BlankCarouselItem key={`blank_${index}`} group={lastAvailableGroup} />
      }

      if (video.type === 'not_fetched') {
        return (
          <BlankCarouselItem key={`blank_${index}`} loading={true} group={lastAvailableGroup}/>
        )
      }
      let thumbnail = video.poster?.small?.url
      let provider = null

      const group = video['series-id']
        ? (
            availableSeries.find(
              _series => Number(_series.id) === video['series-id'],
            ) || {}
          ).name || programme.title
        : programme.title

      lastAvailableGroup = group

      if (videoProviders.wistia && thumbnail === null) {
        thumbnail = video['wistia-thumbnail-url']
        provider = "wistia"
      }

      return (
        <Programme group={group} classes={index + ' ' + videoCarouselCV.carouselClasses(isPublic)} provider={provider} href={`${getProgrammePath(programme, theme)}/${video.id}`} poster={thumbnail}
          video={true} key={video.id} restricted={video.restricted && user && isInternal(user)}
          onClick={e => {
            e.preventDefault()
            openModal(video)
          }}
        >
          <h1 className={(videoCarouselCV.scrollingTitle && theme.features.cards && video.name?.length > theme.features.cards.ellipsisLength) ? 'programme__title programme__title--ellipsis' : 'programme__title'} data-title={video.name}>
            <span>{video.name}</span>
          </h1>
          {!videoCarouselCV.carouselEnabled && group &&
            <h2 className="programme__copy">{group}</h2>
          }

          { showAddToListButton && addToList &&
            <div className="programme__actions">
              <BulkToggleBox id={video.id} childButtonClasses={videoCarouselCV.addListClasses} >
                <ClientChoice>
                  <ClientSpecific client="default">
                    <Icon id="i-add-to-list" />
                  </ClientSpecific>
                  <ClientSpecific client="drg">
                    <span className="button-circle__icon"><Icon id="i-add-to-list" /></span>
                  </ClientSpecific>
                  <ClientSpecific client="cineflix">
                    <Icon id="i-add" />
                  </ClientSpecific>
                </ClientChoice>
              </BulkToggleBox>
            </div>
          }

          {theme.features.videos.watermarked && user && video.downloadable &&
            <button onClick={()=>openFormModal(video)} className="text-button" type="button">{videoCarouselCV.watermarkLinkText}</button>
          }
        </Programme >
      )
    }
  }

  let { sectionClasses } = videoCarouselCV

  if (sortedVideos.videosAreLoaded() && !sortedVideos.getAllSortedVideosLength() && videoCarouselCV.carouselEnabled) {
    return null
  }

  const showvideoControls = theme.features.videos.types ||
    avaliableSeriesOptions?.length > 1 ||
    (theme.features.videos.languages && availableLanguageOptions?.length) ||
    (showAddToListButton && addToList)

  return (
    <ClientChildWrapper client="keshet"
      outerWrapper={(children) => (
        <div className='video-carousel'>{children}</div>
      )}
    >
      <section className={sectionClasses}>
        <div className={`video-carousel ${!user && !token && 'video-carousel--logged-out'}`}>
          <ClientChildWrapper client="drg"
            outerWrapper={(children) => (
              <div className='u-mb'>{children}</div>
            )}
          >
            {showvideoControls &&
              <div className={videoCarouselCV.carouselContainerClasses}>
                <div className="video-carousel__controls">
                  <ClientSpecific client="ae">
                    <h2 className="video-carousel__heading">{avaliableSeriesOptions.length > 1 ? 'Watch by season': 'Watch'}</h2>
                  </ClientSpecific>
                  <div className="video-carousel__select-filters">

                    <div className="video-carousel__select-filter-row">
                      { theme.features.videos.types && (
                        <div className="video-carousel__select">
                          <span className="video-carousel__label">Type:</span>
                          <CustomSelect
                            disabled={availableVideoTypeOptions.length < 2}
                            placeholder={false}
                            onChange={fetchVideoResourcesFor('videoTypes')}
                            options={availableVideoTypeOptions}
                            value={sortedVideos.getSelectedVideoType()}
                          />
                        </div>
                      )}
                    </div>

                    <div className="video-carousel__select-filter-row">
                      {avaliableSeriesOptions?.length > 1 &&
                        <div className="video-carousel__select">
                          <ClientChoice>
                            <ClientSpecific client="default">
                              <span className="video-carousel__label">{pluralize(theme.localisation.series.upper)}:</span>
                            </ClientSpecific>
                            <ClientSpecific client="keshet">
                              <span className="video-carousel__label">Show me:</span>
                            </ClientSpecific>
                          </ClientChoice>
                          <CustomSelect
                            placeholder={false}
                            onChange={fetchVideoResourcesFor('series')}
                            options={avaliableSeriesOptions}
                            value={sortedVideos.getSelectedSeries()}
                          />
                        </div>
                      }
                      {theme.features.videos.languages && availableLanguageOptions?.length > 1 &&
                        <div className="video-carousel__select">
                          <CustomSelect
                            placeholder={false}
                            onChange={fetchVideoResourcesFor('languages')}
                            options={availableLanguageOptions}
                            value={sortedVideos.getSelectedLanguage()}
                          />
                        </div>
                      }
                    </div>
                  </div>
                  { showAddToListButton && addToList &&
                    <BulkActionManager
                      hits={sortedVideos.getCurrentVideoHits() as any[]}
                      renderAsFEWidget={true}
                      resourceName={theme.localisation.video.lower}
                      clearButtonClasses={videoCarouselCV.bulkActionClearButtonClasses}
                      renderActions={(disabled) => (
                        <BulkActionButton
                          className={videoCarouselCV.bulkActionAddToListButtonClasses}
                          disabled={disabled}
                          label={`Add to ${theme.localisation.list.lower}`}
                          bulkAction={(selectedVideoIds) => {
                            return addToList(selectedVideoIds.map((videoId) => ({
                              id: videoId,
                              type: 'videos'
                            })))()
                          }}
                        />
                      )}
                    />
                  }
                </div>
              </div>
            }
          </ClientChildWrapper>

          {videoCarouselCV.carouselEnabled ? (
            <LoaderWhilstWaiting>
              <Carousel
                revision={revision}
                options={{
                  arrows: true,
                  scrollBar: true,
                  slidesToShow: videoCarouselCV.optionsSlidesToShow,
                  ...videoCarouselCV.optionOverrides
                }}
                responsive={[{
                    breakpoint: 1024,
                    options: {

                      ...videoCarouselCV.largeOptionOverrides
                    }
                  }, {
                    breakpoint: 768,
                    options: {
                      slidesToShow: 2,
                      ...videoCarouselCV.mediumDots,
                      ...videoCarouselCV.mediumPager,
                    }
                  }, {
                    breakpoint: 568,
                    options: {
                      slidesToShow: 1
                    }
                  }
                ]}
                carouselActivePosition={carouselActivePosition}
                onChange={(value) => {
                  sortedVideos.setActivePosition(value)
                }}
              >
                {selectedVideos.map(renderVideo())}
              </Carousel>
            </LoaderWhilstWaiting>
          ) : (
            <div className="container">
              <ClientChoice>
                <ClientSpecific client="default">
                  <LoaderWhilstWaiting>
                    {selectedVideos?.length > 0 && (
                      <div className={`grid ${!user && !token ? 'grid--two' : 'grid--four'}`}>
                        {selectedVideos.map(renderVideo())}
                      </div>
                    )}
                  </LoaderWhilstWaiting>
                </ClientSpecific>
                <ClientSpecific client="fremantle">
                  <LoaderWhilstWaiting>
                    { sortedVideos.videosAreLoaded() && selectedVideos?.length === 0 ? (
                      <>
                        {!user && !token ? (
                          <>
                            <p className="video-carousel__copy" style={{ fontSize: '27px'}}>
                              Welcome to
                              <span className="video-carousel__copy--bold">Fremantle Screenings:</span>
                              the home of Irresistible Entertainment for buyers and commissioners.</p>
                            <p className="video-carousel__copy">
                              <span className="video-carousel__copy--bold" style={{ paddingLeft: '0px'}}>
                                You need to
                                <NavLink className="text-button text-button--underline" to={`/${theme.variables.SystemPages.login.path}`} style={{ padding: '0 5px' }}>log in</NavLink>
                                to view video content.
                              </span>
                              Once you have entered your username and password you'll stay logged in for future visits, so you only need to do this once.
                            </p>
                            <p className="video-carousel__copy">
                              If you were previously registered on
                              <span className="video-carousel__copy--bold">www.fmscreenings.com</span>
                              you'll need to
                              <NavLink className="text-button text-button--underline" to={`/${theme.variables.SystemPages.forgottenPassword.path}`} style={{ padding: '0 5px' }}>reset your password</NavLink>
                              before you can log in. (All of your other details remain the same.)
                            </p>
                            <p className="video-carousel__copy">
                              If you're a new visitor you'll need to
                              <NavLink className="text-button  text-button--underline" to={`/${theme.variables.SystemPages.register.path}`}  style={{ padding: '0 5px' }}>register</NavLink>
                              for an account.
                            </p>
                          </>
                        ) : (
                          <p className="video-carousel__copy">There are no videos available for this selection. Try clearing any filters applied or browse our catalogue</p>
                        )}
                      </>
                    ) : (
                      <div className={`grid ${!user && !token ? 'grid--two' : 'grid--four'}`}>
                        {selectedVideos.map(renderVideo())}
                      </div>
                    )}
                  </LoaderWhilstWaiting>
                </ClientSpecific>
              </ClientChoice>
            </div>
          )}
        </div>
      </section>
    </ClientChildWrapper>
  )
}

const enhance = compose(
  withUser,
  withTheme,
  withVideoProviders,
)
export default enhance(VideoCarousel)


const LoaderWhilstWaiting = ({children}) => {
  const sortedVideos = useSortedVideos()
  return (
    <>
      {sortedVideos.videosAreLoaded() ? (
        <>
          {children}
        </>
      ) : (
        <div className="container" style={{ height: '110px', position: 'relative' }}>
          <div className="loader" />
        </div>
      )}
    </>
  )
}