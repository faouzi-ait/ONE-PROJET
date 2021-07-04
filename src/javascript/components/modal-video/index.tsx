import React, { Component } from 'react'
import { withRouter } from 'react-router'
import styled, { css } from 'styled-components'
import queryString from 'query-string'

import allClientVariables from './variables'
import compose from 'javascript/utils/compose'
import { isCms } from 'javascript/utils/generic-tools'
import {
  updateOneByModel,
  createOneByModel,
  query,
} from 'javascript/utils/apiMethods'

// Components
import AutocueModal from 'javascript/components/autocue-modal'
import BrightcovePlayer from 'javascript/components/brightcove-player'
import Button from 'javascript/components/button'
import JWPlayer from 'javascript/components/jwplayer'
import Mp4VideoPlayer from 'javascript/components/mp4-video-player'
import WistiaPlayer from 'javascript/components/wistia-player'
import KnoxPlayer from 'javascript/components/knox-player'

// Hooks
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import useSortedVideos from 'javascript/utils/hooks/use-sorted-videos'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

//Types
import { VideoType, VideoViewType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import VideoProviders from 'javascript/types/VideoProviders'

interface Props {
  video: VideoType
  closeVideo?: () => void
  autocueVideosPlayed: number
  playNextAutocueVideo: () => void
  selectedVideos: VideoType[]
  setActivePosition: (activePosition: number) => void
  location: any
  isFullWidthModal?: boolean
  shouldIgnoreResumeModal?: boolean
  theme: ThemeType
  videoProviders: VideoProviders,
  allClientVariables?: any
}

type Status = 'initial' | 'playingVideo' | 'showResumeOrPlayDialog'

interface State {
  status: Status
  startTime?: number
  videoMp4Url: string
  embedUrl: string,
  videoView: VideoViewType
  autocueInlay: () => any
  'time-elapsed'?: number
  /** A datetime */
  'time-elapsed-updated-at'?: string
  videoViewReportingHasFailed: boolean
  hasCompletedVideo: boolean
  timeViewed: number
}

// Render
class ModalVideo extends Component<Props, State> {

  constructor(props) {
    super(props)
    this.token = false
    this.state = {
      status: 'initial',
      videoMp4Url: null,
      embedUrl: null,
      videoView: null,
      autocueInlay: null,
      videoViewReportingHasFailed: false,
      hasCompletedVideo: false,
      timeViewed: 0
    }
    if (this.props.theme.features.users.anonymousAccess.enabled) {
      this.token = queryString.parse(this.props.location.search)?.token as string || false
    }
  }

  token: string | string[] | boolean
  updateIntervalTimer: any

  getInitialData = async () => {
    const queryParams = {
      fields: ['time-elapsed', 'time-elapsed-updated-at'],
        page: {
          size: 1,
        },
        filter: {
          // 'with-time-elapsed': true,
        },
        sort: '-id',
    }
    if (this.token) {
      queryParams['token'] = this.token
    }
    const prevVideoViews = await query(
      `videos/${this.props.video.id}/video-views`,
      'video-views',
      queryParams as any,
    )
    if (
      prevVideoViews[0] &&
      prevVideoViews[0]['time-elapsed'] &&
      !isCms() &&
      Number(prevVideoViews[0]['time-elapsed'] > 5000)
    ) {
      this.setState({
        'time-elapsed': prevVideoViews[0]['time-elapsed'],
        status: 'showResumeOrPlayDialog',
      })
    } else {
      this.beginPlayingVideo()
    }
  }

  beginPlayingVideo = async (options: { fromStart?: boolean } = {}) => {
    const { video } = this.props
    const videoView: VideoViewType = await createOneByModel('video-view', {
      'video-id': video.id,
    }, this.token ? { token: this.token } : {})
    if (videoView.id !== '-1') {  //Handling logged out users -  Video Views should not be recorded
      this.setUpdateInterval(videoView)
    }
    this.setState({
      status: 'playingVideo',
      ...(options.fromStart && {
        'time-elapsed': 0,
      }),
      videoView,
      videoMp4Url: videoView['mp4-url'],
      embedUrl: videoView['embed-url']
    })
  }

  componentDidMount() {
    this.setState({
      startTime: performance.now(),
    })
    if (
      this.props.shouldIgnoreResumeModal ||
      !this.props.theme.features.videos.position
    ) {
      this.beginPlayingVideo()
    } else {
      this.getInitialData()
    }
  }

  componentWillUnmount() {
    {!this.props.shouldIgnoreResumeModal &&
      this.updateVideoViewAfterCompletion()
    }
  }

  updateVideoViewAfterCompletion = (timeElapsedOverride?: number) => {
    const { startTime, videoView, hasCompletedVideo } = this.state
    const timeStop = performance.now()
    if (videoView && !hasCompletedVideo && videoView.id > -1) {
      updateOneByModel('video-view', {
        id: videoView.id,
        'time-viewed': Math.round(timeStop - startTime),
        'time-elapsed': timeElapsedOverride || this.state['time-elapsed'],
        'time-elapsed-updated-at': this.state['time-elapsed-updated-at'],
      })
    }
    clearInterval(this.updateIntervalTimer)
  }

  setUpdateInterval = videoView => {
    const { theme } = this.props
    clearInterval(this.updateIntervalTimer)
    const timeInterval = 15000

    this.updateIntervalTimer = setInterval(() => {
      let {timeViewed} = this.state
      let timeSpentWatching = timeViewed += timeInterval
      if (!this.state.videoViewReportingHasFailed) {
        updateOneByModel('video-view', {
          id: videoView.id,
          'time-viewed':  timeSpentWatching,
          ...(theme.features.videos.position && {
            'time-elapsed': this.state['time-elapsed'],
            'time-elapsed-updated-at': this.state['time-elapsed-updated-at'],
          }),
        },
        this.token ? { token: this.token } : {})
        .catch(() => {
          this.setState({ videoViewReportingHasFailed: true })
        })
        this.setState({
          timeViewed: timeSpentWatching
        })
      }
    }, timeInterval)
  }

  closeVideoAtEnd = () => {
    if (this.props.theme.features.videos.autocue.closeVideoAtEnd) {
      if (this.props.closeVideo) {
        this.props.closeVideo()
      }
    }
  }

  handleVideoEnd = () => {
    const {
      autocueVideosPlayed,
      playNextAutocueVideo,
      selectedVideos,
      theme,
      video,
    } = this.props
    this.setState(
      {
        'time-elapsed': 0,
        hasCompletedVideo: true,
      },
      () => {
        this.updateVideoViewAfterCompletion(0)
        if (!theme.features.videos.autocue.enabled) {
          return this.closeVideoAtEnd()
        }
        if (theme.features.videos.autocue.enabled) {
          const nextVideo = this.getAutocueNextVideo(selectedVideos, video.id)
          if (nextVideo) {
            const isCheckin =
              autocueVideosPlayed === theme.features.videos.autocue.length
            this.renderNextVideoAutocue(nextVideo, isCheckin)
              .then(playNextAutocueVideo)
              .catch(this.closeVideoAtEnd)
          } else {
            this.closeVideoAtEnd()
          }
        }
      }
    )
  }

  getAutocueNextVideo = (currentSelectedVideos, lastVideoId) => {
    const nextVideoIndex = currentSelectedVideos.findIndex(vid => vid.id === lastVideoId) + 1
    this.props.setActivePosition(nextVideoIndex)
    return nextVideoIndex >= currentSelectedVideos.length
      ? null
      : currentSelectedVideos[nextVideoIndex]
  }

  renderNextVideoAutocue = (nextVideo, isCheckin) =>
    new Promise((resolve, reject) => {
      const startNextVideo = (cb, resetAutocueCount) => {
        this.setState(
          prevState => ({
            autocueInlay: null,
          }),
          () => cb({ nextVideo, resetAutocueCount: isCheckin }),
        )
      }
      this.setState({
        autocueInlay: () => (
          <AutocueModal
            title={nextVideo.name}
            isUserStillWatching={isCheckin}
            closeEvent={() => startNextVideo(reject, true)}
            onSubmit={() => startNextVideo(resolve, isCheckin)}
          />
        ),
      })
    })

  renderAutocueInlay = () => {
    return (
      <>
        {this.state.autocueInlay && (
          <div className="autocue__content-wrapper">
            {this.state.autocueInlay()}
          </div>
        )}
      </>
    )
  }

  renderMediaPlayer = () => {
    const { video } = this.props
    const { videoMp4Url, embedUrl } = this.state
    const { brightcove, wistia, knox, jwplayer } = this.props.videoProviders

    if (wistia && video['wistia-id']) {
      return (
        <div className="inline-video" test-id="modal-video">
          <WistiaPlayer
            id={video['wistia-id']}
            title={video.name}
            handleVideoEnd={this.handleVideoEnd}
          />
        </div>
      )
    } else if (brightcove && video['brightcove-id']) {
      return (
        <BrightcovePlayer
          id={video['brightcove-id']}
          brightcove={brightcove}
          onComplete={this.handleVideoEnd}
          autoPlay={true}
          onVideoProgress={this.handleVideoProgress}
          monitorProgressIntervalInMs={2500}
          timeInSecondsToStartFrom={(this.state['time-elapsed'] || 0) / 1000}
          shouldForceTimeToStartFrom
        />
      )
    } else if (knox && embedUrl) {
      return (
        <div className="inline-video" test-id="modal-video">
          <KnoxPlayer
            source={embedUrl}
            title={video.name}
          />
        </div>
      )
    } else if (jwplayer && video['jwplayer-id']) {
      return (
        <div test-id="modal-video">
          <JWPlayer
            id={video['jwplayer-id']}
            videoMp4Url={videoMp4Url}
            jwplayer={jwplayer}
            autoPlay={true}
            handleVideoEnd={this.handleVideoEnd}
          />
        </div>
      )
    } else if (videoMp4Url) {
      return (
        <Mp4VideoPlayer
          videoMp4Url={videoMp4Url}
          handleVideoEnd={this.handleVideoEnd}
          onVideoProgress={this.handleVideoProgress}
          monitorProgressIntervalInMs={2500}
          autoPlay={true}
          timeInSecondsToStartFrom={(this.state['time-elapsed'] || 0) / 1000}
          shouldForceTimeToStartFrom
        />
      )
    } else {
      return <div className="loader"></div>
    }
  }

  handleVideoProgress = (timeElapsedInMs: number) => {
    const { theme } = this.props
    if (theme.features.videos.position) {
      this.setState({
        'time-elapsed': timeElapsedInMs,
        'time-elapsed-updated-at': new Date().toISOString(),
      })
    }
  }

  render() {
    const { isFullWidthModal, allClientVariables } = this.props
    return (
      <>
        {this.state.status === 'showResumeOrPlayDialog' && (
          <ResumeOrPlayDialog
            isFullWidthModal={isFullWidthModal}
            beginPlayingVideo={this.beginPlayingVideo}
            allClientVariables={allClientVariables}
          />
        )}
        {this.state.status === 'playingVideo' && (
          <div className="autocue">
            {this.renderMediaPlayer()}
            {this.renderAutocueInlay()}
          </div>
        )}
      </>
    )
  }
}

export const ResumeOrPlayDialog: React.FC<{
  beginPlayingVideo: ModalVideo['beginPlayingVideo']
  isFullWidthModal?: boolean
  allClientVariables?: any
}> = ({ beginPlayingVideo, isFullWidthModal, allClientVariables }) => {
  const Wrapper = isFullWidthModal
    ? ({ children }) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
          }}
        >
          {children}
        </div>
      )
    : React.Fragment
  return (
    <Wrapper>
      <ButtonWrapper variables={allClientVariables} className="modal__resume-video">
        <p>Resume from where you left off?</p>
        <div>
          <Button
            className="button button--filled button--filled-bg"
            onClick={() => beginPlayingVideo()}
            style={{ marginRight: '0.5rem' }}
          >
            Resume
          </Button>
          <Button
            className="button button--filled button--filled-bg"
            onClick={() => beginPlayingVideo({ fromStart: true })}
          >
            Play From Start
          </Button>
        </div>
      </ButtonWrapper>
    </Wrapper>
  )
}

const enhance = compose(
  withTheme,
  withVideoProviders,
  withRouter,
  withClientVariables('clientVariables', allClientVariables),
  withHooks(props => {
    const sortedVideos = useSortedVideos()
    return {
      ...props,
      selectedVideos: sortedVideos.getCurrentSortedVideos(),
      setActivePosition: sortedVideos.setActivePosition,
    }
  }),
)

export default enhance(ModalVideo)

const ButtonWrapper = styled.div<{ variables: any }>`
  padding: 4rem;
  padding-top: 2.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  & > button {
    margin: 0px 0.25rem;
  }
  & > p {
    color: white;
    margin: 0;
    font-size: 1.25rem;
    margin-bottom: 1.25rem;
    ${({ variables }) =>
    variables?.textColor &&
      css`
        color: ${variables.textColor};
      `};
  }
`
