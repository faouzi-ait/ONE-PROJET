import React, { useState } from 'react'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'

interface Props {
  block?: AccountManagerBlock
  index: undefined | number
  onSubmit: (block: AccountManagerBlock, index?: number) => void
}

export interface AccountManagerBlock {
  background: string
}

const AccountManagerBlockForm: React.FC<Props> = (props) => {
  const {
    block,
    index: blockIndexPosition
  } = props

  const [background, setBackground] = useState(block?.background || 'light')
  const [isLoading, setIsLoading] = useState(false)

  const saveBlock = (e) => {
    e.preventDefault()
    setIsLoading(true)
    const block = {
      background,
      loggedInUserRequired: true,
      type: 'account-manager',
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

export default AccountManagerBlockForm