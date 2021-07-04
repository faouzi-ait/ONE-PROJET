/**
 * This component solves some legacy issues with our previous Modal,
 * being that you had to use ReactDOM.findDOMNode to give it an 'is-hiding' state.
 * With this modal, you can just pass in an 'isOpen' prop and a closeEvent and it'll
 * handle that all for you. No extra wrappers required.
 */
import React, { useEffect, useState } from 'react'
import Modal from '.'

interface Props {
  isOpen: boolean
  closeEvent: () => void
}

type ModalState = 'closed' | 'open' | 'is-closing'

export const ModalAsComponent: React.FC<Props> = ({
  isOpen,
  closeEvent,
  children,
  ...props
}) => {
  const [modalState, setModalState] = useState<ModalState>(
    isOpen ? 'open' : 'closed',
  )
  useEffect(() => {
    if (isOpen) {
      setModalState('open')
    } else if (modalState !== 'closed') {
      setModalState('is-closing')
      setTimeout(() => {
        setModalState('closed')
      }, 500)
    } else {
      setModalState('closed')
    }
  }, [isOpen])

  if (modalState === 'closed') {
    return null
  }

  return (
    <Modal
      {...props}
      closeEvent={closeEvent}
      isHiding={modalState === 'is-closing'}
    >
      {children}
    </Modal>
  )
}
