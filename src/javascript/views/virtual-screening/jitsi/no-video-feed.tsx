import React from 'react'

import Icon from 'javascript/components/icon'

interface Props {
  isMuted: boolean
  isLoading: boolean
  size: 'main' | 'local-thumbnail' | 'thumbnail'
  tag?: string
}

const NoVideoFeed: React.FC<Props> = ({
  isMuted,
  isLoading,
  tag,
  size,
}) => {
  if (isLoading) {
    return (
      <div className="jitsi__no-video-feed jitsi__no-video-feed--centered">
        Initializing Video Feeds...
      </div>
    )
  }

  return (
    <div className={`jitsi__no-video-feed jitsi__no-video-feed--${size}`}>
      <div className="jitsi__video-tag">
        {isMuted && (
          <div className="jitsi__video-tag-icon">
            <Icon id="i-microphone-mute" />
          </div>
        )}
        {tag}
      </div>
      <button className="jitsi__reload-button"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  )
}

export default NoVideoFeed
