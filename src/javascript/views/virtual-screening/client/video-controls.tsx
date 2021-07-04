import React, { useState } from 'react'

import 'stylesheets/core/components/video-controls'

interface Props {
  volume?: null | number
  onVolumeChanged?: (volume: number) => void
  fullscreen?: null | boolean
  onFullscreenToggle?: (fullscreen: boolean) => void
}

const VideoControls: React.FC<Props> = ({
  volume = null,
  fullscreen = null,
  onVolumeChanged = (volume) => {},
  onFullscreenToggle = (fullscreen) => {},
}) => {
  const [hasVisibleControls, setHasVisibleControls] = useState(false)

  const mouseControls = {
    onMouseEnter: () => setHasVisibleControls(true),
    onMouseLeave: () => setHasVisibleControls(false)
  }

  return (
    <div className="video-controls" {...mouseControls} >
      <div className={'video-controls__panel-wrapper'} {...mouseControls} >
        <div className={`video-controls__panel ${!hasVisibleControls && 'video-controls__panel--hidden'}`} >
          { volume !== null && (
            <VolumeControls volume={volume} onVolumeChanged={onVolumeChanged}/>
          )}
          { fullscreen  !== null && (
            <FullscreenButton fullscreen={fullscreen} onFullscreenToggle={onFullscreenToggle}/>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoControls

const VolumeControls = ({
  volume,
  onVolumeChanged,
}) => {
  const [preMutedVolume, setPreMutedVolume] = useState(volume)
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false)
  const [isMuted, setIsMuted] = useState(volume === 0)
  const toggleVolume = (e) => {
    if (isMuted) {
      setIsMuted(false)
      onVolumeChanged(preMutedVolume)
    } else {
      setIsMuted(true)
      setPreMutedVolume(volume)
      onVolumeChanged(0)
    }
  }
  const volumeIcon = volume === 0 ? 'muted' : volume < 0.4 ? 'lowVolume' : volume < 0.8 ? 'midVolume' : 'highVolume'
  return (
    <div className="video-controls__volume" onMouseLeave={() => setIsVolumeSliderVisible(false)}>
      <div className="video-controls__volume-icon" onClick={toggleVolume}
        onMouseEnter={() => setIsVolumeSliderVisible(true)}
      >
        {videoControlIcons[volumeIcon]({ width: '22px', height: '22px' })}
      </div>
      { isVolumeSliderVisible && (
        <div className="video-controls__volume-slider-container">
          <input
            type="range"
            id="volumeRange"
            className="video-controls__volume-slider"
            min="0" max="1" step="0.1"
            value={volume}
            onChange={({target}) => onVolumeChanged(Number(target.value))}
          />
        </div>
      )}
    </div>
  )
}

const FullscreenButton = ({
  fullscreen,
  onFullscreenToggle
}) => {
  return (
    <div className="video-controls__fullscreen">
      <div
        className="video-controls__fullscreen-icon"
        onClick={() => onFullscreenToggle(!fullscreen)}
      >
         {videoControlIcons[fullscreen ? 'fullscreenExit' : 'fullscreen']({ width: '22px', height: '22px' })}
      </div>
    </div>
  )
}

type IconKeys =
  | 'muted'
  | 'lowVolume'
  | 'midVolume'
  | 'highVolume'
  | 'fullscreen'
  | 'fullscreenExit'

interface IconProps {
  width?: string
  height?: string
  viewBox?: string
}

type IconMapType = {
  [K in IconKeys]: React.FC<IconProps>
}

export const videoControlIcons: IconMapType = {
  'muted': (props) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      </svg>
    )
  },
  'lowVolume': (props) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M0 0h24v24H0z" fill="none"/><path d="M7 9v6h4l5 5V4l-5 5H7z"/>
      </svg>
    )
  },
  'midVolume': (props) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
      </svg>
    )
  },
  'highVolume': (props) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    )
  },
  'fullscreen': (props) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      </svg>
    )
  },
  'fullscreenExit': (props) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
      </svg>
    )
  },
}
