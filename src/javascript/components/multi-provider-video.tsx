import React, { useEffect, useState, useRef } from 'react'
import BrightcovePlayer from 'javascript/components/brightcove-player'
import VideoView from 'javascript/components/video-view'
import WistiaPlayer from 'javascript/components/wistia-player'
//Types
import VideoProviders from 'javascript/types/VideoProviders'
import { VideoType } from 'javascript/types/ModelTypes'
import withVideoProviders from './hoc/with-video-providers'


interface Props {
  video: Partial<VideoType>
  withStyle?: boolean
  isVisible?: boolean
  controls?: boolean
  onLoad?: () => void
  onComplete?: () => void
  onError?: () => void
  muted?: boolean
  style?: any
  videoProviders: VideoProviders
}

const MultiProviderVideo: React.FC<Props> = ({
  video,
  withStyle = true,
  isVisible = true,
  controls,
  onLoad = () => {},
  onComplete = () => {},
  onError = () => {},
  muted = false,
  style,
  videoProviders,
}) => {
  const { brightcove, wistia } = videoProviders
  return (
    <VideoView
      video={video}
      reportingType="video_banner"
      renderVideoView={(videoView) => {
        if (wistia && videoView['wistia-id']) {
          return (
            <div style={style} className={withStyle ? 'inline-video' : ''}>
              <WistiaPlayer id={videoView['wistia-id']} title={videoView.name} />
            </div>
          )
        } else if (brightcove && videoView['brightcove-id']) {
          return (
            <>
              <BrightcovePlayer
                isVisible={isVisible}
                id={videoView['brightcove-id']}
                brightcove={brightcove}
                controls={controls}
                onLoad={onLoad}
                autoPlay
                onComplete={onComplete}
                onError={onError}
                muted={muted}
              />
            </>
          )
        } else if (videoView['mp4-url']) {
          return (
            <div style={style} className={withStyle ? 'static-video' : ''}>
              <NonProviderVideo
                videoMp4Url={videoView['mp4-url']}
                controls={controls}
                autoPlay
                onLoad={onLoad}
                isVisible={isVisible}
                onComplete={onComplete}
                onError={onError}
                muted={muted}
              />
            </div>
          )
        } 
        return null
      }}
    />
  )
}

export default withVideoProviders(MultiProviderVideo)

const NonProviderVideo = ({
  videoMp4Url,
  controls,
  autoPlay,
  onLoad = () => {},
  onError = () => {},
  onComplete = () => {},
  isVisible,
  muted = false,
}) => {
  const [hasLoaded, setHasLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const onCanPlayThrough = () => {
    if (isVisible && autoPlay) {
      const promise = videoRef.current.play()

      /** In IE11, video.play() does not return a promise */
      if (promise && promise.catch) {
        promise
          .then(() => {
            onLoad()
            setHasLoaded(true)
          })
          .catch(e => {
            console.error(e)
            onError()
          })
      } else {
        onLoad()
        setHasLoaded(true)
      }
    } else {
      onLoad()
      setHasLoaded(true)
    }
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('canplay', onCanPlayThrough)
      videoRef.current.addEventListener('ended', onComplete)
      videoRef.current.addEventListener('error', onError)
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('canplay', onCanPlayThrough)
        videoRef.current.removeEventListener('ended', onComplete)
        videoRef.current.removeEventListener('error', onError)
      }
    }
  }, [videoRef.current])

  /** Play and pause when isVisible changes */
  useEffect(() => {
    if (!hasLoaded) {
      return
    }
    const isPaused = videoRef.current.paused

    if (isVisible && isPaused) {
      const promise = videoRef.current.play()

      if (promise && promise.catch) {
        promise.catch(e => {
          console.error(e)
          onError()
        })
      }
    } else if (!isVisible && !isPaused) {
      videoRef.current.pause()
    }
  }, [hasLoaded, isVisible])

  return (
    <video
      src={videoMp4Url}
      controls={controls}
      // autoPlay={autoPlay}
      ref={videoRef}
      muted={muted}
    ></video>
  )
}

// const usePreloadVideo = (mp4Url, onLoad = () => {}) => {
//   const [hasLoaded, setHasLoaded] = useState(false)
//   useEffect(() => {
//     const video = document.createElement('video')

//     video.addEventListener('canplay', () => {
//       setHasLoaded(true)
//       onLoad()
//     })
//     video.src = mp4Url
//   }, [mp4Url])
//   return hasLoaded
// }
