import React, { useState } from 'react'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'

const IndexHelperInputForm = (props) => {

  const { submitAction, resourceName, resource, apiErrors } = props
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formResource, setFormResource] = useState(resource ? {...resource} : {})
  const buttonClasses = ['button', 'filled', isSubmitting && 'loading'].join(' button--')

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    submitAction(formResource)
  }

  const handleFormInputChange = (e) => {
    const update = Object.assign({}, formResource)
    update[e.target.name] = e.target.value
    setFormResource(update)
  }

  const renderFormErrors = () => {
    if (apiErrors) {
      return (
        <ul className="cms-form__errors">
          { Object.keys(apiErrors).map((key, i) => {
            const error = apiErrors[key]
            return (
              <li key={ i }>{ key.charAt(0).toUpperCase() + key.slice(1) } { error }</li>
            )
          }) }
        </ul>
      )
    }
  }

  return (
    <form className="cms-form" onSubmit={handleSubmit} >
      <FormControl type="text" name="name" label="Name" value={ formResource.name } required onChange={ handleFormInputChange } />
      { renderFormErrors() }
      <div className="cms-form__control cms-form__control--actions">
        <Button type="submit" className={ buttonClasses }>Save { resourceName }</Button>
      </div>
    </form>
  )
}

export default IndexHelperInputForm
