import { useEffect } from 'react'
import useReduxState from 'javascript/utils/hooks/use-redux-state'

import { UserDetailsType } from 'javascript/views/virtual-screening/use-sockets'

const WAITING_FOR_CLIENTS_TIMEOUT = 4000

interface State {
  clientsAreLoading: boolean,
  onlineClients: UserDetailsType[],
  stillWaitingFor: UserDetailsType[],
  timer: any,
}

interface Actions {
  finishedWaiting: () => void
  receivedClientResponse: (payload: { userDetails: UserDetailsType }) => void
  resetWaitingAllClients: () => void
  setOnlineClientsStatus: (payload: { attendees: UserDetailsType[] }) => void
  startWaitingForClientResponses: () => void
}

type Selectors = {
  clientsAreLoadingVideos: () => boolean
  stillWaitingForClientsResponses: () => boolean
  waitingStatus: () => {
    stillWaiting: boolean
    clientsAreLoading: boolean
  }
}

const getInitialState = () => ({
  clientsAreLoading: false,
  onlineClients: [],
  stillWaitingFor: [],
  timer: null,
})

const finishedWaitingState = () => ({
  stillWaitingFor: [],
  timer: null,
})

const resetWaitingAllClientsState = () => ({
  clientsAreLoading: false,
  stillWaitingFor: [],
  timer: null,
})

const useAllVideosReady = (allClientsReadyCallback = () => {}) => {
  const allVideosReadyState = useReduxState<State, Actions, Selectors>({
    key: 'allVideosReady',
    initialState: getInitialState(),
    actions: {
      finishedWaiting: (state) => {
        clearTimeout(state.timer)
        return {
          ...state,
          ...finishedWaitingState()
        }
      },
      receivedClientResponse: (state, payload) => {
        const updatedClientsWaiting = [...state.stillWaitingFor].filter((clientWaitingFor) => {
          return clientWaitingFor.id != payload.userDetails.id
        })
        return {
          ...state,
          stillWaitingFor: updatedClientsWaiting
        }
      },
      resetWaitingAllClients: (state) => {
        clearTimeout(state.timer)
        return {
          ...state,
          ...resetWaitingAllClientsState(),
        }
      },
      setOnlineClientsStatus: (state, payload) => {
        return {
          ...state,
          onlineClients: (payload.attendees || []).filter((attendee) => attendee.online && attendee.attendeeType !== 'host' && attendee.attendeeStatus === 'active')
        }
      },
      startWaitingForClientResponses: (state) => {
        return {
          ...state,
          timer: startTimeout(),
          clientsAreLoading: true,
          stillWaitingFor: [...state.onlineClients]
        }
      },
    },
    selectors: {
      clientsAreLoadingVideos: (state) => state.clientsAreLoading,
      stillWaitingForClientsResponses: (state) => state.stillWaitingFor.length > 0,
      waitingStatus: (state) => ({
        stillWaiting: state.stillWaitingFor.length > 0,
        clientsAreLoading: state.clientsAreLoading,
      })
    }
  })

  const { stillWaiting, clientsAreLoading } =  allVideosReadyState.waitingStatus()

  useEffect(() => {
    if (clientsAreLoading && !stillWaiting) {
      allClientsReadyCallback()
      setTimeout(() => {
        allVideosReadyState.resetWaitingAllClients()
      }, 200)
    }
  }, [stillWaiting, clientsAreLoading])

  const startTimeout = () => {
    return setTimeout(() => {
      allVideosReadyState.finishedWaiting()
    }, WAITING_FOR_CLIENTS_TIMEOUT)
  }

  return allVideosReadyState
}

export default useAllVideosReady


