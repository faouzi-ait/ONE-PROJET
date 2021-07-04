/*
*   @params
*     props.selected:  can be a string, js Date or a moment
*
*   @return
*     props.onChange ( moment )
*/

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import ReactDatePicker from 'react-datepicker'
import moment from 'moment'
import usePrefix from 'javascript/utils/hooks/use-prefix'

export const createMoment = (providedDate) => {
  if (typeof providedDate === 'string' && providedDate.length) {
    return moment(providedDate)
  } else if (providedDate && typeof providedDate === 'object') {
    if (providedDate._isAMomentObject && providedDate._isValid) {
      return providedDate.utc()
    } else {
      return moment(providedDate).utc()
    }
  }
  return null
}

const DatePicker = (props) => {

  const { stylePrefixEntryPoint } = usePrefix()

  const [selected , setSelected] = useState(createMoment(props.selected))
  const datePickerProps = {...props, selected}

  useEffect(() => {
    setSelected(createMoment(props.selected))
  }, [props.selected])

  const CalendarContainer = ({children}) => {
    return children ? (
      ReactDOM.createPortal(React.cloneElement(children, {
          className: "react-datepicker-popper"
      }), document.body)
    ) : (
      null
    )
  }

  const onClick = (e) => {
    // This stops ReactDatePicker from closing our modal when it is clicked on.
    // ReactDatePicker is appended to document.body, so not inside our modal
    // i.e. clicks are treated as outside modal
    e.stopPropagation()
  }

  return (
    <div onClick={onClick} className={`react-datepicker-${stylePrefixEntryPoint}`} >
      <ReactDatePicker {...datePickerProps} onChange={props.onChange} popperContainer={CalendarContainer} />
    </div>
  )
}

export default DatePicker
