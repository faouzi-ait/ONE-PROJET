import React from 'react'
import Div from 'javascript/components/div'
import Icon from 'javascript/components/icon'
import usePrefix from 'javascript/utils/hooks/use-prefix'

import 'stylesheets/core/components/custom-select'

 const CustomSelect = (props) => {

  const { prefix } = usePrefix()
  const { onChange, placeholder, name, value, disabled = false, classes = [] } = props
  const options = props.options ? props.options : []
  const combinedClasses = ['custom-select', ...classes, disabled && 'is-disabled'].filter(Boolean).join(' custom-select--')



  return (
    <Div className={ combinedClasses } classesToPrefix={['custom-select']}>
      <Icon id="i-drop-arrow" classes="custom-select__icon" classesToPrefix={['custom-select']} />
      <select onChange={onChange} onClick={props.onChange} className={`${prefix}custom-select__select`} name={name} value={value || ''} disabled={disabled} aria-label={props['aria-label']} >
        { placeholder !== false &&
          <option aria-label={props['aria-label']} value="">
            { placeholder || 'Please select' }
          </option>
        }
        { options.map((option={value:'',label:''}, i) => (
          <option key={ i } value={ option.value } disabled={option.disabled} aria-label={props['aria-label']}>
            { option.label }
          </option>
        ))}
      </select>
    </Div>
  )
}

export default CustomSelect