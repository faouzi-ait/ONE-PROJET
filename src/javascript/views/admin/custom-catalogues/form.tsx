import React, { useState } from 'react'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import CustomCheckbox from 'javascript/components/custom-checkbox'

const CustomCataloguesForm = (props) => {

  const { submitAction, resourceName, resource } = props
  const [apiErrors, setApiErrors] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formResource, setFormResource] = useState(resource ? {...resource} : {})
  const buttonClasses = ['button', 'filled', isSubmitting && 'loading'].join(' button--')

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const update = {...formResource}
    submitAction(update).catch((errors) => {
      setApiErrors(errors)
      setIsSubmitting(false)
    })
  }

  const handleNameChange = ({ target }) => {
    const update = {...formResource}
    update['name'] = target.value
    update['slug'] = target.value.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')
    setFormResource(update)
  }

  const handleSlugChange = ({ target }) => {
    const update = {...formResource}
    update['slug'] = target.value.toLowerCase().replace(/[^\w\s\-]/gi, '').replace(/\s+/g, '-')
    setFormResource(update)
  }

  const updateBool = ({ target }) => {
    const update = {...formResource}
    update[target.name] = target.checked
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
      <FormControl type="text" label="Name" value={ formResource.name } required onChange={ handleNameChange } />
      <FormControl type="text" label="Slug" value={ formResource.slug } required onChange={ handleSlugChange } />
      <FormControl label="Options">
        <div className="cms-form__collection">
          <CustomCheckbox label="Display in Main Navigation" id="show-in-nav" name="show-in-nav" onChange={ updateBool } checked={ formResource['show-in-nav'] } />
        </div>
      </FormControl>
      { renderFormErrors() }
      <div className="cms-form__control cms-form__control--actions">
        <Button type="submit" className={ buttonClasses }>Save { resourceName }</Button>
      </div>
    </form>
  )
}

export default CustomCataloguesForm
