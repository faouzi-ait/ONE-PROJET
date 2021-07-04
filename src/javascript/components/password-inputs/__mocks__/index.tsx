import React from 'react'

const MockPasswordInputs = (props) => {
  return (
    <div className="mockPasswordComponent">
      <input data-testid="mockPasswordComponent" onChange={({ target: { value } }) => {
        props.onChange({ target: { name: 'password', value }})
        props.onChange({ target: { name: 'password-confirmation', value }})
        props.onValidationComplete(true)
      }}/>
      <div>
        <label>Password</label>
        <input type="text" name="password"/>
      </div>
      <div>
        <label>Confirm password</label>
        <input type="text" name="password-confirmation"/>
      </div>
      {props.formErrors.password && (
        <span>Must specify a valid password</span>
      )}
    </div>
  )
}

export default MockPasswordInputs
