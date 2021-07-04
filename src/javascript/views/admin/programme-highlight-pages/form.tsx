import React, { useState, useEffect } from 'react'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'

const ProgrammeHighlightPagesForm = (props) => {

  const { submitAction, resourceName, resource } = props
  const [apiErrors, setApiErrors] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
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

  const handleFormInputChange = (e) => {
    const update = Object.assign({}, formResource)
    update[e.target.name] = e.target.value
    setFormResource(update)
  }

  const handleSelectChange = (e, value = null) => {
    const update = Object.assign({}, formResource)
    if(value || e.value) {
      update['parent-highlight-page'] = value || e
    } else {
      update['parent-highlight-page'] = null
    }
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

  const options = props.pages.map(page => ({
    ...page,
    value: page.id,
    label: page.title
  }))
  const parent = options.find(opt => {
    if (props.parent) {
      return opt.id === props.parent.id
    }
  })
  if (!parent) {
    options.unshift({
      value: null,
      label: 'No parent'
    })
  }
  
  useEffect(() => {
    if(parent){
      handleSelectChange(null, parent)
    }
  }, [])

  return (
    <form className="cms-form" onSubmit={handleSubmit} >
      <FormControl label="Parent" name="parent-highlight-page">
        <Select options={ options } value={formResource['parent-highlight-page']} onChange={handleSelectChange} clearable={ false } onFocus={() => setIsSelecting(true)} onBlur={() => setIsSelecting(false)} />
      </FormControl>
      <FormControl type="text" name="title" label="Name" value={ formResource.title } required onChange={ handleFormInputChange } />      
      { renderFormErrors() }
      <div className="cms-form__control cms-form__control--actions" style={{marginBottom: isSelecting && '60px'}}>
        <Button type="submit" className={ buttonClasses }>Save { resourceName }</Button>
      </div>
    </form>
  )
}

export default ProgrammeHighlightPagesForm
