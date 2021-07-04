/* CachedMultiSelect
* Used for selects that have {multi} values and are populated from meta-data (i.e. changing options).
* This select has state and keeps track of what has been selected. So when future options
* no longer contain the required 'selected' options this has memory of them and they are still populated
* within the select. Stops selected items vanishing from selects when you select other filters on the page.
*/

import React, { useState, useMemo } from 'react'

import Select from 'react-select'

interface Props {
  backspaceRemoves?: boolean
  clearable?: boolean
  onChange: (value: any) => void,
  options: any[],
  simpleValue?: boolean
  value: any,
}

const FilterSelect: React.FC<Props> = ({
  backspaceRemoves = true,
  clearable = true,
  onChange,
  options,
  simpleValue = true,
  value,
}) => {

  const [selectedOptions, setSelectedOptions] = useState([])

  const handleOnChange = (values) => {
    if (values.length > selectedOptions.length) { // new value added
      setSelectedOptions((currOptions) => [
        ...currOptions,
        values[values.length - 1]
      ])
    } else { //value has been removed
      setSelectedOptions((currOptions) => {
        return currOptions.filter((opt) => {
          return values.find((item) => item.value === opt.value)
        })
      })
    }
    onChange(simpleValue ? values.map((item) => item.value).join(',') : values)
  }

  const rememberedOptions = useMemo(() => {
    const idCache = {}
    const optionsSet = []
    const allOptions = [...selectedOptions, ...options]
    allOptions.forEach((availableOption) => {
      if (idCache[availableOption.value]) return /* already added */
      idCache[availableOption.value] = true
      optionsSet.push(availableOption)
    })
    return optionsSet
  }, [options, selectedOptions])

  return (
    <Select
      onChange={handleOnChange}
      multi={true}
      clearable={clearable}
      simpleValue={false}
      backspaceRemoves={backspaceRemoves}
      options={rememberedOptions}
      value={value}
    />
  )
}

export default FilterSelect