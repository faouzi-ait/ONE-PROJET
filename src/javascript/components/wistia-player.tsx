import React, { useEffect, useRef, useState } from 'react'
import { RemoteControlStatusType } from 'javascript/views/virtual-screening/video-presentation'

interface Props {
  id: string
  title: string
  handleVideoEnd?: (e: any) => void
  onVideoPause?: (e: any, currentAction: string) => void
  onVideoPlay?: (e: any, currentTime: number, currentAction: string) => void
  onVideoProgress?: (timeInMs: number) => void
  onVideoTracked?: () => void
  remoteControl?: RemoteControlStatusType
  showControls?: boolean
  volume?: null | number
}

const WistiaPlayer: React.FC<Props> = ({
  id,
  title,
  handleVideoEnd = () => {},
  onVideoPause = () => {},
  onVideoPlay = () => {},
  onVideoProgress = null,
  onVideoTracked = () => {},
  remoteControl,
  showControls = true,
  volume = null,
}) => {
  const scriptRef = useRef<HTMLScriptElement>()
  const iFrameRef = useRef<HTMLIFrameElement>()
  const [loadedVideo, setLoadedVideo] = useState(null)
  const [isRemotePlayingVideo, setIsRemotePlayingVideo] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.id = 'wistia'
    script.src = `//fast.wistia.net/assets/external/E-v1.js`
    scriptRef.current = script
    document.body.appendChild(script)

    return () => {
      //@ts-ignore
      const video = global.Wistia.api(id)
      loadedVideo?.unbind()
      video?.unbind()
      scriptRef.current.parentNode.removeChild(scriptRef.current)
    }
  }, [])

  useEffect(() => {
    if (loadedVideo) {
      loadedVideo.bind('end', handleVideoEnd)
      loadedVideo.bind('play', handleOnVideoPlay)
      loadedVideo.bind('pause', handleOnVideoPause)
      loadedVideo.bind('seek', loadedVideo.pause)
    }
    return () => {
      if (loadedVideo) {
        loadedVideo.unbind('end', handleVideoEnd)
        loadedVideo.unbind('play', handleOnVideoPlay)
        loadedVideo.unbind('pause', handleOnVideoPause)
        loadedVideo.unbind('seek', loadedVideo.pause)
      }
    }
  }, [loadedVideo])

  useEffect(() => {
    setVolume(volume)
  }, [loadedVideo, volume])

  const setVolume = (vol) => {
    if (loadedVideo && vol !== null) {
      loadedVideo.volume(vol)
    }
  }

  const getWistiaVideoAfterLoad = (videoId) => new Promise<any>((resolve) => {
    const pollWistiaVideo = () => {
      setTimeout(() => {
         //@ts-ignore
        const video = global.Wistia.api(videoId)
        if (video) return resolve(video)
        pollWistiaVideo()
      }, 500)
    }
    pollWistiaVideo()
  })

  useEffect(() => {
    getWistiaVideoAfterLoad(id).then((video) => {
      setLoadedVideo(video)
    })

  }, [id])

  const getRemoteSetting = () => {
    if (iFrameRef?.current) {//@ts-ignore
      return iFrameRef.current.getAttribute('data-remote-control')
    }
  }
  const setRemoteSetting = (value) => {
    if (iFrameRef?.current) {//@ts-ignore
      iFrameRef.current.setAttribute('data-remote-control', value)
    }
  }

  const handleOnVideoPlay = (e) => {
    //@ts-ignore
    const video = global.Wistia.api(id)
    if (remoteControl && getRemoteSetting() !== 'play') { // i.e. user pressed play
      setRemoteSetting('autopause')
      loadedVideo?.pause()
    }
    onVideoPlay(e, loadedVideo?.time() || video?.time(), getRemoteSetting())
  }

  const handleOnVideoPause = (e) => {
     //@ts-ignore
    const video = global.Wistia.api(id)
    if (getRemoteSetting() !== 'autopause') {
      onVideoPause(e, getRemoteSetting())
    }
  }

  const waitForVideoTracked = () => new Promise<void>((resolve) => {
    const hasVideoTracked = () => {
      setTimeout(() => {
        if (iFrameRef.current?.getAttribute('data-remote-control') !== 'autopause') {
          return hasVideoTracked()
        } else {
          return resolve()
        }
      }, 300)
    }
    hasVideoTracked()
  })

  useEffect(() => {
    let remoteProgressInterval
    if (isRemotePlayingVideo) {
      let lastHostVideoPosition = 0
      remoteProgressInterval = setInterval(() => {
        if (loadedVideo && onVideoProgress) { //@ts-ignore
          const currentTimeInSeconds = loadedVideo.time()
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
    if (!remoteControl || remoteControl.action === 'idle') {
      setRemoteSetting('idle')
      return
    }
    if (remoteControl.action === 'play') {
      setRemoteSetting('play')
      loadedVideo?.play()
      setVolume(volume)
      setIsRemotePlayingVideo(true)
    }
    if (remoteControl.action === 'pause') {
      setRemoteSetting('pause')
      if (loadedVideo?.state() === 'paused') {
        if (remoteControl.isHost) setIsRemotePlayingVideo(false)
        return handleOnVideoPause(null)
      } else {
        if (!remoteControl.isHost) setIsRemotePlayingVideo(false)
        loadedVideo?.pause()
      }
    }
    if (remoteControl.action === 'trackTime') {
      // wistia plays for a fraction of a second before playing event fires pause. So need to only run trackTime once.
      // otherwise video shudders whilst waiting for all clients to respond they are ready.
      loadedVideo?.time(remoteControl.payload)
      setRemoteSetting('trackTime')
      loadedVideo?.play()
      waitForVideoTracked().then(() => onVideoTracked())
    }
  }, [remoteControl])

  const controls = showControls ? '' : '?playbar=false&controlsVisibleOnLoad=false&playButton=false&smallPlayButton=false&volumeControl=false&fullscreenButton=false'
  return (
    <iframe
      allowFullScreen
      width={remoteControl ? '800' : '1600'}
      allowTransparency={true}
      className="wistia_embed"
      frameBorder="0"
      height={remoteControl ? '520' : '900'}
      name="wistia_embed"
      ref={iFrameRef}
      scrolling="no"
      src={`https://fast.wistia.net/embed/iframe/${id}${controls}`}
      title={title}
    ></iframe>
  )
}

export default WistiaPlayer
