import React from 'react'
import useModalState, { ModalStateType } from 'javascript/utils/hooks/use-modal-state'

export type WithModalType = {
  modalState: ModalStateType
}

const withModalRenderer = Component => props => {
  const modalState = useModalState()
  return <Component {...props} modalState={modalState} />
}

export default withModalRenderer