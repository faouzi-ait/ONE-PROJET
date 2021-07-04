import React, { useState } from 'react'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'

interface Props {
  block?: ShorthandBlock
  index: undefined | number
  onSubmit: (block: ShorthandBlock, index?: number) => void
}

export interface ShorthandBlock {
  url: string
}

const ShorthandBlockForm: React.FC<Props> = (props) => {
  const {
    block,
    index: blockIndexPosition
  } = props

  const [url, setUrl] = useState(block?.url)
  const [isLoading, setIsLoading] = useState(false)

  const saveBlock = (e) => {
    e.preventDefault()
    setIsLoading(true)
    const block = {
      url,
      type: 'shorthand',
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
      <FormControl label="Shorthand URL" 
        type="text"
        name="url"
        value={url}
        onChange={({ target }) => setUrl(target.value) }
      />

      <div className="cms-form__control cms-form__control--actions">
        <Button type="submit" className={buttonClasses}>
          Save Content Block
        </Button>
      </div>
    </form>
  )
}

export default ShorthandBlockForm