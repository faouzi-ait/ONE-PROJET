import React, { useEffect, useState } from 'react'

import ApplyPrefixStyles from 'javascript/components/apply-prefix-styles'
import joinClasses from 'javascript/utils/helper-functions/joinClasses'
import withWaitForLoadingDiv, { WithWaitForLoadingDivType } from 'javascript/components/hoc/with-wait-for-loading-div'

interface Props extends WithWaitForLoadingDivType {
  className?: string
  classesToPrefix?: string[]
  ignorePrefixing?: boolean
  submitIsLoading?: boolean
  onSubmit: (e: Event, ...restArgs: any) => void
}

const Form: React.FC<Props> = ({
  classesToPrefix,
  ignorePrefixing,
  resetWaitForLoadingDiv,
  submitIsLoading,
  waitForLoading,
  ...props
}) => {

  const classes = joinClasses([
    ...(props.className || '').split(' '),
    ...(props['class'] || '').split(' '),
  ])

  const scrubbedProps = {...props}
  delete scrubbedProps['class']

  const [formIsSubmitting, setFormIsSubmitting] = useState(false)

  const handleSubmit = (e, ...restArgs) => {
    resetWaitForLoadingDiv()
    setFormIsSubmitting(true)
    waitForLoading.waitFor('submit')
    props.onSubmit(e, ...restArgs)
  }

  useEffect(() => {
    if (formIsSubmitting && !submitIsLoading) {
      waitForLoading.finished('submit')
      setFormIsSubmitting(false)
    }
  }, [submitIsLoading, formIsSubmitting])

  return (
    <ApplyPrefixStyles
      providedClassNames={classes}
      classesToPrefix={classesToPrefix || ['form']}
      ignorePrefixing={ignorePrefixing}
      renderProp={(classNames) => {
        return (
          //@ts-ignore
          <form
            {...scrubbedProps}
            className={classNames}
            onSubmit={handleSubmit}
          >
            {props.children}
          </form>
        )
      }}

    />
  )
}

export default withWaitForLoadingDiv(Form)
