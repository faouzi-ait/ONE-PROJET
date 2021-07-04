import React from 'react'
import styled from 'styled-components'
import usePrefix from 'javascript/utils/hooks/use-prefix'

interface QueryParamType {
  'page[number]': number
  'page[size]': number
  'filter[status]': string
  'filter[search]'?: string
}

interface Props {
  onChange: (queryParams: QueryParamType) => void
  query: QueryParamType
}

const ApprovalsSearch: React.FC<Props> = ({
  onChange,
  query,
}) => {
  const { prefix } = usePrefix()
  const debounceOnChange = () => {
    let inDebounce
    return (e) => {
      const targetValue = e.target.value
      clearTimeout(inDebounce)
      inDebounce = setTimeout(() => {
        const update = {...query}
        if (targetValue.length) {
          update['filter[search]'] = targetValue
        } else {
          delete update['filter[search]']
        }
        onChange(update)
      }, 500)
    }
  }
  return (
    <FilterWrapper>
      <FilterLabel>Filter:</FilterLabel>
      <input type="text" className={`${prefix}form__input`}
        name="filter[search]"
        defaultValue={''}
        placeholder="Filter by Name or Email"
        style={{minWidth: '230px'}}
        onChange={debounceOnChange()}
      />
    </FilterWrapper>
  )
}

export default ApprovalsSearch

const FilterWrapper = styled.div`
  display: inline-flex;
  align-items: center;
`

const FilterLabel = styled.div`
  padding: 10px;
`

