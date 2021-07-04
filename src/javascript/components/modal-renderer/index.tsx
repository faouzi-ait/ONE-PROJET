import React, { useEffect } from 'react'
import useModalState from 'javascript/utils/hooks/use-modal-state'

const ModalRenderer = (props) => {
  const modalState = useModalState()
  const currState = modalState.modalInjectedState()
  const sharedState = modalState.modalSharedState()
  const modalIsVisible = modalState.isModalVisible()

  const handleEscapeKey = (e) => {
    if (e.keyCode == 27) {
      modalState.closeLastModal()
    }
  }

  useEffect(() => {
    if (modalIsVisible) {
      document.addEventListener('keydown', handleEscapeKey)
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [modalIsVisible])

  if (modalIsVisible) {
    const modalFunc = modalState.modalContent()
    const childModals = modalState.modalChildren()
    return (
      <>
        {modalFunc ? modalFunc({
          state: currState,
          hideModal: modalState.closeLastModal,
          showChildModal: modalState.showChildModal,
          sharedState: sharedState,
          setSharedState: modalState.setSharedState
        }) : null}

        { childModals.map((childModalFunc, index) => (
          <div key={`modal-child-${index}`}>
            { childModalFunc({
                state: currState,
                hideModal: modalState.closeLastModal,
                showChildModal: modalState.showChildModal,
                sharedState: sharedState,
                setSharedState: modalState.setSharedState
              })
            }
          </div>
        ))}
      </>
    )
  }
  return null
}

export default ModalRenderer