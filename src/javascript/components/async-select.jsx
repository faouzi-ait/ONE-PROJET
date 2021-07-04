import React from 'react'
import Select from 'react-select'

/**
 * A wrapper for Select.Async with some handy default values
 */
const AsyncSelect = ({
  options = [],
  loadOptions,
  clearable = true,
  autoload = false,
  value,
  backspaceRemoves = true,
  labelKey = 'title',
  valueKey = 'id',
  onChange,
  onEnterPressed = () => {},
  filterOptions = (options) => options,
  placeholder,
  ...props
}) => {
  return (
    <Select.Async
      {...{
        options,
        loadOptions,
        clearable,
        autoload,
        value,
        backspaceRemoves,
        labelKey,
        valueKey,
        onChange,
        filterOptions,
        placeholder,
        ...props
      }}
      cache={false}
    />
  )
}

export default AsyncSelect