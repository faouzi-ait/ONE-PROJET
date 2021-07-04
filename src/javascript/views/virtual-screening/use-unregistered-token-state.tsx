import useReduxState from 'javascript/utils/hooks/use-redux-state'
import { UserType } from 'javascript/types/ModelTypes'


interface State {
  urlToken: string | null
  attendeeSocketToken: string | null
}

interface Actions {
  setAttendeeSocketToken: (payload: string) => void
  setUrlToken: (payload: string) => void
  resetTokens: () => void
}

type Selectors = {
  injectToken: (payload?: any) => any
  attendeeSocketToken: () => string
  getUrlToken: () => string

}

const getInitialState = (token = null) => {
  return {
    urlToken: token,
    attendeeSocketToken: null
  }
}

const useUnregisteredTokenState = (user: UserType, token?: string) => {
  return useReduxState<State, Actions, Selectors>({
    key: 'unregistered-virtual-token',
    initialState: getInitialState(token),
    actions: {
      setAttendeeSocketToken: (state, payload) => {
        return {
          ...state,
          attendeeSocketToken: payload
        }
      },
      setUrlToken: (state, payload) => {
        return {
          ...state,
          urlToken: payload
        }
      },
      resetTokens: (state) => {
        return getInitialState(token)
      },
    },
    selectors: {
      injectToken: (state, payload = {}) => {
        const queryParamWithToken = { ...payload }
        queryParamWithToken['virtual-meeting-token'] = state.urlToken
        return queryParamWithToken
      },
      attendeeSocketToken: (state) => state.attendeeSocketToken,
      getUrlToken: (state) => state.urlToken,
    }
  })
}

export default useUnregisteredTokenState


