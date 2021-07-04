import React from 'react'

import useVideoProviders from 'javascript/utils/hooks/use-video-providers'
import withUser, { WithUserType } from 'javascript/components/hoc/with-user'

// Components
import BrightcovePlayer from 'javascript/components/brightcove-player'
import Mp4VideoPlayer from 'javascript/components/mp4-video-player'
import WistiaPlayer from 'javascript/components/wistia-player'

//Types
import { VideoType } from 'javascript/types/ModelTypes'
import { SocketConnectionType } from 'javascript/views/virtual-screening/use-sockets'
import VideoView from 'javascript/components/video-view'
import useUnregisteredTokenState from 'javascript/views/virtual-screening/use-unregistered-token-state'


export type RemoteControlStatusType = {
  action : 'idle' | 'play' | 'pause' | 'trackTime'
  payload?: any
  isHost?: boolean
}

interface Props extends WithUserType {
  socketConn: SocketConnectionType
  remoteControl?: RemoteControlStatusType
  video: VideoType
  videoPlayerEventHandlers?: any
  volume?: null | number
}

const VideoPresentation: React.FC<Props> = ({
  remoteControl = { action: 'idle' },
  socketConn,
  user,
  video,
  videoPlayerEventHandlers = {},
  volume = null,
}) => {

  const { brightcove, wistia } = useVideoProviders()
  const virtualTokenState = useUnregisteredTokenState(user)

  return (
    <VideoView
      video={video}
      virtualToken={virtualTokenState.getUrlToken()}
      reportingType={'virtual_screening'}
      renderVideoView={(videoView) => {
        if (wistia && videoView['wistia-id']) {
          return (
            <div className="inline-video">
              <WistiaPlayer
                {...videoPlayerEventHandlers}
                id={videoView['wistia-id']}
                title={videoView.name}
                remoteControl={remoteControl}
                volume={volume}
                showControls={socketConn.isHost}
              />
            </div>
          )
        } else if (brightcove && videoView['brightcove-id']) {
          return (
            <BrightcovePlayer
              {...videoPlayerEventHandlers}
              id={videoView['brightcove-id']}
              brightcove={brightcove}
              autoPlay={false}
              remoteControl={remoteControl}
              controls={socketConn.isHost}
              volume={volume}
              shouldForceTimeToStartFrom
            />
          )
        } else if (videoView['mp4-url']) {
          return (
            <div className="static-video">
              <Mp4VideoPlayer
                {...videoPlayerEventHandlers}
                videoMp4Url={videoView['mp4-url']}
                autoPlay={false}
                remoteControl={remoteControl}
                showControls={socketConn.isHost}
                shouldForceTimeToStartFrom
                volume={volume}
              />
            </div>
          )
        } else {
          return <div className="loader"></div>
        }
      }}
    />
  )
}

export default withUser(VideoPresentation)
