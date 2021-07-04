import React, { useState, useEffect } from 'react'

// Components
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import { MetaDatumType } from 'javascript/types/ModelTypes'

const intitialMeta: Partial<MetaDatumType> = {
  title: '',
  keywords: '',
  description: ''
}

interface Props {
  intitialTitle?: string
  resource?: Partial<MetaDatumType>
  onSubmit: (meta: Partial<MetaDatumType>) => void
}

const MetaDataForm: React.FC<Props> = ({
  intitialTitle = '',
  onSubmit,
  resource
}) => {

  const [meta, setMeta] = useState<Partial<MetaDatumType>>(intitialMeta)

  useEffect(() => {
    if (resource) {
      setMeta(resource)
    }
  }, [resource])

  const submit = (e) => {
    e.preventDefault()
    onSubmit(meta)
  }

  const updateMeta = (key) => ({ target }) => {
    setMeta((meta) => ({
      ...meta,
      [key]: target.value
    }))
  }

  return (
    <form className="cms-form" onSubmit={submit}>
      <FormControl
        type="text"
        label="Title"
        name="title"
        placeholder={intitialTitle}
        value={meta.title}
        onChange={updateMeta('title')} />

      <FormControl
        type="text"
        label="Keywords"
        value={meta.keywords}
        onChange={updateMeta('keywords')}
        name="keywords" />

      <FormControl
        type="text"
        label="Description"
        value={meta.description}
        onChange={updateMeta('description')}
        name="description" />

      <div className="cms-form__control cms-form__control--actions">
        <Button type="submit" className="button button--filled">Save</Button>
      </div>
    </form>
  )
}

export default MetaDataForm
