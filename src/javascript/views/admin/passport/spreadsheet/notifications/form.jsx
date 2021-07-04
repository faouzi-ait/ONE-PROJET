import React, { useState } from 'react'

// Components
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'

const PassportNotificationsForm = (props) => {

  const { defaultText, onSubmit, hideModal } = props
  const [emailText, setEmailText] = useState(defaultText)
  const [isLoading, setIsLoading] = useState(false)
  const buttonClasses = isLoading ? 'button button--filled button--loading' : 'button button--filled'

  const handleInputChange = ({ target }) => {
    setEmailText(target.value)
  }

  const sendClicked = () => {
    onSubmit(emailText)
    setIsLoading(true)
  }

  return (
    <div className="cms-modal__content">
      <FormControl type="textarea" label="Email Content:" name="text" value={emailText} required onChange={handleInputChange} />
      <div className="cms-form__control cms-form__control--actions">
        <Button type="button" className="button" onClick={hideModal} >Cancel</Button>
        <Button type="button" className={buttonClasses} onClick={sendClicked} >Send</Button>
      </div>
    </div>
  )
}

export default PassportNotificationsForm
