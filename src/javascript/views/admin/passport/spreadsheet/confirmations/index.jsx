import React from 'react'

import { capitalize } from 'javascript/utils/generic-tools'

import Button from 'javascript/components/button'
import Form from 'javascript/views/admin/passport/spreadsheet/confirmations/form'
import Modal from 'javascript/components/modal'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'

const PassportSpreadsheetConfirmations = (props) => {

  const buttonClasses = 'button button--filled'

  const showConfirmationModal = (type) => {
    props.modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={ hideModal }
        title={`Manage ${capitalize(type)} Confirmations`}
      >
        <Form type={type} {...props} />
      </Modal>
    ))
  }

  return (
    <div className="container">
      <section className="panel ">
        <h3 className="cms-form__title cms-form__title--compact">Confirmations</h3>
          <div className="grid grid-three grid--end">
            {/* Commented out as per ONE-1490.  Could come back in the future, so leaving code here. 19/07/2019
              <div className="cms-form__control ">
                <Button type="button" className={buttonClasses} onClick={() => showConfirmationModal('flight')} >Flights</Button>
              </div>
            */}
            <div className="cms-form__control ">
              <Button type="button" className={buttonClasses} onClick={() => showConfirmationModal('transfer')} >Hotel Transfers</Button>
            </div>
            <div className="cms-form__control ">
              <Button type="button" className={buttonClasses} onClick={() => showConfirmationModal('hotel-reservation')} >Hotel Bookings</Button>
            </div>
          </div>
      </section>
    </div>
  )
}

export default withModalRenderer(PassportSpreadsheetConfirmations)
