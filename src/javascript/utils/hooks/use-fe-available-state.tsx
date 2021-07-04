import React, { useEffect } from 'react'
import BearWith from 'javascript/components/bear-with'
import useReduxState from 'javascript/utils/hooks/use-redux-state'

import { subscribeToMaintenanceErrorEmitter, unsubscribeToMaintenanceErrorEmitter } from  'javascript/utils/insertApiMiddleware'

interface State {
  isAvailable: boolean
}

interface Actions {
  makeFrontEndUnavailable: () => void
}

type Selectors = {
  isFrontEndAvailable: () => boolean
}

const getInitialState = () => ({
  isAvailable: true,
})

const useFeAvailableState = () => {
  return useReduxState<State, Actions, Selectors>({
    key: 'feAvailability',
    initialState: getInitialState(),
    actions: {
      makeFrontEndUnavailable: (state) => ({
        ...state,
        isAvailable: false,
      }),
    },
    selectors: {
      isFrontEndAvailable: (state) => state.isAvailable,
    }
  })
}
export default useFeAvailableState


interface Props {
  renderFrontEnd: () => JSX.Element
}

export const IsFrontEndAvailable: React.FC<Props> = ({
  renderFrontEnd
}) => {
  const feAvailabilityState = useFeAvailableState()
  if (feAvailabilityState.isFrontEndAvailable()) {
    return renderFrontEnd()
  } else {
    return <BearWith />
  }
}

export const withFeAvailablityCheck = (Component) => (props) => {
  const feAvailabilityState = useFeAvailableState()
  const report503Received = () => {
    feAvailabilityState.makeFrontEndUnavailable()
  }

  useEffect(() => {
    subscribeToMaintenanceErrorEmitter(report503Received)
    return unsubscribeToMaintenanceErrorEmitter(report503Received)
  }, [])
  return <Component {...props} />
}