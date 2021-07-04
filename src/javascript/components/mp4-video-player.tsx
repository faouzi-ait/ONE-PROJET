import React, { useEffect, useState, useRef } from 'react'
import videojs from 'video.js'

import { isPromise } from 'javascript/utils/generic-tools'
import { RemoteControlStatusType } from 'javascript/views/virtual-screening/video-presentation'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import modalVideoClientVariables from 'javascript/components/modal-video/variables'

interface Props {
  autoPlay?: boolean
  handleVideoEnd: (e: Event) => void
  monitorProgressIntervalInMs?: number /** What interval do you want to monitor progress at */
  onVideoProgress?: (timeInMs: number) => void /** What to do on video progress */
  onVideoPause?: (e: any, currentAction: string) => void
  onVideoPlay?: (e: any, currentTime: number, currentAction: string) => void
  onVideoTracked?: () => void
  remoteControl?: RemoteControlStatusType
  shouldForceTimeToStartFrom?: boolean
  showControls?: boolean
  timeInSecondsToStartFrom?: number
  videoMp4Url: string
  volume?: null | number
}

const Mp4VideoPlayer: React.FC<Props>  = ({
  autoPlay = true,
  handleVideoEnd,
  monitorProgressIntervalInMs = 10000,
  onVideoPause = () => {},
  onVideoPlay = () => {},
  onVideoProgress = null,
  onVideoTracked = () => {},
  remoteControl = null,
  shouldForceTimeToStartFrom = false,
  showControls = true,
  timeInSecondsToStartFrom = 0,
  videoMp4Url,
  volume = null,
}) => {

  const modalVideoCV = useClientVariables(modalVideoClientVariables)
  const [player, setPlayer] = useState(null)
  const [isRemotePlayingVideo, setIsRemotePlayingVideo] = useState(false)
  const videoRef = useRef<any>()
  const currentTimeTimeoutRef = useRef<any>()
  const progressIntervalRef = useRef(null)

  const setVideoCurrentTime = (time: number) => {
    return new Promise<void>(resolve => {
      /** Fixes IE11 InvalidStateError */ //@ts-ignore
      if (videoRef.current?.readyState > 0) { //@ts-ignore
        videoRef.current.currentTime = time
        resolve()
      } else {
        currentTimeTimeoutRef.current = setInterval(() => { //@ts-ignore
          if (videoRef.current?.readyState > 0) { //@ts-ignore
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

  useEffect(() => {
    setVolume(volume)
  }, [player, volume])

  const setVolume = (vol) => {
    if (player && vol !== null) {
      player.volume(vol)
    }
  }

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
    if (!videoRef?.current) return
    if (remoteControl && getRemoteSetting() !== 'play') { // i.e. user pressed play
      setRemoteSetting('autopause') //@ts-ignore
      videoRef?.current?.pause() // needs to wait for all clients to be ready - will then start by remoteControl play
    } //@ts-ignore
    onVideoPlay(e, videoRef.current.currentTime, getRemoteSetting())
  }

  const handleOnVideoPause = (e) => {
    if (!videoRef?.current) return
    if (getRemoteSetting() !== 'autopause') { //@ts-ignore
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
    if (!videoRef?.current) return
    if (!remoteControl || remoteControl.action === 'idle') {
      setRemoteSetting('idle')
      return
    }
    if (remoteControl.action === 'play') {
      try {
        setRemoteSetting('play') //@ts-ignore
        isVideoPlaying(videoRef, videoRef.current.play())?.then(() => {
          /* video now playing */
          setVolume(volume)
          setIsRemotePlayingVideo(true)
        })
      } catch(error) {
        console.error('Video Playback:', error)
      }
    }
    if (remoteControl.action === 'pause') {
      setRemoteSetting('pause') //@ts-ignore
      if (videoRef.current.paused) {
        if (remoteControl.isHost) {
          setIsRemotePlayingVideo(false)
        }
        return handleOnVideoPause(null)
      } else { //@ts-ignore
        if (!remoteControl.isHost) setIsRemotePlayingVideo(false)
        videoRef.current.pause()
      }
    }
    if (remoteControl.action === 'trackTime') {
      try {
        setRemoteSetting('trackTime') //@ts-ignore
        videoRef.current.currentTime = remoteControl.payload //@ts-ignore
        isVideoPlaying(videoRef, videoRef.current.play())?.then(() => {
          /* current time is only set on playing videos. so start video to set the time
          *  (it will auto pause waiting for remote control cmd) */
          onVideoTracked()
        })
      } catch(error) {
        /* Ignore DOMException*/
        console.error('Video Playback:', error)
      }
    }
  }, [remoteControl, videoRef.current])

  useEffect(() => { //@ts-ignore
    videoRef?.current?.addEventListener('ended', handleVideoEnd) //@ts-ignore
    videoRef?.current?.addEventListener('play', handleOnVideoPlay) //@ts-ignore
    videoRef?.current?.addEventListener('pause', handleOnVideoPause)
    const aePlatformMimeType = videoMp4Url.includes('https://link.theplatform.com') ? 'video/mp4' : false
    // aePlatformFriendlyMimeType - nasty little hack to overcome videos from platform not knowing there own mimetype
    // see comments on card https://rawnet.atlassian.net/browse/ONE-3828 - as ae only had mp4 videos at the time, decision
    // to hard code this was made. Save doing the work to sniff and save mime-types for all urls.
    const playerProps = {
      controls: showControls,
      controlsList: 'nodownload',
      autoplay: autoPlay,
      sources: [{
        src: videoMp4Url,
        ...(aePlatformMimeType && { type: aePlatformMimeType })
      }],
      playbackRates: modalVideoCV.playbackRates
    }
    const thisPlayer = videojs(videoRef.current, playerProps)
    setPlayer(thisPlayer)

    return () => {
      if (player) player.dispose() //@ts-ignore
      videoRef?.current?.removeEventListener('ended', handleVideoEnd) //@ts-ignore
      videoRef?.current?.removeEventListener('play', handleOnVideoPlay) //@ts-ignore
      videoRef?.current?.removeEventListener('pause', handleOnVideoPause)
    }
  }, [])

  useEffect(() => {
    if (videoRef?.current && shouldForceTimeToStartFrom) {
      setVideoCurrentTime(timeInSecondsToStartFrom)
    }
  }, [timeInSecondsToStartFrom, shouldForceTimeToStartFrom])

  useEffect(() => {
    if (onVideoProgress && !remoteControl) {
      progressIntervalRef.current = setInterval(() => {
        if (videoRef?.current) { //@ts-ignore
          const currentTimeInSeconds = videoRef.current.currentTime
          if (currentTimeInSeconds && onVideoProgress) {
            onVideoProgress(currentTimeInSeconds * 1000)
          }
        }
      }, monitorProgressIntervalInMs)

      return () => clearInterval(progressIntervalRef.current)
    }
  }, [Boolean(onVideoProgress), monitorProgressIntervalInMs, videoMp4Url])

  return (
    <div data-vjs-player test-id="modal-video">
      <video ref={videoRef} className="video-js video-js-player" onContextMenu={(e) => e.preventDefault()}></video>
    </div>
  )
}

export default Mp4VideoPlayer


export const isVideoPlaying = (videoRef, playPromise) => {
  /* This exists as old versions of safari do not return a promise from viderRef.current.play() */
  if (isPromise(playPromise)) return playPromise
  return new Promise<void>((resolve, reject) => {
    if (!videoRef?.current) return reject('videoRef.current not available')
    const testVideoPlayState = (attempts = 0) => {
      setTimeout(() => {
        if (!videoRef.current?.paused || attempts > 10) {
          return resolve()
        }
        testVideoPlayState(attempts + 1)
      }, 100)
    }
    testVideoPlayState()
  })
}