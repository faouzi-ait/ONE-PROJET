/*
* @Params
*   props:
*     radioOptions: [<string>]  array of strings, naming each checkbox type (excludes: 'other')
*                    (see: admin/passport/attendee/transfer-details)
*     value: <string> initial value - if same as a checkbox name it will select it
*     label: Label for the form control
*     onChange: method to handle whenever the 'other' text changes or a check box is selected.
*               format: { target: { name: 'props.name', value: 'entered value' } }
*               checkbox selection sets the value to the <string> provided in radioOptions
*     name: value provided to use when returning target option in onChange
*     identifier: used to create unique keys- in case of multiple uses with same name
*
*/

import React, { useState, useEffect } from 'react'

// Components
import Checkbox from 'javascript/components/custom-checkbox'
import FormControl from 'javascript/components/form-control'

const OTHER = 'Other'

const RadioOther = (props) => {
  const { radioOptions = [], value = '', label, onChange, name, identifier} = props
  const checkboxExists = radioOptions.includes(value)
  const [inputText, setInputText] = useState(value)
  const [selectedRadio, setSelectedRadio] = useState(checkboxExists ? value : OTHER)
  const [oldOther, setOldOther] = useState(checkboxExists ? '' : value)
  const keyStr = identifier ? `${identifier}-${name}` : name

  useEffect(() => {
    setInputText(value)
    setSelectedRadio(checkboxExists ? value : OTHER)
    if (!checkboxExists) {
      setOldOther(value)
    }
  }, [value])

  const handleCheckboxChange = ({ target }) => {
    let selectedText
    if (target.value === OTHER) {
      selectedText = oldOther.length ? oldOther : ''
      setSelectedRadio(OTHER)
      setOldOther(selectedText)
    } else {
      selectedText = target.value
      setSelectedRadio(target.value)
    }
    setInputText(selectedText)
    onChange({ target: { name, value: selectedText }})
  }

  const handleInputChange = ({ target }) => {
    setInputText(target.value)
    setOldOther(target.value)
    onChange({ target: { name, value: target.value }})
  }

  const radioChecks = radioOptions.map((option) => {
    const key = option.toLowerCase().split(' ').join('-')
    return (
      <div key={`${keyStr}-${key}`} style={{
        display: 'inline-block',
        paddingRight: '20px'
      }}>
        <Checkbox
          label={option}
          id={`${keyStr}-${key}`}
          value={option}
          onChange={handleCheckboxChange}
          checked={selectedRadio === option}
        />
      </div>
    )
  })
  radioChecks.push((
    <Checkbox
      key={`${keyStr}-other`}
      label={OTHER}
      id={`${keyStr}-other`}
      value={OTHER}
      onChange={handleCheckboxChange}
      checked={selectedRadio === OTHER}
    />
  ))

  return (
    <>
      <FormControl label={label} >
        { radioChecks }
      </FormControl>
      { selectedRadio === OTHER &&
        <FormControl type="text" label=" "
          className="form__input"
          placeholder={'Specify Other'}
          value={inputText}
          onChange={handleInputChange}
        />
      }
    </>
  )
}

export default RadioOther