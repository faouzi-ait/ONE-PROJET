import React, { useState } from 'react'

import FormControl from 'javascript/components/form-control'
import Button from 'javascript/components/button'
import Select from 'react-select'

interface Props {
  block?: RecommendedListBlock
  index: undefined | number
  onSubmit: (block: RecommendedListBlock, index?: number) => void
}

export interface RecommendedListBlock {
  title: string
  background: string
}

const RecommendedListBlockForm: React.FC<Props> = (props) => {
  const {
    block,
    index: blockIndexPosition
  } = props

  const [title, setTitle] = useState(block?.title || '')
  const [background, setBackground] = useState(block?.background || 'light')
  const [isLoading, setIsLoading] = useState(false)

  const saveBlock = (e) => {
    e.preventDefault()
    setIsLoading(true)
    const block = {
      title,
      background,
      loggedInUserRequired: true,
      type: 'recommended-list',
    }
    if (blockIndexPosition > -1) {
      props.onSubmit(block, blockIndexPosition)
    } else {
      props.onSubmit(block)
    }
  }

  const buttonClasses = [
    'button',
    'filled',
    isLoading && 'loading',
  ].join(' button--')

  return (
    <form onSubmit={saveBlock} className="cms-form">
      <FormControl type="text"
        label="Title" name="title"
        value={title}
        onChange={({ target }) => setTitle(target.value) }
      />
      <FormControl label="Background">
        <Select
          options={[
            { value: 'light', label: 'Plain' },
            { value: 'shade', label: 'Shaded' },
          ]}
          onChange={setBackground}
          value={background}
          clearable={false}
          simpleValue={true}
        />
      </FormControl>

      <div className="cms-form__control cms-form__control--actions">
        <Button type="submit" className={buttonClasses}>
          Save Content Block
        </Button>
      </div>
    </form>
  )
}

export default RecommendedListBlockForm