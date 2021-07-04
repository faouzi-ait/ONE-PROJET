import React, { useState } from 'react'
import useWaitForLoading, { WaitForLoadingStateType } from 'javascript/utils/hooks/use-wait-for-loading'

export type WithWaitForLoadingDivType = {
  waitForLoading: WaitForLoadingStateType
  resetWaitForLoadingDiv: () => void
}

const withWaitForLoadingDiv = Component => props => {
  const [waitForDivIsVisible, setWaitForDivIsVisible] = useState(true)
  const waitForLoadingState = useWaitForLoading(() => setWaitForDivIsVisible(false))
  const setOnCompletion = waitForLoadingState.onCompletion

  const resetWaitForLoadingDiv = () => {
    waitForLoadingState.reset()
    setWaitForDivIsVisible(true)
  }

  const onCompletion = (callback = () => {}) => {
    setOnCompletion(() => {
      setWaitForDivIsVisible(false)
      callback()
    })
  }
  waitForLoadingState.onCompletion = onCompletion
  return (
    <>
      {waitForDivIsVisible &&
        <div
          className="hidden-wait-for-div"
          style={{
            position: 'absolute',
            top: '-1000px',
            left: '-1000px',
          }}
          data-testid="wait-for-loader"
        />
      }
      <Component {...props} waitForLoading={waitForLoadingState} resetWaitForLoadingDiv={resetWaitForLoadingDiv}/>
    </>
  )
}

export default withWaitForLoadingDiv