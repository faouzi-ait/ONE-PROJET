import React from 'react'

const CountrySelectMock = (props) => {
  return (
    <select name="country-code"
      aria-label={'country-code'}
      onChange={props.onChange}
    >
      <option value="GB">United Kingdom</option>
      <option value="SZ">Swaziland</option>
    </select>
  )
}

export default CountrySelectMock