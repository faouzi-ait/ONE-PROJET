import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'

import CustomSelect from '../custom-select'
import FormControl from '../form-control'
import Select from '../select'

const selectOptions = [{
  value: 'first',
  label: 'First Value'
}, {
  value: 'second',
  label: 'Second Value'
}, {
  value: 'third',
  label: 'Third Value'
}]

storiesOf('Form', module)
  .addDecorator(story => <div style={{ padding: '1rem', minHeight: '80vh'}}>{story()}</div>)
  .add('Text Input', () => {
    const [textValue, setTextValue] = useState('test value')
    return (
      <FormControl  type="text"
        label="Text Input"
        name="text-input"
        value={textValue}
        onChange={({target}) => setTextValue(target.value)}
      />
    )
  })
  .add('Select', () => {
    const [selectValue, setSelectValue] = useState('')
    return (
      <FormControl label="Select Input" >
        <Select
          value={selectValue}
          onChange={({value}) => setSelectValue(value)}
          clearable={false}
          options={selectOptions}
        />
      </FormControl>
    )
  })
  .add('Custom Select', () => {
    const [customSelectValue, setCustomSelectValue] = useState('')
    return (
      <FormControl label="Custom Select Input" >
        <CustomSelect
          value={customSelectValue}
          onChange={({target}) => setCustomSelectValue(target.value)}
          clearable={true}
          options={selectOptions}
        />
      </FormControl>
    )
  })