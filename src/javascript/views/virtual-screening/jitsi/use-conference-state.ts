import useReduxState from 'javascript/utils/hooks/use-redux-state'

interface State {
  hasAllowedAudio: boolean
  hasAllowedVideo: boolean
  hasJoinedConference: boolean
  isVideoMuted: boolean
  isAudioMutedByClient: boolean
  isAudioMutedForScreening: boolean
}

interface Actions {
  exitedConference: () => void
  joinedConference: () => void
  resetState: () => void
  setHasAllowedAudio: (isAllowed: boolean) => void
  setHasAllowedVideo: (isAllowed: boolean) => void
  setIsAudioMutedByClient: (isMuted: boolean) => void
  setIsAudioMutedForScreening: (isMuted: boolean) => void
  setIsVideoMuted: (isMuted: boolean) => void
  toggleAudioMuted: () => void
  toggleVideoMuted: () => void
}

type Selectors = {
  hasJoinedConference: () => boolean
  isVideoMuted: () => boolean
  isAudioMuted: () => boolean
}

const getInitialState = () => ({
  hasAllowedAudio: true,
  hasAllowedVideo: true,
  hasJoinedConference: false,
  isVideoMuted: false,
  isAudioMutedByClient: false,
  isAudioMutedForScreening: false,
})

const useConferenceState = () => {
  return useReduxState<State, Actions, Selectors>({
    key: 'jitsi-conference-state',
    initialState: getInitialState(),
    actions: {
      exitedConference: (state, isMuted) => ({
        ...state,
        hasJoinedConference: false,
      }),
      joinedConference: (state) => ({
        ...state,
        hasJoinedConference: true,
      }),
      resetState: (state) => getInitialState(),
      setIsVideoMuted: (state, isMuted) => ({
        ...state,
        isVideoMuted: isMuted,
      }),
      setHasAllowedAudio: (state, isAllowed) => ({
        ...state,
        hasAllowedAudio: isAllowed
      }),
      setHasAllowedVideo: (state, isAllowed) => ({
        ...state,
        hasAllowedVideo: isAllowed
      }),
      setIsAudioMutedByClient: (state, isMuted) => ({
        ...state,
        isAudioMutedByClient: isMuted,
      }),
      setIsAudioMutedForScreening: (state, isMuted) => ({
        ...state,
        isAudioMutedForScreening: isMuted,
      }),
      toggleAudioMuted: (state) => ({
        ...state,
        isAudioMutedByClient: !state.isAudioMutedForScreening ? !state.isAudioMutedByClient : state.isAudioMutedByClient,
      }),
      toggleVideoMuted: (state) => ({
        ...state,
        isVideoMuted: !state.isVideoMuted,
      }),
    },
    selectors: {
      hasJoinedConference: (state) => state.hasJoinedConference,
      isVideoMuted: (state) => !state.hasAllowedVideo || state.isVideoMuted,
      isAudioMuted: (state) => !state.hasAllowedAudio || state.isAudioMutedForScreening || state.isAudioMutedByClient,
    }
  })
}

export default useConferenceState
