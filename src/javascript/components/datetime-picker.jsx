/*
*   @params
*     props
*       selected:  can be a string, js Date or a moment
*       defaultTime: <string> e.g. '14:30'
*       hourInterval / minuteInterval: time select intervals.. defaults to 1 hour / 15 minute intervals
*       timeLabel: <string> adds a label span between DatePicker and Time Selects
*       oneLine: <boolean> if false it will put datepicker and time picker on seperate lines
*
*   @return
*     props.onChange ( moment )
*/

import React from 'react'

import DatePicker, { createMoment } from 'javascript/components/datepicker'
import Select from 'react-select'

import 'stylesheets/admin/components/datetime-picker'

const DateTimePicker = (props) => {

  const { selected, onChange, minuteInterval = 15, hourInterval = 1, defaultTime, timeLabel, oneLine = true } = props
  let dateTime = createMoment(selected)
  const defaultTimeArr = (defaultTime || '00:00').split(':')
  const hour = dateTime ? dateTime.hour() : defaultTimeArr[0]
  const minute = dateTime ? dateTime.minute(): defaultTimeArr[1]

  const getTimeOptions = (denominator, providedInterval, defaultInterval) => {
    const diviser = denominator % providedInterval === 0 ? denominator / providedInterval : denominator / defaultInterval
    const calculatedInterval = denominator / diviser
    return Array(diviser).fill({}).map((option, i) => {
      return {
        value: i * calculatedInterval,
        label: `${i * calculatedInterval}`.padStart(2, '0')
      }
    })
  }

  const handleDateChanged = (dateSelected) => {
    dateSelected.hour(hour)
    dateSelected.minute(minute)
    onChange(dateSelected)
  }

  const handleTimeChanged = (hourSelected, minuteSelected) => {
    dateTime.hour(hourSelected)
    dateTime.minute(minuteSelected)
    onChange(dateTime)
  }

  const timeDisabled = dateTime ? {} : { disabled: true }

  const renderDatePicker = () => (
    <DatePicker {...props}
      onChange={handleDateChanged}
    />
  )

  const timeClasses = oneLine ? 'datetime-picker__time-one-line' : 'datetime-picker__time-two-lines'
  const labelClasses = oneLine ? 'datetime-picker__label' : 'datetime-picker__label form__label'
  const colonClasses = oneLine ? 'datetime-picker__time-colon' : 'datetime-picker__time-colon form__label'

  return (
    <>
      { oneLine ? null : renderDatePicker() }
      <div className="datetime-picker">
        { oneLine ? renderDatePicker() : null }
        <div className={timeClasses}>
          { timeLabel && (
            <div className={labelClasses}>
              <span>{timeLabel}</span>
            </div>
          )}
          <Select
            {...props}
            {...timeDisabled}
            options={getTimeOptions(24, hourInterval, 1)}
            value={dateTime ? hour : ''}
            onChange={(val) => handleTimeChanged(val, minute)}
            simpleValue={ true }
            clearable={false}
            searchable={false}
          />
          <div className={colonClasses}> : </div>
          <Select
            {...timeDisabled}
            {...props}
            options={getTimeOptions(60, minuteInterval, 15)}
            value={dateTime ? minute : ''}
            onChange={(val) => handleTimeChanged(hour, val)}
            simpleValue={ true }
            clearable={false}
            searchable={false}
          />
        </div>
      </div>
    </>
  )

}

export default DateTimePicker