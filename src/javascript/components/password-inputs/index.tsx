import React, { useEffect, useState } from 'react'

import allClientVariables from './variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'

import FormControl from 'javascript/components/form-control'

interface Props {
  formErrors: {
    password: any
    passwordConfirmation: any
  }
  isPasswordReset?: boolean
  onChange: (e) => void
  onValidationComplete: (passwordsAreValid: boolean) => void
  password: string
  passwordConfirmation: string
  required?: boolean
}

const PasswordInputs: React.FC<Props> = ({
  formErrors,
  isPasswordReset = false,
  onChange,
  onValidationComplete,
  password = '',
  passwordConfirmation = '',
  required = true,
}) => {

  const passwordsCV = useClientVariables(allClientVariables)
  const [passwordRules, setPasswordRules] = useState([])
  const [passedAllTests, setPassedAllTests] = useState(!required)

  useEffect(() => {
    onValidationComplete(passedAllTests)
  }, [passedAllTests])

  useEffect(() => {
    const timer = setTimeout(() => {
      const passwordResults = passwordsCV.passwordRules.map((test) => ({
        ...test,
        passed: !test.stillToBeMet(password)
      }))
      const checkConfirmationMatches = passwordResults.filter((pr) => !pr.passed).length === 0
      let update = [
        ...passwordResults,
        { label: 'Passwords must match', passed: checkConfirmationMatches && password === passwordConfirmation }
      ]
      setPasswordRules(update)
      const testResultsPassed = update.filter((pr) => !pr.passed).length === 0
      const testsNotRequired = password.length === 0 && passwordConfirmation.length === 0 && !required
      setPassedAllTests(testsNotRequired || testResultsPassed)
    }, process.env.NODE_ENV === 'test' ? 0 : 500) // timeout is purely to help mask keystrokes to rules.
    return () => clearTimeout(timer)
  }, [password, passwordConfirmation])

  return (
    <>
      <FormControl label={isPasswordReset ? 'New password' : 'Password'} type="password"
        required={required}
        name="password"
        onChange={onChange}
        value={password}
        error={formErrors.password && 'Must specify a valid password'}
      />
      <FormControl label={isPasswordReset ? 'Confirm new password' : 'Confirm password'} type="password"
        required={required}
        name="password-confirmation"
        onChange={onChange}
        value={passwordConfirmation}
        error={formErrors.passwordConfirmation && 'Must confirm password'}
      />
      <ul style={{ width: '100%', margin: '0 0 15px 0px'}}>
        {passwordRules.map((rule) => {
          const { label, passed } = rule
          const liStyle = {...(passed && { textDecoration: 'line-through'})}
          return (
            <li key={label} style={liStyle}>
              {label}
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default PasswordInputs
