import React, { useState } from 'react'

import compose from 'javascript/utils/compose'

// Components
import Button from 'javascript/components/button'
import Form from 'javascript/views/admin/passport/spreadsheet/notifications/form'
import FormControl from 'javascript/components/form-control'
import Modal from 'javascript/components/modal'

// Hooks
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import { withRouter } from 'react-router-dom'

const PassportSpreadsheetNotifications = (props) => {

  const [selected, setSelected] = useState('')
  const [errors, setErrors] = useState({})
  const buttonClasses = selected.length ? 'button button--filled' : 'button'
  const notificationType = {
    itinerary_update_reminder: {
      name: 'Itinerary Update Reminder',
      text: 'Please remember to update your itinerary'
    },
    itinerary_summary: {
      name: 'Itinerary Summary',
      text: 'Here is a summary of your itinerary'
    },
    key_information_reminder: {
      name: 'Key Information Reminder',
      text: 'Here is your key information'
    }
  }

  const handleCheckboxSelect = ({ target }) => {
    setSelected(target.name)
    const updateErrors = Object.assign({}, errors)
    delete updateErrors.selectNotificationType
    setErrors(updateErrors)
  }

  const sendNotifications = (text) => {
    const notification = {
      'notification-type': selected,
      'text' : text,
      'market-id': props.marketId
    }
    props.createNotification(notification)
  }

  const showSendNotification = (e) => {
    e.preventDefault()
    const updateErrors = Object.assign({}, errors)
    if (!selected.length) {
      updateErrors.selectNotificationType = 'Please select a notification type to send'
    }
    if (Object.keys(updateErrors).length)  {
      return setErrors(updateErrors)
    }
    props.modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={ hideModal }
        title={`Send Notification`}
      >
        <Form defaultText={notificationType[selected].text} onSubmit={sendNotifications} hideModal={hideModal} />
      </Modal>
    ))
  }

  const renderErrors = () => {
    if (!errors) return null
    return (
      <ul className="cms-form__errors">
        {Object.keys(errors).map((key, i) => {
          const error = errors[key]
          return (
            <li key={i}>{error}</li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="container">
      <form className="cms-form cms-form--large" onSubmit={showSendNotification}>
        <section className="panel ">
          <h3 className="cms-form__title cms-form__title--compact">Notifications</h3>
          <div className="grid grid--stretch grid-three">
            <div>
              <FormControl type="checkbox" label=''
                checkboxLabel={notificationType.itinerary_update_reminder.name}
                id='itinerary_update_reminder'
                name='itinerary_update_reminder'
                onChange={handleCheckboxSelect}
                checked={selected === 'itinerary_update_reminder'}
              />
              <FormControl type="checkbox" label=''
                checkboxLabel={notificationType.itinerary_summary.name}
                id='itinerary_summary'
                name='itinerary_summary'
                onChange={handleCheckboxSelect}
                checked={selected === 'itinerary_summary'}
              />
              <FormControl type="checkbox" label=''
                checkboxLabel={notificationType.key_information_reminder.name}
                id='key_information_reminder'
                name='key_information_reminder'
                onChange={handleCheckboxSelect}
                checked={selected === 'key_information_reminder'}
              />
            </div>
            <div>{renderErrors()}</div>
            <div className="grid grid--end">
              <div className="cms-form__control ">
                <Button type="submit" className={buttonClasses}>Send Notification</Button>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}

const enhance = compose(
  withModalRenderer,
  withRouter,
  withHooks(props => {

    const { marketId } = props.match.params
    const notificationsResource = useResource('passport-notification', 'passport')

    useWatchForTruthy(notificationsResource.mutationState.succeeded, () => {
      props.modalState.hideModal()
    })

    return {
      ...props,
      marketId,
      createNotification: notificationsResource.createResource,
    }

  })
)

export default enhance(PassportSpreadsheetNotifications)
