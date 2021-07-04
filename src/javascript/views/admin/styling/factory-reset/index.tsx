import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router'

import defaultApiStyles from 'javascript/config/default-api-styles'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

import { FadeInWrapper } from 'javascript/components/tabbed-config-form'
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'
import withModalRenderer, { WithModalType } from 'javascript/components/hoc/with-modal-renderer'

interface Props extends RouteComponentProps, WithModalType {}

const FactoryReset: React.FC<Props> = ({
  history,
  modalState
}) => {
  const { save: saveStyles } = useConfiguration('styles')
  const [isResetting, setIsResetting] = useState(false)

  modalState.watchVariables({
    isResetting,
  })

  const renderConfirmationModal = () => {
    modalState.showModal(({ state, hideModal }) => {
      const buttonClasses = ['button', 'button--error', state.isResetting && 'button--loading'].filter(Boolean).join(' ')
      return (
        <Modal
          closeEvent={ hideModal }
          title="Warning" modifiers={['']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
          <div className="cms-modal__content">
            <div className="cms-form">
              <p>Complete a Factory Reset?</p>
              <div className="cms-form__control cms-form__control--actions">
                <Button className="button button--filled" onClick={goBackToAdmin}>No</Button>
                <Button className={buttonClasses} onClick={forceFactoryReset}>Yes</Button>
              </div>
            </div>
          </div>
        </Modal>
      )
    })
  }

  const goBackToAdmin = () => {
    modalState.hideModal()
    history.push('/admin')
  }

  const forceFactoryReset = () => {
    setIsResetting(true)
    saveStyles({ styles: defaultApiStyles })
      .then((response) => {
        setTimeout(() => {
          goBackToAdmin()
        }, 1000) // slowed it down a little. At full speed it looks like nothing happened.
      })
  }

  return (
    <main>
      <FadeInWrapper className="sub-navigation sub-navigation--with-sub">
        <ul className="sub-navigation__list">
          <li key="back" className="sub-navigation__item">
            <Icon
              id="i-left-arrow"
              classes="sub-navigation__arrow"
            />
            <span
              className="sub-navigation__link sub-navigation__link--with-icon"
              onClick={goBackToAdmin}
            >
              Back
            </span>
          </li>
        </ul>
        <div className="sub-navigation__content">
          <h4 className="sub-navigation__link sub-navigation__link--is-active">
            Factory Reset
          </h4>
          <div className="sub-navigation__copy" >
            <h3>Caution!!</h3>
            <strong> This action is irreversible.</strong>
            <p>
              Clicking 'Confirm' will reset all your customised styling back to factory defaults.
              This cannot be undone. Please ensure you know what you are doing,
              this will have an immediate effect on how your website is portrayed.
            </p>
            <div className="cms-form__control cms-form__control--actions">
              <Button className="button button--filled" onClick={goBackToAdmin}>Cancel</Button>
              <Button className="button button--error" onClick={renderConfirmationModal}>Confirm</Button>
            </div>
          </div>
        </div>
      </FadeInWrapper>
    </main>
  )
}

export default withModalRenderer(FactoryReset)
