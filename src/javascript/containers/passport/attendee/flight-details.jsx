import React, { useState, useEffect } from 'react'
import deepEqual from 'deep-equal'
import moment from 'moment'

import { Features, FlightCarriers } from 'javascript/config/features'
import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Button from 'javascript/components/button'
import FlightPickerForm from 'javascript/containers/passport/attendee/flight-picker'
import FormControl from 'javascript/components/form-control'
import Modal from 'javascript/components/modal'
import Select from 'react-select'

// Hooks
import usePrefix from 'javascript/utils/hooks/use-prefix'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import { withRouter } from 'react-router-dom'

const flightCarriers = (() => {
  return Object.keys(FlightCarriers).map((key) => ({
    value: key,
    label: FlightCarriers[key],
    input: 'carrier'
  }))
})()

const getInitialState = (props) => ({
  'arrival-time': '',
  'carrier': '',
  'departure-airport': '',
  'departure-date': '',
  'departure-time': '',
  'destination-airport': '',
  'direction': props.direction === 'outbound' ? 1 : 0,
  'flight-number': '',
  'flight-required': false,
  'confirmed': false
})

const PassportFlightDetailsForm = (props) => {

  const { savedTripRelation } = props
  const { prefix } = usePrefix()

  const [flightDetails, setFlightDetails] = useState(getInitialState(props))
  const [requiredField, setRequiredField] = useState(false)
  const [flightDateError, setFlightDateError] = useState(false)
  const [dateErrors, setDateErrors] = useState({})
  const directionName = props.direction === 'outbound' ? 'Outbound' : 'Return'
  const directionAbbr = props.direction === 'outbound' ? 'OBND' : 'RTN'

  let buttonClasses = 'button'
  /* #region  itv */
  buttonClasses = 'button button--filled'
  /* #endregion */

  useEffect(() => {
    if (props.flight) {
      setFlightDetails({
        ...props.flight,
        direction: props.flight.direction === 'outbound' ? 1 : 0
      })
    } else {
      setFlightDetails(getInitialState(props))
    }
  }, [props.flight])

  useEffect(() => {
    if (savedTripRelation) {
      // trip has saved - try saving flights
      if (deepEqual(flightDetails, getInitialState(props))) {
        // Do not save flight.. user has not entered data
        return props.resourceFinishedSaving(`${props.direction}-flight`)
      }
      const flight = {
        ...flightDetails,
        trip: savedTripRelation
      }
      props.saveFlight(flight)
    }
  }, [savedTripRelation])

  useEffect(() => {
    if (directionName === 'Outbound' && props.setOutboundTransferTime && flightDetails['arrival-time']) {
      props.setOutboundTransferTime(moment(flightDetails['arrival-time']))
    }
  }, [flightDetails['arrival-time']])

  useEffect(() => {
    if (directionName === 'Return' && props.setReturnTransferTime && flightDetails['departure-date']) {
      props.setReturnTransferTime(moment(flightDetails['departure-date']).subtract(2, 'hours').subtract(30, 'minutes'))
    }
  }, [flightDetails['departure-date']])

  const handleInputChange = ({ target }) => {
    const update = Object.assign({}, flightDetails)
    update[target.name] = target.value
    setRequiredField(true)
    setFlightDetails(update)
  }

  const handleCheckboxChange = ({ target }) => {
    let update = Object.assign({}, flightDetails)
    update[target.name] = target.checked
    setRequiredField(true)
    setFlightDetails(update)
  }

  const handleDateChange = (date, dateName) => {
    const update = Object.assign({}, flightDetails)
    update[dateName] = date ? date.utc().toDate().toUTCString() : null
    setRequiredField(true)
    setFlightDetails(update)
  }

  const handleSelectChange = (type, selected) => {
    const update = Object.assign({}, flightDetails)
    update[type] = selected.value
    setRequiredField(true)
    setFlightDetails(update)
  }

  const updateFlightDetails = (selectedFlight) => {
    const update = {
      ...flightDetails,
      ...selectedFlight
    }
    setRequiredField(true)
    setFlightDetails(update)
  }

  const renderFlightPicker = () => {
    const today = new moment().endOf('day')
    if (moment(flightDetails['departure-date']).isSameOrBefore(today)) {
      setFlightDateError(true)
      return
    }
    setFlightDateError(false)
    props.modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={ hideModal }
        title={`Flight Lookup`}
      >
        <FlightPickerForm
          flightNumber={flightDetails['flight-number']}
          departureDate={flightDetails['departure-date']}
          onFlightSelected={updateFlightDetails}
          hideModal={hideModal}
        />
      </Modal>
    ))
  }

  if (!props.cms && (flightDetails['confirmed'] || props.afterClosingDate)) {
    const carrier = flightCarriers.find((flightCarrier) => flightCarrier.value === flightDetails['carrier'])
    return (
      <div>
        <h3 className={`${prefix}form__title`}>{`${directionName} Flight ${flightDetails['confirmed'] ? '- CONFIRMED' : ''}`}</h3>
        <table className="itinerary__table">
          <tbody>
            <tr className="itinerary__row">
              <td>
                <FormControl type="checkbox"
                  label={'Flight Required'}
                  checkboxLabeless={true}
                  id={`${directionAbbr}-flight-required`}
                  name='flight-required'
                  disabled={true}
                  checked={flightDetails['flight-required']}
                />
              </td>
              <td/>
            </tr>
            <tr className="itinerary__row">
              <td><strong>{`${directionAbbr} Carrier`}</strong></td>
              <td>{carrier ? carrier.label : ''}</td>
            </tr>
            <tr className="itinerary__row">
              <td><strong>{`${directionAbbr} Departure Date`}</strong></td>
              <td>{flightDetails['departure-date'] ? moment(flightDetails['departure-date']).format(Features.formats.mediumDate) : ''}</td>
            </tr>
            <tr className="itinerary__row">
              <td><strong>{`${directionAbbr} Flight Number`}</strong></td>
              <td>{flightDetails['flight-number']}</td>
            </tr>
            <tr className="itinerary__row">
              <td><strong>{`${directionAbbr} Departure Airport`}</strong></td>
              <td>{flightDetails['departure-airport']}</td>
            </tr>
            <tr className="itinerary__row">
              <td><strong>{`${directionAbbr} Destination Airport`}</strong></td>
              <td>{flightDetails['destination-airport']}</td>
            </tr>
            <tr className="itinerary__row">
              <td><strong>{`${directionAbbr} Arrival Date`}</strong></td>
              <td>{flightDetails['arrival-time'] ? moment(flightDetails['arrival-time']).format(Features.formats.mediumDate) : ''}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="container">
      <h3 className={`${prefix}form__title`}>{`${directionName} Flight`}</h3>
      <FormControl type="checkbox"
        label={`Flight Required`}
        checkboxLabeless={true}
        id={`${directionAbbr}-flight-required`}
        name='flight-required'
        onChange={handleCheckboxChange}
        checked={flightDetails['flight-required']}
      />
      <FormControl label={`${directionAbbr} Carrier`} >
        <Select
          value={flightDetails['carrier']}
          onChange={(selected) => handleSelectChange('carrier', selected)}
          clearable={false}
          options={flightCarriers}
        />
      </FormControl>
      <FormControl type="datetime"
        error={flightDateError ? 'Departure date must be after today' : null}
        label={`${directionAbbr} Departure Date`}
        timeLabel={'Time'}
        required={requiredField}
        selected={flightDetails['departure-date']}
        onChange={(e) => { handleDateChange(e, 'departure-date') }}
        minuteInterval={5}
        defaultTime={'13:30'}
        oneLine={props.cms}
        dateFormat={Features.formats.mediumDate}
        showYearDropdown
      />
      <FormControl type="text"
        label={`${directionAbbr} Flight Number`}
        name="flight-number"
        value={flightDetails['flight-number']}
        onChange={handleInputChange}
      />
      <div className={`${prefix}form__control`}>
        <label className={`${prefix}form__label`}>{`Find ${directionAbbr} Flight Details`}</label>
        <div className={`${prefix}form__inner`}>
          <Button type="button" className={buttonClasses} onClick={renderFlightPicker}> Search </Button>
        </div>
      </div>
      <FormControl type="text"
        label={`${directionAbbr} Departure Airport`}
        name="departure-airport"
        value={flightDetails['departure-airport']}
        onChange={handleInputChange}
      />
      <FormControl type="text"
        label={`${directionAbbr} Destination Airport`}
        name="destination-airport"
        value={flightDetails['destination-airport']}
        onChange={handleInputChange}
      />
      <FormControl type="datetime"
        label={`${directionAbbr} Arrival Date`}
        timeLabel={'Time'}
        required={requiredField}
        selected={flightDetails['arrival-time']}
        onChange={(e) => { handleDateChange(e, 'arrival-time') }}
        minuteInterval={5}
        defaultTime={'14:15'}
        oneLine={props.cms}
        dateFormat={Features.formats.mediumDate}
        showYearDropdown
      />
      { !props.cms ? null : (
        <FormControl type="checkbox"
          label="Flight Confirmed"
          checkboxLabeless={true}
          id={`${directionAbbr}-flight-confirmed`}
          name='confirmed'
          onChange={handleCheckboxChange}
          checked={flightDetails['confirmed']}
        />
      )}
    </div>
  )
}

const enhance = compose(
  withRouter,
  withModalRenderer,
  withHooks(props => {
    const { savedTripRelation } = props
    const { attendeeId } = props.match.params
    const tripRelation = !attendeeId ? savedTripRelation : {
      'name': 'passport-trip',
      'id': attendeeId
    }
    const flightsReduxResource = nameSpaced('passport', useReduxResource('passport-flight', `passport/attendee-flights-${props.direction}`, tripRelation))

    useEffect(() => {
      if (attendeeId) {
        flightsReduxResource.findAllFromOneRelation(tripRelation, {
          fields: {
            'passport-flights': 'arrival-time,carrier,confirmed,departure-airport,departure-date,destination-airport,direction,flight-number,flight-required'
          },
          'filter[direction]': props.direction
        })
      }
    }, [attendeeId])

    useWatchForTruthy(flightsReduxResource.mutationState.succeeded, () => {
      props.resourceFinishedSaving(`${props.direction}-flight`)
    })

    useWatchForTruthy(flightsReduxResource.mutationState.errored, () => {
      props.setErrors(flightsReduxResource.mutationState.errors)
    })

    let flight = flightsReduxResource.getReduxResources()
    if (flight) {
      flight = flight[0]
    }
    const isEditing = attendeeId && flight
    const saveFlight = isEditing ? flightsReduxResource.updateResource : flightsReduxResource.createResource

    return {
      ...props,
      saveFlight,
      flight,
      isEditing,
      isLoading: flightsReduxResource.mutationState.isLoading,
      resetMutation: flightsReduxResource.resetMutation,
    }
  })
)

export default enhance(PassportFlightDetailsForm)

