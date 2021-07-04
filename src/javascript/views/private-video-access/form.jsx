import React, { useState } from 'react'

import FormControl from 'javascript/components/form-control'

const PrivateVideoPasswordForm = (props) => {

  const { closeEvent, passwordEntered } = props

  const [password, setPassword] = useState('');

  const buttonClasses = ['button', 'filled'].join(' button--')

  const handleClick = () => {
    closeEvent()
    passwordEntered(password.trim())
  }

  return (
    <div class="form form--skinny">
      <FormControl type="text" name="password" label="" placeholder="Enter Password"
        value={password}
        onChange={({ target }) => setPassword(target.value)}
      />
      <div className="form__control form__control--actions">
        <button type="button" className={ buttonClasses } onClick={handleClick}>OK</button>
      </div>
    </div>
  )
}

export default PrivateVideoPasswordForm