import React from 'react'
import useTheme from "javascript/utils/theme/useTheme"

const ReCaptchaMock = ({
  formSubmit,
  renderForm,
  formType,
}) => {
  const { features } = useTheme()
  return renderForm({
    renderRecaptchaWidget: () => {
      if (features.recaptcha[formType].enabled) {
        return (
          <div data-testid="renderRecaptchaWidget"></div>
        )
      }
      return null
    },
    submitRecaptchaForm: () => {
      formSubmit('gRecaptchaResponse')
    }
  })
}

export default ReCaptchaMock
