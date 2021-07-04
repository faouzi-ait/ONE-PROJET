import React, { useEffect, useState } from 'react'
import { Location } from 'history'
import { Prompt, withRouter, RouteComponentProps } from 'react-router-dom'
import useModalState from 'javascript/utils/hooks/use-modal-state'

interface Props extends RouteComponentProps {
  when?: boolean | undefined
  renderModal: (actions: {
    leave: (callback?: any) => (event?: any) => void,
    stay: () => (event?: any) => void
  }) => JSX.Element
}

const RouteLeavingGuard: React.FC<Props> = ({
  when,
  history,
  renderModal,
}) => {

  const modalState = useModalState()
  const [modalVisible, setModalVisible] = useState(false)
  const [lastLocation, setLastLocation] = useState<Location | null>(null)
  const [confirmedNavigation, setConfirmedNavigation] = useState(false)

  const handleBlockedNavigation = (nextLocation: Location): boolean => {
    const { location } = history
    const currState: {} = location.state || {}
    location.state = {
      ...currState,
      hideModalExempt: true /* Application Layout has a browserHistory.listen that calls hideModal - This exemption prevents that */
    }
    if (!confirmedNavigation) {
      setModalVisible(true)
      setLastLocation(nextLocation)
      return false;
    }
    return true;
  }

  const leave = (callback, lastLocationState = lastLocation) => {
    setModalVisible(false)
    setConfirmedNavigation(true)
    setImmediate(() => {
      if (callback && typeof callback === 'function') {
        callback(lastLocationState)
      } else {
        history.push(lastLocationState)
      }
    })
  }

  const stay = () => (e) => {
    setConfirmedNavigation(false)
    setModalVisible(false)
  }

  modalState.watchVariables({
    lastLocation,
  })

  useEffect(() => {
    if (modalVisible) {
      modalState.showModal(({ state }) => renderModal({ stay, leave: (callback) => (e) => leave(callback, state.lastLocation) }))
    } else {
      modalState.hideModal()
    }
  }, [modalVisible])

  return (
    <>
      <Prompt when={when} message={handleBlockedNavigation} />
    </>
  )
}

export default withRouter(RouteLeavingGuard)
