import React from 'react'
import '@testing-library/jest-dom'
import {
  screen,
} from '@testing-library/react'

import {
  render,
} from 'javascript/utils/test-utils'
import PasswordInputs from './index'

describe('Password Inputs', () => {
  describe('Should render Password fields and rules', () => {
    const onValidationComplete = jest.fn()
    beforeEach(async () => {
      render(
        <PasswordInputs
          password={'passCode1'}
          passwordConfirmation={'passCode1'}
          formErrors={{password: false, passwordConfirmation: false}}
          onChange={() => {}}
          onValidationComplete={onValidationComplete}
        />,
        'test'
      )
    })

    it('Password & Confirm Password fields exist', () => {
      expect(screen.getByText(/Password/)).toBeInTheDocument()
      expect(screen.getByText(/Confirm password/)).toBeInTheDocument()
    })

    it('Should invoke onValidationComplete when passwords satisfy all rules', async () => {
      await new Promise((r) => setTimeout(r, 100))
      expect(onValidationComplete.mock.calls[onValidationComplete.mock.calls.length - 1][0]).toBeTruthy()
    })
  })

  describe('Should render New Password fields and rules', () => {
    const onValidationComplete = jest.fn()
    beforeEach(async () => {
      render(
        <PasswordInputs
          password={'passCode'}
          passwordConfirmation={'passCode'}
          formErrors={{password: false, passwordConfirmation: false}}
          onChange={() => {}}
          onValidationComplete={() => {}}
          isPasswordReset={true}
        />,
        'test'
      )
    })

    it('New Password & Confirm New Password fields exist', () => {
      expect(screen.getByText(/New password/)).toBeInTheDocument()
      expect(screen.getByText(/Confirm new password/)).toBeInTheDocument()
    })

    it('Should NOT invoke onValidationComplete when passwords don\'t satisfy all rules', async () => {
      await new Promise((r) => setTimeout(r, 100))
      expect(onValidationComplete).toHaveBeenCalledTimes(0)
    })
  })

  describe('Should render warnings for Form Errors', () => {
    beforeEach(async () => {
      render(
        <PasswordInputs
          password={'passCode'}
          passwordConfirmation={'passCode'}
          formErrors={{password: true, passwordConfirmation: true}}
          onChange={() => {}}
          onValidationComplete={() => {}}
        />,
        'test'
      )
    })

    it('Must prompt user to complete fields if form errors are present', () => {
      expect(screen.getByText(/Must specify a valid password/)).toBeInTheDocument()
      expect(screen.getByText(/Must confirm password/)).toBeInTheDocument()
    })
  })
})