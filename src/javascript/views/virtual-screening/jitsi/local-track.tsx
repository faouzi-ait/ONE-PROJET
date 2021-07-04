import React, { RefObject } from 'react'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import useConferenceState from 'javascript/views/virtual-screening/jitsi/use-conference-state'

import { ConferenceViewType } from 'javascript/views/virtual-screening/jitsi/conference'
import NoVideoFeed from 'javascript/views/virtual-screening/jitsi/no-video-feed'
import Icon from 'javascript/components/icon'

interface Props {
  activeRoomId: string
  isAudioMuted: boolean
  isVideoMuted: boolean
  defaultMicId: string
  defaultVideoId: string
  onTrackReady?: () => void
  setHasAllowedVideo: (isAllowed: boolean) => void
  setHasAllowedAudio: (isAllowed: boolean) => void
  view: ConferenceViewType
}

interface State {
  errorMsg: null | string
  loaded: boolean
  needsUserInteraction: boolean
  selectedMicDeviceId: string
  selectedVideoDeviceId: string
}

class LocalTrack extends React.Component<Props, State> {

  videoRef: RefObject<HTMLVideoElement>
  micRef: RefObject<HTMLAudioElement>
  trackList: any[]

  constructor (props) {
    super(props)
    this.state = {
      errorMsg: null,
      loaded: false,
      needsUserInteraction: false,
      selectedMicDeviceId: 'none',
      selectedVideoDeviceId: 'none',
    }
    this.videoRef = React.createRef()
    this.micRef = React.createRef()
    this.trackList = []
  }

  componentDidMount () {
    const { defaultMicId, defaultVideoId, activeRoomId } = this.props
    window.JitsiMeetJS?.createLocalTracks({
      devices: ['audio', 'video'],
      resolution: 720,
      constraints: {
        video: {
          aspectRatio: 16 / 9,
          height: {
            ideal: 720,
            max: 720,
            min: 240
          }
        }
      },
    })
    .then((tracks) => {
      let availableTrackVideoId
      let availableTrackMicId
      for (let track of tracks) {
        if (!availableTrackMicId && track.type === 'audio') {
          availableTrackMicId = track.deviceId
          this.trackList.push(track)
        }
        if (!availableTrackVideoId && track.type === 'video') {
          availableTrackVideoId = track.deviceId
          this.trackList.push(track)
        }
      }
      this.setState({
        loaded: true,
        selectedMicDeviceId: availableTrackMicId || defaultMicId,
        selectedVideoDeviceId: availableTrackVideoId || defaultVideoId,
      }, () => {
        const { selectedMicDeviceId, selectedVideoDeviceId } = this.state
        this.updateLocalTrack(selectedMicDeviceId, 'set')
        this.updateLocalTrack(selectedVideoDeviceId, 'set')
        if (activeRoomId && window.jitsiGlobals.activeRoom) {
          const videoTrack = this.trackList.find((t) => t.deviceId === selectedVideoDeviceId)
          const micTrack = this.trackList.find((t) => t.deviceId === selectedMicDeviceId)
          if (videoTrack) {
            window.jitsiGlobals.activeRoom.addTrack(videoTrack)
          }
          if (micTrack) {
            window.jitsiGlobals.activeRoom.addTrack(micTrack)
          }
        }
      })
    })
    .catch((error) => {
      this.props.onTrackReady?.()
      this.setState({
        errorMsg: error.message
      })
    })
  }

  updateLocalTrack = (deviceId, action = 'clear') => {
    if (action === 'clear') {
      const clearTrack = this.trackList.find((t) => t.deviceId === deviceId )
      if (clearTrack) {
        switch (clearTrack.getType()) {
          case 'audio': {
            if (this.micRef.current) {
              clearTrack.detach(this.micRef.current)
              clearTrack.dispose()
            }
            break
          }
          case 'video': {
            if (this.videoRef.current) {
              clearTrack.detach(this.videoRef.current)
              clearTrack.dispose()
            }
            break
          }
        }
      }
    } else if (action === 'set') {
      const setTrack = this.trackList.find((t) => t.deviceId === deviceId)
      if (setTrack) {
        switch (setTrack.getType()) {
          case 'audio': {
            if (this.micRef.current) {
              setTrack.attach(this.micRef.current)
              setTrack.mute()
            }
            break
          }
          case 'video': {
            if (setTrack && this.videoRef.current) {
              setTrack.attach(this.videoRef.current)
            }
            break
          }
        }
      }
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const { selectedMicDeviceId, selectedVideoDeviceId } = this.state
    if (this.state.loaded && this.state.loaded !== prevState.loaded) {
      this.props.onTrackReady?.()
    }
    if (this.props.activeRoomId && window.jitsiGlobals.activeRoom) {
      if (this.props.activeRoomId !== prevProps.activeRoomId) {
        const videoTrack = this.trackList.find((t) => t.deviceId === selectedVideoDeviceId)
        const micTrack = this.trackList.find((t) => t.deviceId === selectedMicDeviceId)
        if (videoTrack) {
          window.jitsiGlobals.activeRoom.addTrack(videoTrack)
          if (this.videoRef.current?.paused) {
            this.videoRef.current.play()
            this.setState({
              needsUserInteraction: this.videoRef.current?.paused
            })
          }
        } else {
          this.props.setHasAllowedVideo(false)
        }
        if (micTrack) {
          window.jitsiGlobals.activeRoom.addTrack(micTrack).then((updatedMic) => {
            if (this.props.isAudioMuted) {
              micTrack.mute()
            }
          })
        } else {
          this.props.setHasAllowedAudio(false)
        }
      }
      if (this.props.isAudioMuted !== prevProps.isAudioMuted) {
        const micTrack = this.trackList.find((t) => t.deviceId === selectedMicDeviceId )
        if (micTrack) {
          this.props.isAudioMuted ? micTrack.mute() : micTrack.unmute()
        }
      }
      if (this.props.isVideoMuted !== prevProps.isVideoMuted) {
        const videoTrack = this.trackList.find((t) => t.deviceId === selectedVideoDeviceId )
        if (videoTrack) {
          this.props.isVideoMuted ? videoTrack.mute() : videoTrack.unmute()
        }
      }
    }
  }

  componentWillUnmount () {
    const { selectedMicDeviceId, selectedVideoDeviceId } = this.state
    this.updateLocalTrack(selectedMicDeviceId, 'clear')
    this.updateLocalTrack(selectedVideoDeviceId, 'clear')
  }

  render () {
    const { isAudioMuted, isVideoMuted, view } = this.props
    const { errorMsg, loaded } = this.state

    if (!loaded || errorMsg) {
      if (errorMsg) {
        console.error('--------------- Jitsi error --------------- \n', errorMsg, '\n-------------------------------------------')
      }
      return (
        <div className={`jitsi__local-track jitsi__local-track--${view}`}>
          <NoVideoFeed
            isMuted={true}
            isLoading={!errorMsg}
            size={view === 'solo' ? 'main' : 'local-thumbnail'}
            tag={view === 'solo' ? 'Unable to connect video!' : ''}
          />
        </div>
      )
    }

    return (
      <div className={`jitsi__local-track jitsi__local-track--${view}`}>
        {isVideoMuted && (
          <div className="jitsi__video-muted">
            <Icon id="i-video-mute" />
          </div>
        )}
        <video autoPlay={true} ref={this.videoRef} />
        {this.state.needsUserInteraction && (
          <button className="jitsi__reload-button" style={{position: 'absolute'}}
            onClick={() => {
              this.videoRef.current.play()
              this.setState({
                needsUserInteraction: false
              })
            }}
          >
            Reload
          </button>
        )}
        {isAudioMuted && (
          <div className="jitsi__video-tag">
            <div className="jitsi__video-tag-icon">
              <Icon id="i-microphone-mute" />
            </div>
          </div>
        )}
      </div>
    )
  }
}

const enhance = compose(
  withHooks((props) => {
    const conferenceState = useConferenceState()
    return {
      isAudioMuted: conferenceState.isAudioMuted(),
      isVideoMuted: conferenceState.isVideoMuted(),
      setHasAllowedAudio: conferenceState.setHasAllowedAudio,
      setHasAllowedVideo: conferenceState.setHasAllowedVideo,
    }
  })
)

export default enhance(LocalTrack)
