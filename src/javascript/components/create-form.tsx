import React from 'react'
import Button from 'javascript/components/button'

import 'stylesheets/core/components/create-form'

const CreateForm = ({
  buttonCopy,
  children,
  loading = false,
  onSubmit,
  validateMessage,
}) => {
  const classes =  loading ? 'create-form__button create-form__button--loading' : 'create-form__button'
  return (
    <form onSubmit={ onSubmit } className="create-form">
      <div className="create-form__inner">
        { children }
        <Button type="submit" className={classes}> { buttonCopy } </Button>
      </div>
      {validateMessage && (
        <span className="form__error" >{validateMessage}</span>
      )}
    </form>
  )
}

export default CreateForm