import React from 'react'
import Modal from 'javascript/components/modal'

interface Props {
  featureName: string
  hideModal: () => void
}

const UpgradeModal: React.FC<Props> = ({
  featureName,
  hideModal,
}) => {
  return (
    <Modal
      closeEvent={hideModal}
      title={'Support Information'}>
      <div className="cms-modal__content">
        <p>
          {`You must have “${featureName}” enabled to see this feature.
          Please contact your account manager to add this package to your subscription.`}</p>
      </div>
    </Modal>
  )
}

export default UpgradeModal
