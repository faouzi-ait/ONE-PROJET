import React from 'react'
import ReactJWPlayer from 'react-jw-player'

import { JwplayerProviderType } from 'javascript/types/VideoProviders'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import modalVideoClientVariables from 'javascript/components/modal-video/variables'

interface Props {
  autoPlay: boolean
  id: string
  jwplayer: JwplayerProviderType | boolean
  videoMp4Url: string
  handleVideoEnd: (e: Event) => void
}

const JWPlayer: React.FC<Props> = ({
  autoPlay,
  id,
  jwplayer,
  videoMp4Url,
  handleVideoEnd,
}) => {
  const modalVideoCV = useClientVariables(modalVideoClientVariables)
  if (jwplayer) {
    return (
      <ReactJWPlayer
        className="video-js"
        playerId={`jwplayer-${id}`}
        playerScript={jwplayer['player-library']}
        file={videoMp4Url}
        isAutoPlay={autoPlay}
        onComplete={handleVideoEnd}
        customProps={{ playbackRateControls: modalVideoCV.playbackRates }}
      />
    )
  }
  return null
}

export default JWPlayer
