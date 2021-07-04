import React, { useState, useEffect } from 'react'
import deepEqual from 'deep-equal'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'
import { Features } from 'javascript/config/features'

// Components
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import { withRouter } from 'react-router-dom'

const getInitialState = () => ({
  'check-in-date': '',
  'check-out-date': '',
  'confirmed': false,
  'required': false,
  'room-type': '',
  'hotel': null
})

const PassportHotelDetailsForm = (props) => {

  const { savedTripRelation } = props
  // savedTripRelation - if this is provided - this component will attempt to save it's current state

  const [requiredField, setRequiredField] = useState(false)
  const [hotelDetails, setHotelDetails] = useState(getInitialState())
  const [hotelVacanciesWarning, setHotelVacanciesWarning] = useState(false)

  useEffect(() => {
    if (props.hotelReservation) {
      const resource = props.hotelReservation
      setHotelDetails({
        ...resource,
        hotel: resource.hotel && resource.hotel.id ? resource.hotel.id : ''
      })
    }  else {
      setHotelDetails(getInitialState(props))
    }
  }, [props.hotelReservation])

  useEffect(() => {
    if (savedTripRelation) {
      // trip has saved - try saving hotel reservations
      if (deepEqual(hotelDetails, getInitialState())) {
        // Do not save hotel-reservation.. user has not entered data
        return props.resourceFinishedSaving('hotel-reservation')
      }
      const update = {
        ...hotelDetails,
        trip: savedTripRelation,
        hotel: {
          id: hotelDetails.hotel
        }
      }
      if (!props.cms) {
        delete update['hotel']
      }
      props.saveHotelReservation(update)
    }
  }, [savedTripRelation])

  const updateHotelDetails = (update) => {
    setHotelDetails(update)
    setRequiredField(!deepEqual(update, getInitialState()))
  }

  const handleInputChange = ({ target }) => {
    const update = Object.assign({}, hotelDetails)
    update[target.name] = target.value
    updateHotelDetails(update)
  }

  const handleCheckboxChange = ({ target }) => {
    let update = Object.assign({}, hotelDetails)
    update[target.name] = target.checked
    updateHotelDetails(update)
  }

  const handleDateChange = (date, dateName) => {
    const update = Object.assign({}, hotelDetails)
    update[dateName] = date ? date.utc().toDate().toUTCString() : null
    updateHotelDetails(update)
  }

  const handleHotelSelectChange = (selected) => {
    const update = Object.assign({}, hotelDetails)
    update['hotel'] = selected.value
    updateHotelDetails(update)
    setHotelVacanciesWarning(!selected.vacancies)
  }

  const createHotelOptions = () => {
    return (props.hotels || [])
      .map((hotel) => ({
        value: hotel.id,
        label: hotel.name,
        vacancies: hotel['remaining-rooms'] > 0
      }))
  }

  const renderFormInputs = () => {
    const hotel = (props.hotels || []).find((hotel) => hotel.id === hotelDetails['hotel'])
    if (!props.cms && (hotelDetails['confirmed'] || props.afterClosingDate)) {
      return (
        <table className="itinerary__table">
          <tbody>
            <tr className="itinerary__row">
              <td>
                <FormControl type="checkbox"
                  label={'Hotel Required'}
                  checkboxLabeless={true}
                  id="hotel-required"
                  name='required'
                  disabled={true}
                  checked={hotelDetails['required']}
                />
              </td>
              <td/>
            </tr>
            <tr className="itinerary__row">
              <td><strong>{`Hotel ${hotelDetails['confirmed'] ? '- CONFIRMED' : ''}`}</strong></td>
              <td>{hotel ? hotel['name'] : ''}</td>
            </tr>
            <tr className="itinerary__row">
              <td><strong>Hotel check-in date</strong></td>
              <td>{hotelDetails['check-in-date'] ? moment(hotelDetails['check-in-date']).format(Features.formats.mediumDate) : ''}</td>
            </tr>
            <tr className="itinerary__row">
              <td><strong>Hotel check-out date</strong></td>
              <td>{hotelDetails['check-out-date'] ? moment(hotelDetails['check-out-date']).format(Features.formats.mediumDate) : ''}</td>
            </tr>
            <tr className="itinerary__row">
              <td><strong>Room Type</strong></td>
              <td>{hotelDetails['room-type']}</td>
            </tr>
          </tbody>
        </table>
      )
    }
    return (
      <>
        <FormControl type="checkbox" label="Hotel Required"
          checkboxLabeless={true}
          id='hotel-required'
          name='required'
          onChange={handleCheckboxChange}
          checked={hotelDetails['required']}
        />
        { !props.cms ? null : (
          <FormControl label="Hotel" error={hotelVacanciesWarning ? 'This Hotel has no rooms remaining' : ''} required >
            <Select
              value={hotelDetails['hotel']}
              required={requiredField}
              onChange={(value) => handleHotelSelectChange(value)}
              clearable={false}
              options={createHotelOptions()} />
          </FormControl>
        )}
        <FormControl type="date"
          label="Hotel check-in date"
          selected={hotelDetails['check-in-date']}
          onChange={e => { handleDateChange(e, 'check-in-date') }}
          dateFormat={Features.formats.mediumDate}
          showYearDropdown
        />
        <FormControl type="date"
          label="Hotel check-out date"
          selected={hotelDetails['check-out-date']}
          onChange={e => { handleDateChange(e, 'check-out-date') }}
          dateFormat={Features.formats.mediumDate}
          showYearDropdown
        />
        { !props.cms ? null : (
          <>
            <FormControl type="text" label="Room Type" name="room-type" value={hotelDetails['room-type']} onChange={handleInputChange} />
            <FormControl type="checkbox" label="Hotel Confirmed"
              checkboxLabeless={true}
              id='hotel-confirmed'
              name='confirmed'
              onChange={handleCheckboxChange}
              checked={hotelDetails['confirmed']}
            />
          </>
        )}
      </>
    )
  }


  return (
    <div className="container">
      { !props.cms && !props.hotelReservation ? (
          <div className="grid grid--justify">
            <p style={{
              color: 'grey',
              fontWeight: 'bold'
          }}>
            There are currently NO assigned hotels for this event.
          </p>
          </div>
        ) : renderFormInputs()
      }
    </div>
  )
}

const enhance = compose(
  withRouter,
  withHooks(props => {
    const { savedTripRelation } = props
    const { marketId, attendeeId } = props.match.params
    const marketRelation = {
      'name': 'passport-market',
      'id': marketId
    }
    const tripRelation = !attendeeId ? savedTripRelation : {
      'name': 'passport-trip',
      'id': attendeeId
    }

    const hotelsReduxResource = nameSpaced('passport', useReduxResource('passport-hotel', 'passport/attendee-hotels', marketRelation))
    const hotelReservationReduxResource = nameSpaced('passport', useReduxResource('passport-hotel-reservation', 'passport/attendee-hotelReservations', tripRelation))

    useEffect(() => {
      hotelsReduxResource.findAllFromOneRelation(marketRelation, {
        fields: {
          'passport-hotels': 'name,remaining-rooms'
        },
        'filter[active]': true
      })
    }, [])

    useEffect(() => {
      if (attendeeId) {
        hotelReservationReduxResource.findAllFromOneRelation(tripRelation, {
          include: 'hotel',
          fields: {
            'passport-hotel-reservations': 'check-in-date,check-out-date,confirmed,required,room-type,hotel',
            'passport-hotels': 'name'
          }
        })
      }
    }, [attendeeId])

    useWatchForTruthy(hotelReservationReduxResource.mutationState.succeeded, () => {
      props.resourceFinishedSaving('hotel-reservation')
    })

    let hotelReservation = hotelReservationReduxResource.getReduxResources()
    if (hotelReservation) {
      hotelReservation = hotelReservation[0]
    }

    const isEditing = attendeeId && hotelReservation
    const saveHotelReservation = isEditing ? hotelReservationReduxResource.updateResource : hotelReservationReduxResource.createResource

    return {
      ...props,
      isEditing,
      saveHotelReservation,
      hotelReservation,
      hotels: hotelsReduxResource.getReduxResources(),
    }
  })
)

export default enhance(PassportHotelDetailsForm)
