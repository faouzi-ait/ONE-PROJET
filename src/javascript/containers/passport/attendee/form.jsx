import React, { useState, useEffect } from 'react'
import moment from 'moment'

import { capitalize } from 'javascript/utils/generic-tools'
import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'
import { Localisation } from 'javascript/config/features'

// Components
import Button from 'javascript/components/button'
import FlightDetails from 'javascript/containers/passport/attendee/flight-details'
import FormControl from 'javascript/components/form-control'
import HotelDetails from 'javascript/containers/passport/attendee/hotel-details'
import PersonalDetails from 'javascript/containers/passport/attendee/personal-details'
import RechargeDetails from 'javascript/containers/passport/attendee/recharge-details'
import TransferDetails from 'javascript/containers/passport/attendee/transfer-details'
import NavLink from 'javascript/components/nav-link'

// Hooks
import usePrefix from 'javascript/utils/hooks/use-prefix'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'

import { withRouter } from 'react-router-dom'

const getInitialState = (props) => ({
  'title': '',
  'first-name': '',
  'last-name': '',
  'job-title': '',
  'avatar': '',
  'telephone-number': '',
  'email': '',
  'remove-avatar': '',
  'support-user': {
    'id': ''
  },
  'trip-type': {
    'id': ''
  },
  'trip-invoice-type': {
    'id': ''
  },
  'market': {
    'id': props.marketId
  },
  'user': null,
  'notes': ''
})

const PassportAttendeeForm = (props) => {
  const { marketId, savedTripRelation, isEditing, submitForm, returnPath } = props
  // submitForm: <boolean> default false - if updated to true - forces form to save
  // returnPath: <string> path to navigate to after saving form

  const { prefix } = usePrefix()
  const [isLoading, setIsLoading] = useState(false)
  const [resourcesSaved, setResourcesSaved] = useState({
    'outbound-flight': false,
    'inbound-flight': false,
    'outbound-transfer': false,
    'inbound-transfer': false,
    'hotel-reservation': false,
    'recharge': false,
  })
  let buttonText = isEditing ? 'Save' : 'Create'
  const buttonClasses = isLoading ? 'button button--filled button--loading' : 'button button--filled'
  const cancelButtonClasses = 'button button--filled'
  const [trip, setTrip] = useState(getInitialState(props))
  const [afterClosingDate, setAfterClosingDate] = useState(false)
  const [formErrors, setFormErrors] = useState(null)
  const [returnTransferTime, setReturnTransferTime] = useState(null)
  const [outboundTransferTime, setOutboundTransferTime] = useState(null)

  useEffect(() => {
    if (!props.resource || !Object.keys(props.resource).length) return
    const update = {
      ...props.resource,
      'market': {
        'id': marketId
      }
    }
    if (props.isEditing) {
      delete update['market']
    }
    if (!update['trip-type']) {
      update['trip-type'] = { 'id': '' }
    }
    if (!update['trip-invoice-type']) {
      update['trip-invoice-type'] = { 'id': '' }
    }
    if (!update['support-user']) {
      update['support-user'] = { 'id': '' }
    }
    setTrip(update)
    if (props.resource.market && props.resource.market['travel-end-date']) {
      const closingDate = moment(props.resource.market['travel-end-date']).endOf('day').utc()
      const today = moment().endOf('day').utc()
      setAfterClosingDate(closingDate.isBefore(today))
    }
  }, [props.resource])

  useEffect(() => { // chrome issue - page opens partly scrolled down
    document.body.scrollTop = document.documentElement.scrollTop = 0
  }, [])

  useEffect(() => {
    const allSaved = Object.keys(resourcesSaved).reduce((acc, curr) => {
      if (acc) acc = resourcesSaved[curr]
      return acc
    }, true)
    if (allSaved) {
      props.history.push(returnPath)
    }
  }, [resourcesSaved])

  useEffect(() => {
    if (submitForm) {
      saveTrip()
    }
  }, [submitForm])

  const updateTrip = (data) => {
    const update = Object.assign({}, trip, data)
    setTrip(update)
  }

  const updateResourcesSaved = resourcesSaved // used for async setResourcesSaved. resourcesSaved cannot be trusted state
  const resourceFinishedSaving = (resourceName) => {
    updateResourcesSaved[resourceName] = true
    setResourcesSaved(Object.assign({}, updateResourcesSaved))
  }

  const handleInputChange = (e) => {
    let update = Object.assign({}, trip)
    update[e.target.name] = e.target.value
    setTrip(update)
  }

  const saveTrip = () => {
    setIsLoading(true)
    if (props.updateLoadingButtonState) {
      props.updateLoadingButtonState(true)
    }
    setFormErrors(null)
    props.resetMutation()
    const tripUpdate = Object.assign({}, trip)
    if (!tripUpdate['trip-type'].id || !props.cms) {
      delete tripUpdate['trip-type']
    }
    if (!tripUpdate['trip-invoice-type'].id || !props.cms) {
      delete tripUpdate['trip-invoice-type']
    }
    if (!tripUpdate['support-user'].id || !props.cms) {
      delete tripUpdate['support-user']
    }
    if (!tripUpdate['user'] || !props.cms) {
      delete tripUpdate['user']
    }
    props.saveTrip(tripUpdate)
  }

  const renderErrors = () => {
    if (!props.apiErrors && !formErrors) return null
    if (isLoading) {
      setIsLoading(false)
      if (props.updateLoadingButtonState) {
        props.updateLoadingButtonState(false)
      }
    }
    const allErrors = Object.assign({}, props.apiErrors, formErrors)
    return (
      <ul className={`${prefix}form__errors`} style={{ color: 'red'}}>
        {Object.keys(allErrors).map((key, i) => {
          const error = allErrors[key]
          return (
            <li key={i}>{capitalize(key)} {error}</li>
          )
        })}
      </ul>
    )
  }

  const updateFormErrors = (errors) => {
    setFormErrors(Object.assign({}, formErrors || {}, errors))
  }

  const renderFlights = () => {
    const gridClasses = props.cms ? '' : 'grid grid--two'
    return (
      <div className={gridClasses}>
        <FlightDetails {...props}
          direction={'outbound'}
          savedTripRelation={savedTripRelation}
          resourceFinishedSaving={resourceFinishedSaving}
          cms={props.cms}
          afterClosingDate={afterClosingDate}
          setErrors={updateFormErrors}
          setOutboundTransferTime={(dateTime) => setOutboundTransferTime(dateTime)}
        />
        <FlightDetails {...props}
          direction={'inbound'}
          savedTripRelation={savedTripRelation}
          resourceFinishedSaving={resourceFinishedSaving}
          cms={props.cms}
          afterClosingDate={afterClosingDate}
          setErrors={updateFormErrors}
          setReturnTransferTime={(dateTime) => setReturnTransferTime(dateTime)}
        />
      </div>
    )
  }

  const renderTransfers = () => {
    const gridClasses = props.cms ? '' : 'grid grid--two'
    return (
      <div className={gridClasses}>
         <TransferDetails
          direction={'outbound'}
          savedTripRelation={savedTripRelation}
          resourceFinishedSaving={resourceFinishedSaving}
          cms={props.cms}
          afterClosingDate={afterClosingDate}
          outboundTransferTime={outboundTransferTime}
        />
        <TransferDetails
          direction={'inbound'}
          savedTripRelation={savedTripRelation}
          resourceFinishedSaving={resourceFinishedSaving}
          cms={props.cms}
          afterClosingDate={afterClosingDate}
          returnTransferTime={returnTransferTime}
        />
      </div>
    )
  }

  return (
    <div className="container">
      <form className={`${prefix}form ${prefix}form--large`} onSubmit={(e) => {
        e.preventDefault()
        saveTrip()
      }}>
        <PersonalDetails
          updateTrip={updateTrip}
          personalDetails={trip}
          cms={props.cms}
          afterClosingDate={afterClosingDate}
        />
        { props.cms ? null : (
          <>
            <h3 style={{ marginTop: '25px'}}>Flight Details</h3>
            <hr style={{ marginBottom: '25px'}} />
            <p>
              Please Note: If your flight details change you will need to update this information here on your itinerary page.
              Your airport transfers and accommodation bookings will be based on this information so please ensure it is accurate.
            </p>
          </>
        )}
        { renderFlights() }
        { props.cms ? null : (
          <>
            <h3 style={{ marginTop: '25px'}}>Transfer Details</h3>
            <hr style={{ marginBottom: '25px'}} />
            <p>
              All outbound and return transfers will be booked by the Experiences Team.
              If you do not require a transfer for your outbound and/or return journeys please tick the relevant boxes below.
            </p>
          </>
        )}
        { renderTransfers() }
        { props.cms ? null : (
          <p>
            Please note that you may be sharing your transfer with other colleagues so please aim to be ready and waiting 15
            minutes before your allocated time.
          </p>
        )}
        <h3 style={{ marginTop: props.cms ? '55px' : '25px'}}>Hotel Details</h3>
        <hr style={{ marginBottom: '25px'}} />
        { props.cms ? null : (
          <p>
            Owing to the volume of attendees at the MIP markets and the limited hotel availability, we cannot take requests for
            specific hotel accommodation in Cannes - this is a company wide policy. As per ITV’s Travel Policy, all accommodation
            MUST be booked through The ITV Experiences Team and no personal accommodation can be booked.
          </p>
        )}
        <HotelDetails
          savedTripRelation={savedTripRelation}
          resourceFinishedSaving={resourceFinishedSaving}
          cms={props.cms}
          afterClosingDate={afterClosingDate}
        />
        <h3 style={{ marginTop: '55px'}}>Recharge Details</h3>
        <hr style={{ marginBottom: '25px'}} />
        { props.cms ? null : (
          <p>
            For all ITV Studios &amp; Plc attendees, your hotel and airport transfers will be recharged to your
            department T&amp;E (travel and expenses) budget after the market. Your T&amp;E recharge code can be obtained from
            your Line Manager if you aren't sure of it. Your recharge code can take the form of either a cost code or project number.
            Please enter the full number in this section.
          </p>
        )}
        <RechargeDetails
          savedTripRelation={savedTripRelation}
          resourceFinishedSaving={resourceFinishedSaving}
          cms={props.cms}
          afterClosingDate={afterClosingDate}
        />
        <div className="container">
          <h3 style={{ marginTop: '55px'}}>Notes</h3>
          <hr style={{ marginBottom: '25px'}} />
          { !props.cms && afterClosingDate ? (
              <span>{trip['notes'] ? trip['notes'] : 'None' }</span>
            ) : (
              <FormControl type="textarea" label="" name="notes" value={trip['notes']} onChange={handleInputChange} />
            )
          }
        </div>
        { renderErrors() }
        <div className="grid grid--justify">
          <div className={`${prefix}form__control ${prefix}form__control--actions`}>
            <NavLink to={`/admin/${Localisation.passport.market.path}/${marketId}/spreadsheet`} className={cancelButtonClasses}>Cancel</NavLink>
            <Button type="submit" className={buttonClasses}>{buttonText}</Button>
          </div>
        </div>
      </form>
    </div>
  )
}

const enhance = compose(
  withRouter,
  withHooks(props => {
    const [savedTripRelation, setSavedTripRelation] = useState(null)
    const { marketId } = props.match.params
    const relation = {
      'name': 'passport-market',
      'id': marketId
    }

    const tripReduxResource = nameSpaced('passport', useReduxResource('passport-trip', 'passport/attendee', relation))

    useWatchForTruthy(tripReduxResource.mutationState.succeeded, () => {
      setSavedTripRelation({
        'name': 'passport-trip',
        'id': tripReduxResource.mutationState.lastResource.id
      })
    })

    const saveTrip = (!props.isEditing && !savedTripRelation)  ? tripReduxResource.createResource : tripReduxResource.updateResource

    return {
      ...props,
      marketId,
      savedTripRelation,
      saveTrip,
      apiErrors: tripReduxResource.mutationState.errors,
      resetMutation: tripReduxResource.resetMutation,
    }
  })
)

export default enhance(PassportAttendeeForm)