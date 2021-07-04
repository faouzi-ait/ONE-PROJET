import React, { useEffect, useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import useTheme from 'javascript/utils/theme/useTheme'

export interface RenderFormPropsType {
  renderRecaptchaWidget: () => JSX.Element
  submitRecaptchaForm: (submitCallback: SubmitCallbackType) => void
}

type SubmitCallbackType = (gRecaptchaReponse: string | null) => void

interface Props {
  formSubmit: SubmitCallbackType
  formType: 'forgottenPassword' | 'userLogin' | 'userRegistration'
  renderForm: (RenderFormPropsType) => JSX.Element
}

const ReCaptcha: React.FC<Props> = ({
  formSubmit,
  formType,
  renderForm,
}) => {
  const { features } = useTheme()

  const recaptchaWidgetRef = useRef<{reset: any, execute: any}>()
  const [googleRecaptchaReponse, setGoogleRecaptchaReponse] = useState(null)

  const validateRecaptcha = () => {
    recaptchaWidgetRef.current?.reset()
    recaptchaWidgetRef.current?.execute()
  }

  useEffect(() => {
    if (googleRecaptchaReponse) {
      if (features.recaptcha[formType].enabled && features.recaptcha[formType].recaptchaType === 'invisible') {
        handleFormSubmission(googleRecaptchaReponse)
      }
    }
  }, [googleRecaptchaReponse])

  const handleFormSubmission = (gRecaptchaRes) => {
    formSubmit(gRecaptchaRes)
    recaptchaWidgetRef.current?.reset()
    setGoogleRecaptchaReponse(null)
  }

  const renderRecaptchaWidget = () => {
    if (features.recaptcha[formType].enabled) {
      const size = features.recaptcha[formType].recaptchaType === 'invisible' ? 'invisible' : 'normal'
      return (
        <ReCAPTCHA
          ref={recaptchaWidgetRef}
          className={`grecaptcha-wrapper ${`grecaptcha-wrapper--${size}`}`}
          size={size}
          sitekey={features.recaptcha.siteKeys[features.recaptcha[formType].recaptchaKey]}
          onChange={(value) => {
            setGoogleRecaptchaReponse(value)
          }}
        />
      )
    }
  }

  const submitRecaptchaForm = (e) => {
    e?.preventDefault()
    if (process.env.NODE_ENV !== 'development'
      && features.recaptcha[formType].enabled
      && features.recaptcha[formType].recaptchaType === 'invisible'
      && !googleRecaptchaReponse) {
      validateRecaptcha()
    } else {
      handleFormSubmission(googleRecaptchaReponse)
    }
  }

  return renderForm({
    renderRecaptchaWidget,
    submitRecaptchaForm,
  })
}

export default ReCaptcha
