import React, { useState } from 'react'
import styled from 'styled-components'
import Icon from 'javascript/components/icon'

interface Props {
  className?: string
  onChange: (e: any) => void
  placeholder?: string
  searchIconProps?: any
  value: string | undefined | null
}

const SearchInput: React.FC<Props> = ({
  className = 'form__input',
  onChange,
  placeholder = 'Search...',
  searchIconProps = {},
  value,
}) => {

  const [inFocus, setInFocus] = useState(false)

  return (
    <SearchInputWrapper className={`${className} ${inFocus ? 'form__input--focus' : ''}`} >
      <Icon id="i-mag" {...searchIconProps} className="button__icon" />
      <Input
        className="search-input"
        value={value}
        placeholder={placeholder}
        onChange={({target}) => {
          onChange(target.value)
        }}
        onFocus={() => setInFocus(true)}
        onBlur={() => setInFocus(false)}
      />
      { value.length > 0 && (
        <ClearButton onClick={(e) => onChange('')} >
          <Icon id="i-close" classes="button__icon" />
        </ClearButton>
      )}
    </SearchInputWrapper>
  )
}

const SearchInputWrapper = styled.div`
  display: flex !important;
  align-items: center !important;
`

const Input = styled.input`
  border: none !important;
  outline: none !important;
  background: transparent;
  width: calc(100% - 75px);
  height: 100%;
`

const ClearButton = styled.div`
  display: inline-block;
`


export default SearchInput
