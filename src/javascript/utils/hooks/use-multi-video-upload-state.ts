import useReduxState from 'javascript/utils/hooks/use-redux-state'

export type VideoUploadType = {
  id: string
  name: string
  progress: number
  response: {
    data: any
  }
  restricted: boolean
  secondsLeft: number
}

interface LastVideoUploadedType {
  id: number | null
  'wistia-id'?: number
}

interface State {
  allUploadsCompleted: boolean
  lastVideoCompleted: LastVideoUploadedType
  unSavedChanges: boolean
  videos: VideoUploadType[]
}

interface Actions {
  resetState: () => void
  setAllUploadsCompleted: (status: boolean) => void
  setUnSavedChanges: (status: boolean) => void
  setVideoErrored: (payload: { id: string, error: any }) => void
  setVideoProgress: (payload: { id: string, progressEvent?: ProgressEvent, percentComplete?: number, secondsLeft?: number }) => void
  setVideosToUpload: (videos: VideoUploadType[]) => void
  setVideoUploaded: (payload: { id: string, key?: string, response: { data?: any, completed?: boolean } }) => void
}

type Selectors = {
  allUploadsCompleted: () => boolean
  lastVideoCompleted: () => LastVideoUploadedType
  unSavedChanges: () => boolean
  videos: () => VideoUploadType[]
}

const getInitialState = () => ({
  allUploadsCompleted: true,
  lastVideoCompleted: { id: null },
  unSavedChanges: false,
  videos: [],
})

export const useWistiaMultiVideoUploadState = () => {
  return useReduxState<State, Actions, Selectors>({
    key: 'multiVideoUploads',
    initialState: getInitialState(),
    actions: {
      resetState: (state) => getInitialState(),
      setAllUploadsCompleted: (state, status) => ({
        ...state,
        allUploadsCompleted: status
      }),
      setUnSavedChanges: (state, status) => ({
        ...state,
        unSavedChanges: status
      }),
      setVideosToUpload: (state, videos) => ({
        ...getInitialState(),
        allUploadsCompleted: false,
        videos,
        unSavedChanges: true
      }),
      setVideoProgress: (state, payload) => ({
        ...state,
        videos: state.videos.map((video) => ({
          ...video,
          ...(video.id === payload.id && { progress: payload.progressEvent.loaded / payload.progressEvent.total})
        })),
      }),
      setVideoUploaded: (state, payload) => ({
        ...state,
        lastVideoCompleted: { id: payload.id, 'wistia-id': payload.response.data.hashed_id },
        videos: state.videos.map((video) => ({
          ...video,
          ...(video.id === payload.id && {
            ...payload.response.data,
            'wistia-id': payload.response.data.hashed_id,
            'progress': 1,
            id: payload.id,
          }),
        }))
      }),
      setVideoErrored: (state, payload) => ({
        ...state,
        videos: state.videos.map((video) => ({
          ...video,
          ...(video.id === payload.id && {
            ...payload.error,
            id: payload.id,
          }),
        }))
      }),
    },
    selectors: {
      allUploadsCompleted: (state) => state.allUploadsCompleted,
      lastVideoCompleted: (state) => state.lastVideoCompleted,
      unSavedChanges: (state) => state.unSavedChanges,
      videos: (state) => state.videos,
    }
  })
}

export const useBrightcoveMultiVideoUploadState = () => {
  return useReduxState<State, Actions, Selectors>({
    key: 'multiVideoUploads',
    initialState: getInitialState(),
    actions: {
      resetState: (state) => getInitialState(),
      setAllUploadsCompleted: (state, status) => ({
        ...state,
        allUploadsCompleted: status
      }),
      setUnSavedChanges: (state, status) => ({
        ...state,
        unSavedChanges: status
      }),
      setVideosToUpload: (state, videos) => ({
        ...getInitialState(),
        allUploadsCompleted: false,
        videos,
        unSavedChanges: true
      }),
      setVideoProgress: (state, payload) => ({
        ...state,
        videos: state.videos.map((video) => ({
          ...video,
          ...(video.id === payload.id && { progress: payload.percentComplete, secondsLeft: payload.secondsLeft})
        })),
      }),
      setVideoUploaded: (state, payload) => ({
        ...state,
        lastVideoCompleted: { id: payload.response.data.id, 'brightcove-id': payload.response.data.video_id, key: payload.key },
        videos: state.videos.map((video) => ({
          ...video,
          ...(video.id === payload.id && {
            ...payload.response.data,
            'brightcove-id': payload.response.data.video_id,
            'progress': 1,
            id: payload.response.data.id,
            key: payload.key
          }),
        }))
      }),
      setVideoErrored: (state, payload) => ({
        ...state,
        videos: state.videos.map((video) => ({
          ...video,
          ...(video.id === payload.id && {
            ...payload.error,
            id: payload.id,
          }),
        }))
      }),
    },
    selectors: {
      allUploadsCompleted: (state) => state.allUploadsCompleted,
      lastVideoCompleted: (state) => state.lastVideoCompleted,
      unSavedChanges: (state) => state.unSavedChanges,
      videos: (state) => state.videos,
    }
  })
}
