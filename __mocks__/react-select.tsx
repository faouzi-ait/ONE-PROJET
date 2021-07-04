import React from 'react'
import Select from 'react-select'

const renderSelect = (props, Component) => {
  const labelKey = props.labelKey || 'label'
  const valueKey = props.valueKey || 'value'
  return (
    <>
      <Component {...props} />
      {props['aria-label'] && (
        <ul aria-label={props['aria-label']}>
          {props.options.map((option) => (
            <li key={option[valueKey]} aria-label={props['aria-label']}>{option[labelKey]}</li>
          ))}
        </ul>
      )}
    </>
  )
}

const MockReactSelect = (props) => renderSelect(props, Select)
MockReactSelect.Async = (props) => renderSelect(props, Select.Async)

module.exports = MockReactSelect