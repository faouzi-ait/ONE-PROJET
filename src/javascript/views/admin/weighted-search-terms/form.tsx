import React, { useState } from 'react'


import withTheme from 'javascript/utils/theme/withTheme'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import AsyncSearchProgrammes from 'javascript/components/async-search-programmes'

const WeightedSearchTermsForm = (props) => {
  const  { theme } = props

  const { submitAction, resourceName, resource } = props
  const [apiErrors, setApiErrors] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formResource, setFormResource] = useState(resource ? {...resource} : {})
  const buttonClasses = ['button', 'filled', isSubmitting && 'loading'].join(' button--')

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const update = {...formResource}
    submitAction(update)?.catch((errors) => {
      setApiErrors(errors)
      setIsSubmitting(false)
    })
  }

  const handleFormInputChange = (e) => {
    const update = Object.assign({}, formResource)
    update[e.target.name] = e.target.value
    setFormResource(update)
  }

  const updateProgramme = programme => {
    const update = Object.assign({}, formResource)
    update.programme = programme
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
      <FormControl label={theme.localisation.programme.upper} required>
      <AsyncSearchProgrammes
        value={formResource.programme}
        onChange={updateProgramme}
        required
      />
      </FormControl>
      <FormControl type="text" label="Term" value={ formResource.name } name={'name'} required onChange={ handleFormInputChange } />
      <FormControl type="number" label="Weight" value={ formResource.weight } name={'weight'} required onChange={ handleFormInputChange } />
      { renderFormErrors() }
      <div className="cms-form__control cms-form__control--actions">
        <Button type="submit" className={ buttonClasses }>Save { resourceName }</Button>
      </div>
    </form>
  )
}

export default withTheme(WeightedSearchTermsForm)
