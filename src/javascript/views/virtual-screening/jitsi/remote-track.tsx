import React, { RefObject } from 'react'
import Icon from 'javascript/components/icon'
import { capitalize } from 'javascript/utils/generic-tools'

interface Props {
  trackIds: any[]
  isCurrentSpeaker: boolean
  view?: string
}

interface State {
  isAudioMuted: boolean
  isVideoMuted: boolean
  participantId: string
  participantName: string
  selectedVideoId: string
  selectedMicId: string
}

class RemoteTrack extends React.Component<Props, State> {

  videoRef: RefObject<HTMLVideoElement>
  micRef: RefObject<HTMLAudioElement>
  trackList: any[]

  constructor (props) {
    super(props)
    this.state = {
      isAudioMuted: false,
      isVideoMuted: false,
      participantId: '',
      participantName: '',
      selectedVideoId: '',
      selectedMicId: '',
    }
    this.videoRef = React.createRef()
    this.micRef = React.createRef()
    this.trackList = []
  }

  componentDidMount () {
    const { trackIds = [] } = this.props
    const trackIdCache = trackIds.reduce((acc, track) => ({ ...acc, [track.id]: track.id}), {})
    const { participantId, participantName } = this.getParticipantInfoFromJitsi(this.props.trackIds)

    this.trackList = window.jitsiGlobals.remoteTracks.filter((rt) => trackIdCache[rt.id])
    const videoTrack = this.trackList.find((tr) => tr.type === 'video')
    const micTrack = this.trackList.find((tr) => tr.type === 'audio')
    if (videoTrack || micTrack) {
      const newState = {
        participantId,
        participantName
      } as State
      if (videoTrack) {
        this.updateTrack(videoTrack, 'set')
        newState.selectedVideoId = videoTrack.id
        newState.isVideoMuted = videoTrack.track.isMuted()
      }
      if (micTrack) {
        this.updateTrack(micTrack, 'set')
        newState.selectedMicId = micTrack.id
        newState.isAudioMuted = micTrack.track.isMuted()
      }
      this.setState(newState)
    }

    if (window.jitsiGlobals.activeRoom) {
      window.jitsiGlobals.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, this.onTrackMuteChanged)
    }
  }

  componentDidUpdate (prevProps) {
    const currentTrackIdText = this.props.trackIds.map((tr) => tr.id).join(',')
    const previousTrackIdText = prevProps.trackIds.map((tr) => tr.id).join(',')

    const viewHasChanged = prevProps.view !== this.props.view
    if (viewHasChanged) {
      this.reAttachFeeds(this.state.selectedMicId)
      if (this.props.view === 'conference') {
        this.reAttachFeeds(this.state.selectedVideoId)
      }
    }
    if (currentTrackIdText !== previousTrackIdText) {
      const { participantId, participantName } = this.getParticipantInfoFromJitsi(this.props.trackIds)
      this.trackList = window.jitsiGlobals.remoteTracks.filter((rt) => rt.participantId === participantId)
      const videoTrack = this.trackList.find((tr) => tr.type === 'video')
      const micTrack = this.trackList.find((tr) => tr.type === 'audio')
      const newState = {
        participantId,
        participantName
      } as State
      if (videoTrack) {
        const { selectedVideoId } = this.state
        if (videoTrack.id !== selectedVideoId) {
          let oldVideoTrack = this.trackList.find((tr) => tr.id === selectedVideoId)
          if (oldVideoTrack) {
              this.updateTrack(oldVideoTrack, 'clear')
          }
          this.updateTrack(videoTrack, 'set')
          newState.selectedVideoId = videoTrack.id
          newState.isVideoMuted = videoTrack.track.isMuted()
        }
      }
      if (micTrack) {
        const { selectedMicId } = this.state
        if (micTrack.id !== selectedMicId) {
          const oldMicTrack = this.trackList.find((tr) => tr.id === selectedMicId)
          if (oldMicTrack) {
              this.updateTrack(oldMicTrack, 'clear')
          }
          this.updateTrack(micTrack, 'set')
          newState.selectedMicId = micTrack.id
          newState.isAudioMuted = micTrack.track.isMuted()
        }
      }
      this.setState(newState)
    }
  }

  componentWillUnmount () {
    const { selectedVideoId, selectedMicId } = this.state
    const videoTrack = this.trackList.find((tr) => tr.id === selectedVideoId)
    if (videoTrack) {
      try {
        this.updateTrack(videoTrack, 'clear')
      } catch (error) {
        console.error(error.message)
      }
    }
    const micTrack = this.trackList.find((tr) => tr.id === selectedMicId)
    if (micTrack) {
      try {
        this.updateTrack(micTrack, 'clear')
      } catch (error) {
        console.error(error.message)
      }
    }
    if (window.jitsiGlobals?.activeRoom) {
      window.jitsiGlobals.activeRoom.removeEventListener(window.JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, this.onTrackMuteChanged)
    }
  }

  reAttachFeeds = (trackId) => {
    const currentTracks = window.jitsiGlobals.remoteTracks.filter((rt) => rt.participantId === this.state.participantId)
    const oldTrack = currentTracks.find((tr) => tr.id === trackId)
    if (oldTrack) {
      this.updateTrack(oldTrack, 'clear')
      this.updateTrack(oldTrack, 'set')
    }
  }

  getParticipantInfoFromJitsi = (trackIds) => {
    const participantId = trackIds.map((tid) => tid.participantId)[0]
    const participantName = window.jitsiGlobals.activeRoom.getParticipantById(participantId)?._displayName
    return { participantId, participantName }
  }

  onTrackMuteChanged = (changedTrack) => {
    if (changedTrack.getParticipantId() === this.state.participantId) {
      const muteType = capitalize(changedTrack.type)
      //@ts-ignore
      this.setState({
        [`is${muteType}Muted`]: changedTrack.isMuted()
      })

    }
  }

  updateTrack = (track, action = 'clear') => {
    if (action === 'clear') {
      if (track) {
        switch (track.type) {
          case 'audio': {
            if (this.micRef.current) {
              track.track.detach(this.micRef.current)
            }
            break
          }
          case 'video': {
            if (this.videoRef.current) {
              track.track.detach(this.videoRef.current)
            }
            break
          }
        }
      }
    } else if (action === 'set') {
      if (track) {
        switch (track.type) {
          case 'audio': {
            if (this.micRef.current) {
              track.track.attach(this.micRef.current)
            }
            break
          }
          case 'video': {
            if (this.videoRef.current) {
              track.track.attach(this.videoRef.current)
            }
            break
          }
        }
      }
    }
  }

  render () {
    const { isCurrentSpeaker, view } = this.props
    const { isAudioMuted, isVideoMuted, participantName } = this.state
    return (
      <div className={`jitsi__remote-track ${isCurrentSpeaker ? 'jitsi__remote-track--main' : `jitsi__remote-track--${view}`}`}>
        <div>
          <audio autoPlay={true} ref={this.micRef} />
        </div>
        {view !== 'cinema' && (
          <>
            <video autoPlay={true} ref={this.videoRef} />
            {isVideoMuted && (
              <div className="jitsi__video-muted">
                <Icon id="i-video-mute" />
              </div>
            )}
            <div className="jitsi__video-tag">
              {isAudioMuted && (
                <div className="jitsi__video-tag-icon">
                  <Icon id="i-microphone-mute" />
                </div>
              )}
              {participantName}
            </div>
          </>
        )}
      </div>
    )
  }
}

export default RemoteTrack
