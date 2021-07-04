import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import usePrefix from 'javascript/utils/hooks/use-prefix'

// Components
import DatePicker from 'javascript/components/datepicker'
import useTheme from 'javascript/utils/theme/useTheme'

interface Props {
  label: string,
  filterName: string,
  dateFormat?: string
  key?: string,
  updateQuery: (filter: string, value: string) => void,
  currentValue: string,
}

const DATE_SEPERATOR = '..'

const DateRangeFilters = ({
  label,
  key = 'date-range',
  filterName,
  updateQuery,
  currentValue,
  dateFormat = 'DD-MM-YYYY',
} : Props) => {

  const { prefix } = usePrefix()
  const { features } = useTheme()

  const [ fromDateStr, toDateStr ] = currentValue ? currentValue.split(DATE_SEPERATOR) : ['', '']

  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)

  useEffect(() => {
    setFromDate(fromDateStr)
    setToDate(toDateStr)
  }, [fromDateStr, toDateStr])

  const handleDateChange = (type) => (date) => {
    const update = {
      from: fromDateStr || '',
      to: toDateStr || ''
    }
    update[type] = date?.format(dateFormat).toString() || ''
    updateQuery(filterName, `${update.from}${DATE_SEPERATOR}${update.to}`)
  }

  return (
    <div className={`${prefix}programme-filters__column`} key={key}>
      <label className={`${prefix}programme-filters__label`}>{label}</label>
      <DateRangeWrapper>
        <DatePicker
          selected={fromDate}
          onChange={handleDateChange('from')}
          dateFormat={features.formats.shortDate}
          showYearDropdown={true}
          isClearable={true}
        />
        <DateRangeSpan>to</DateRangeSpan>
        <DatePicker
          selected={toDate}
          onChange={handleDateChange('to')}
          dateFormat={features.formats.shortDate}
          showYearDropdown={true}
          isClearable={true}
        />
      </DateRangeWrapper>
    </div>
  )
}

export default DateRangeFilters

const DateRangeWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 568px) {
    display: block;
  }
`

const DateRangeSpan = styled.span`
  margin: 0px 7px;
  @media (max-width: 568px) {
    margin-bottom: 10px;
    margin-top: 10px;
    display: block;
    text-align: center;
  }
`