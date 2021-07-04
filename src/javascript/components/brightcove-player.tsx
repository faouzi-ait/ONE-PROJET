import React, { useState, useEffect, useRef } from 'react'
import uuid from 'uuid/v4'
import { RemoteControlStatusType } from 'javascript/views/virtual-screening/video-presentation'
import { isVideoPlaying } from 'javascript/components/mp4-video-player'
/**
 * The brightcove player loads in an external script tag to the page,
 * which loads in a global variable called 'bc' which exposes
 * some methods to us.
 */

interface Props {
  brightcove: any
  id: any
  isVisible?: boolean
  controls?: boolean
  onLoad?: any
  onComplete?: any
  onError?: any
  autoPlay?: boolean
  /** What interval do you want to monitor progress at */
  monitorProgressIntervalInMs?: number
  muted?: boolean,
  /** What to do on video progress */
  onVideoProgress?: (timeInMs: number) => void
  onVideoPause?: (e: any, currentAction: string) => void
  onVideoPlay?: (e: any, currentTime: number, currentAction: string) => void
  onVideoTracked?: () => void
  remoteControl?: RemoteControlStatusType
  shouldForceTimeToStartFrom?: boolean
  timeInSecondsToStartFrom?: number
  volume?: null | number
}

const BrightcovePlayer: React.FC<Props> = ({
  brightcove,
  id: videoId,
  isVisible = true,
  controls = true,
  onLoad = () => {},
  onComplete = () => {},
  onError = () => {},
  onVideoPause = () => {},
  onVideoPlay = () => {},
  onVideoTracked = () => {},
  autoPlay = false,
  muted = false,
  monitorProgressIntervalInMs = 10000,
  onVideoProgress = null,
  remoteControl = null,
  timeInSecondsToStartFrom = 0,
  shouldForceTimeToStartFrom = false,
  volume = null
}) => {
  const [hasLoaded, setHasLoaded] = useState(false)
  /**
   * Generate a truly unique ID so that every instance
   * of the player is new.
   */
  const [id] = useState(`id_${uuid()}`)
  const [scriptId] = useState(`script_${uuid()}`)

  const videoRef = useRef<HTMLVideoElement>()
  const [isRemotePlayingVideo, setIsRemotePlayingVideo] = useState(false)
  const progressIntervalRef = useRef(null)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  const onVolume = volume === null ? 1 : volume

  useEffect(() => {
    if (onVideoProgress && !remoteControl) {
      progressIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          const currentTimeInSeconds = videoRef?.current?.currentTime
          if (currentTimeInSeconds && onVideoProgress) {
            onVideoProgress(currentTimeInSeconds * 1000)
          }
        }
      }, monitorProgressIntervalInMs)

      return () => clearInterval(progressIntervalRef.current)
    }
  }, [Boolean(onVideoProgress), monitorProgressIntervalInMs])

  const currentTimeTimeoutRef = useRef<any>()

  const setVideoCurrentTime = (time: number) => {
    return new Promise<void>(resolve => {
      if (videoRef?.current?.readyState > 0) {
        videoRef.current.currentTime = time
        resolve()
      } else {
        currentTimeTimeoutRef.current = setInterval(() => {
          if (videoRef?.current?.readyState > 0) {
            videoRef.current.currentTime = time
            resolve()
          }
        }, 250)
      }
    }).then(() => {
      if (currentTimeTimeoutRef.current) {
        clearInterval(currentTimeTimeoutRef.current)
      }
    })
  }

  const handleVideoLoad = () => {
    try {
      // @ts-ignore
      const bc = global.bc

      if (!bc || !id) {
        return false
      }

      const video = bc(id)
      video.ready(function() {
        onLoad()
        if (shouldForceTimeToStartFrom) {
          setVideoCurrentTime(timeInSecondsToStartFrom)
        }
        if (isVisible && autoPlay) {
          if (muted) {
            setVolume(0)
          } else {
            setVolume(onVolume)
          }
          const promise = video.play()

          if (promise !== undefined && promise.catch) {
            promise.catch(onError)
            promise.then(() => {
              setHasLoaded(true)
            })
          } else {
            setTimeout(() => {
              setHasLoaded(true)
            }, 500)
          }
        } else {
          if (!isVisible) {
            setVolume(0)
          }
          setTimeout(() => {
            setHasLoaded(true)
          }, 500)
        }
      })
      video.on('error', () => {
        onError()
      })
      video.on('ended', () => {
        onComplete()
        // video.pause()
      })
      video.on('play', handleOnVideoPlay)
      video.on('pause', handleOnVideoPause)
    } catch (e) {
      console.error(e)
    }
  }

  const handleUnmount = () => {
    try {
      // @ts-ignore
      const bc = global.bc

      if (!bc) {
        return false
      }

      const video = bc(id)
      video.pause()
    } catch (e) {
      console.warn(e)
    }
  }

  /** Play and pause when isVisible changes */
  useEffect(() => {
    if (!hasLoaded) {
      return
    }
    const isPaused = videoRef?.current?.paused

    if (isVisible && isPaused && autoPlay) {
      const promise = videoRef?.current?.play()

      if (promise && promise.catch) {
        promise.catch(e => {
          console.error(e)
          onError()
        })
      }
    } else if (!isVisible && !isPaused) {
      videoRef?.current?.pause()
    }
  }, [hasLoaded, isVisible])


  useEffect(() => {
    setMuted(muted)
  }, [muted])

  useEffect(() => {
    setVolume(volume)
  }, [volume])

  const setVolume = (vol) => {
    if (vol === null) return
    // @ts-ignore
    const bc = global.bc

    if (!bc) {
      return
    }
    const video = bc(id)
    video.volume(vol)
  }

  const setMuted = (videoIsMuted) => {
    setVolume(videoIsMuted ? 0 : onVolume)
  }

  useEffect(() => {
    /**
     * This makes the brightcove player
     * forwards and backwards compatible to the changes coming in ONE-lite.
     * Remove after ONE-lite is deployed.
     */
    const brightcoveAccountId = brightcove.account || brightcove['brightcove-account-id']
    try {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = `//players.brightcove.net/${brightcoveAccountId}/${
        brightcove.player
      }_default/index.min.js`
      script.addEventListener('load', handleVideoLoad)

      document.body.appendChild(script)
      /* eslint-disable-next-line */
    } catch (e) {
      console.warn(e)
    }
    return () => {
      try {
        handleUnmount()
        document
          .getElementById(scriptId)
          .parentNode.removeChild(document.getElementById(scriptId))
      } catch (e) {
        console.warn(e)
      }
    }
  }, [])

  const getRemoteSetting = () => {
    if (videoRef?.current) {//@ts-ignore
      return videoRef.current.getAttribute('data-remote-control')
    }
  }
  const setRemoteSetting = (value) => {
    if (videoRef?.current) {//@ts-ignore
      videoRef.current.setAttribute('data-remote-control', value)
    }
  }

  const handleOnVideoPlay = (e) => {
    if (!remoteControl) return
    if (getRemoteSetting() !== 'play') { // i.e. user pressed play
      setRemoteSetting('autopause')
      videoRef?.current?.pause()
    } else if (videoRef.current) {
      setMuted(false)
    }
    onVideoPlay(e, videoRef?.current?.currentTime, getRemoteSetting())
  }

  const handleOnVideoPause = (e) => {
    if (!remoteControl) return
    if (getRemoteSetting() !== 'autopause') {
      onVideoPause(e, getRemoteSetting())
    }
  }

  useEffect(() => {
    let remoteProgressInterval
    if (isRemotePlayingVideo) {
      let lastHostVideoPosition = 0
      remoteProgressInterval = setInterval(() => {
        if (videoRef.current && onVideoProgress) { //@ts-ignore
          const currentTimeInSeconds = videoRef.current.currentTime
          if (!remoteControl.isHost || Math.abs(currentTimeInSeconds - lastHostVideoPosition) < 1.5) {
            onVideoProgress(currentTimeInSeconds)
          }
          lastHostVideoPosition = currentTimeInSeconds
        }
      }, 1000)
    }
    return () => clearInterval(remoteProgressInterval)
  }, [isRemotePlayingVideo])

  useEffect(() => {
    if (!videoRef.current) return
    if (!remoteControl || remoteControl.action === 'idle') {
      setRemoteSetting('idle')
      return
    }
    if (remoteControl.action === 'play') {
      try {
        setRemoteSetting('play')
        isVideoPlaying(videoRef, videoRef?.current?.play()).then(() => {
          /* video now playing */
          setVolume(volume)
          setIsRemotePlayingVideo(true)
        })
      } catch(error) {
        /* Ignore DOMException*/
      }
    }
    if (remoteControl.action === 'pause') {
      setRemoteSetting('pause')
      if (videoRef.current.paused) {
        if (remoteControl.isHost) setIsRemotePlayingVideo(false)
        return handleOnVideoPause(null)
      } else {
        if (!remoteControl.isHost) setIsRemotePlayingVideo(false)
        videoRef.current.pause()
      }
    }
    if (remoteControl.action === 'trackTime') {
      try {
        setRemoteSetting('trackTime')
        videoRef.current.currentTime = remoteControl?.payload || 0
        isVideoPlaying(videoRef, videoRef?.current?.play()).then(() => {
          // current time is only set on playing videos. so start video to set the time
          // (it will auto pause waiting for remote control cmd)
        })
      } catch(error) {
        /* Ignore DOMException*/
      } finally {
        onVideoTracked()
      }
    }
  }, [remoteControl])

  return (
    <>
      <video
        autoPlay={!isSafari && autoPlay}
        muted={muted}
        test-id="modal-video"
        id={id}
        ref={videoRef}
        data-video-id={videoId}
        data-account={brightcove.account}
        data-player={brightcove.player}
        data-embed="default"
        data-application-id
        className="video-js brightcove-player"
        controls={controls}
      />
    </>
  )
}

export default BrightcovePlayer
