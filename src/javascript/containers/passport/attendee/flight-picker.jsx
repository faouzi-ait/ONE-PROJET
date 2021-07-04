import React, { useState, useEffect } from 'react'
import moment from 'moment'

import { Features } from 'javascript/config/features'
import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'

// Hooks
import usePrefix from 'javascript/utils/hooks/use-prefix'
import useResource from 'javascript/utils/hooks/use-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import { withRouter } from 'react-router-dom'

const PassportFlightPickerForm = (props) => {

  const { onFlightSelected, hideModal } = props
  const { prefix } = usePrefix()

  const [flight, setFlight] = useState({
    departure: -1,
    arrival: -1
  })

  const [flightOptions, setFlightOptions] = useState({
    departures: [],
    arrivals: []
  })

  const handleInputChange = (e) => {
    const update = Object.assign({}, flight)
    update[e.target.name] = e.target.value
    setFlight(update)
  }

  const flightSelected = (departureIndex, arrivalIndex) => {
    if (departureIndex === -1 || arrivalIndex === -1) return
    const update = {
      ...flightOptions.departures[departureIndex],
      ...flightOptions.arrivals[arrivalIndex]
    }
    delete update.value
    delete update.label
    update['departure-date'] = moment(update['departure-date']).toString()
    update['arrival-time'] = moment(update['arrival-time']).toString()
    hideModal()
    onFlightSelected(update)
  }

  useEffect(() => {
    if (!props.flightSchedule) return
    const departures = []
    const arrivals = []
    props.flightSchedule.forEach((flight, i) => {
      arrivals.push({
        value: i,
        label: `${flight.arrivalAirportFsCode} -- ${moment(flight.arrivalTime).format(Features.formats.dateTime)}`,
        'destination-airport': flight.arrivalAirportFsCode,
        'arrival-time': flight.arrivalTime,
        'carrier': flight.carrierFsCode
      })
      departures.push({
        value: i,
        label: `${flight.departureAirportFsCode} -- ${moment(flight.departureTime).format(Features.formats.dateTime)}`,
        'departure-airport': flight.departureAirportFsCode,
        'departure-date': flight.departureTime,
        'carrier': flight.carrierFsCode
      })
    })
    setFlightOptions({
      arrivals,
      departures
    })
  }, [props.flightSchedule])

  useEffect(() => {
    if (flightOptions.departures.length === 1 && flightOptions.arrivals.length === 1) {
      flightSelected(0, 0)
    }
  }, [flightOptions])

  const renderLookupErrors = () => {
    if (!props.flightLookupError) return null
    return (
      <ul className={`${prefix}form__errors`} style={{ padding: '30px' }}>
        {Object.keys(props.flightLookupError).map((key, i) => {
          const error = props.flightLookupError[key]
          return (
            <li key={i}>{error}</li>
          )
        })}
      </ul>
    )
  }

  if (!props.flightSchedule || props.flightLookupError) {
    return (
      <div className="container">
        { props.flightLookupError ? (
            renderLookupErrors()
          ) : (
            <h3>
              Loading...
            </h3>
          )
        }
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      <div className={`${prefix}form`} style={{ maxWidth: '520px' }}>
        <FormControl label="Departure" required>
          <Select options={flightOptions.departures}
            value={flight['departure']}
            onChange={(value) => handleInputChange({ target: { name: 'departure', value } })}
            required={true}
            simpleValue={ true }
            clearable={false}
            searchable={false} />
        </FormControl>
        <FormControl label="Arrival" required>
          <Select options={flightOptions.arrivals}
            value={flight['arrival']}
            onChange={(value) => handleInputChange({ target: { name: 'arrival', value } })}
            required={true}
            simpleValue={ true }
            clearable={false}
            searchable={false} />
        </FormControl>
        <div className={`${prefix}form__control ${prefix}form__control--actions`}>
          <Button type="button" className="button" onClick={hideModal} >Cancel</Button>
          <Button type="button" className="button" onClick={() => flightSelected(flight.departure, flight.arrival)} >Select</Button>
        </div>
      </div>
    </div>
  )
}

const enhance = compose(
  withRouter,
  withHooks(props => {

    const { departureDate, flightNumber } = props
    const flightScheduleResource = nameSpaced('passport', useResource('passport-flight-schedule'))
    const [flightLookupError, setFlightLookupError] = useState(null)
    const [flightSchedule, setFlightSchedule] = useState(null)

    const getFlightScheduleInfo = (flightDate, flightNumber) => {
      const departureDate = moment(flightDate).format('DD/MM/YYYY')
      setFlightLookupError(null)
      flightScheduleResource.useApi()
        .all('passport-flight-schedule')
        .post({
          'flight-number': flightNumber,
          'departure-date': departureDate
        })
        .then((response) => {
          if (!response['flight-details'].scheduledFlights.length) {
            setFlightLookupError({ noFlights: 'No flight with that flight number was found'})
          } else {
            setFlightSchedule(response['flight-details'].scheduledFlights)
          }
        })
        .catch((error) => {
          setFlightLookupError(error)
        })
    }

    useEffect(() => {
      getFlightScheduleInfo(departureDate, flightNumber)
    }, [departureDate, flightNumber])

    return {
      ...props,
      flightLookupError,
      flightSchedule
    }
  })
)

export default enhance(PassportFlightPickerForm)

