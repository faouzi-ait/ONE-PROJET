import React, { useState, useEffect } from 'react'
import deepEqual from 'deep-equal'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'
import { Features, PickUpLocations, DropOffLocations } from 'javascript/config/features'

// Components
import FormControl from 'javascript/components/form-control'
import RadioOther from 'javascript/components/radio-other'

// Hooks
import usePrefix from 'javascript/utils/hooks/use-prefix'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import { withRouter } from 'react-router-dom'

const getInitialState = (props) => ({
  'confirmed': false,
  'direction': props.direction === 'outbound' ? 1 : 0,
  'dropoff-location': '',
  'notes': '',
  'pickup-location': props.direction === 'outbound' ? 'Airport' : 'Hotel',
  'pickup-time': props.returnTransferTime ? props.returnTransferTime : props.outboundTransferTime ? props.outboundTransferTime : '',
  'transfer-required': true,
})

const PassportTransferDetailsForm = (props) => {

  const { savedTripRelation } = props
  // savedTripRelation - if this is provided - this component will attempt to save it's current state

  const { prefix } = usePrefix()
  const [transferDetails, setTransferDetails] = useState(getInitialState(props))
  const directionName = props.direction === 'outbound' ? 'Outbound' : 'Return'
  const directionAbbr = props.direction === 'outbound' ? 'OBND' : 'RTN'

  useEffect(() => {
    if (props.transfer) {
      setTransferDetails({
        ...props.transfer,
        direction: props.transfer.direction === 'outbound' ? 1 : 0
      })
    } else {
      setTransferDetails(getInitialState(props))
    }
  }, [props.transfer])

  useEffect(() => {
    if (savedTripRelation) {
      // trip has saved - try saving transfers
      if (deepEqual(transferDetails, getInitialState(props))) {
        // Do not save transfer.. user has not entered data
        return props.resourceFinishedSaving(`${props.direction}-transfer`)
      }
      props.saveTransfer({
        ...transferDetails,
        trip: savedTripRelation,
      })
    }
  }, [savedTripRelation])

  useEffect(() => {
    if (props.returnTransferTime && transferDetails['pickup-time'] !== props.returnTransferTime) {
      setTransferDetails({
        ...transferDetails,
        'pickup-time': props.returnTransferTime
      })
    }
  }, [props.returnTransferTime])

  useEffect(() => {
    if (props.outboundTransferTime && transferDetails['pickup-time'] !== props.outboundTransferTime) {
      setTransferDetails({
        ...transferDetails,
        'pickup-time': props.outboundTransferTime
      })
    }
  }, [props.outboundTransferTime])

  const handleInputChange = ({ target }) => {
    const update = Object.assign({}, transferDetails)
    update[target.name] = target.value
    setTransferDetails(update)
  }

  const handleCheckboxChange = ({ target }) => {
    let update = Object.assign({}, transferDetails)
    if (target.name === 'transfer-required') {
      update[target.name] = !target.checked  // transfer-required has become 'No Transfer Required`
    } else {
      update[target.name] = target.checked
    }
    setTransferDetails(update)
  }

  const handleDateChange = (date, dateName) => {
    const update = Object.assign({}, transferDetails)
    update[dateName] = date ? date.utc().toDate().toUTCString() : null
    setTransferDetails(update)
  }

  if (!props.cms && (transferDetails['confirmed'] || props.afterClosingDate)) {
    return (
      <div>
        <h3 className={`${prefix}form__title`}>{`${directionName} Transfer ${transferDetails['confirmed'] ? ' - CONFIRMED' : ''}`}</h3>
        <table className="itinerary__table">
          <tbody>
            <tr className="itinerary__row">
              <td>
                <FormControl type="checkbox"
                  label={'No Transfer Required'}
                  checkboxLabeless={true}
                  id={`${directionAbbr}-transfer-required`}
                  name='transfer-required'
                  disabled={true}
                  checked={!transferDetails['transfer-required']}
                />
              </td>
              <td/>
            </tr>
            <tr className="itinerary__row">
              <td><strong>{`${directionAbbr} Pickup Date`}</strong></td>
              <td>{transferDetails['pickup-time'] ? moment(transferDetails['pickup-time']).format(Features.formats.mediumDate) : ''}</td>
            </tr>
            <tr className="itinerary__row">
              <td><strong>{`${directionAbbr} Pickup Location`}</strong></td>
              <td>{transferDetails['pickup-location']}</td>
            </tr>
            <tr className="itinerary__row">
              <td><strong>{`${directionAbbr} Drop Off Location`}</strong></td>
              <td>{transferDetails['dropoff-location']}</td>
            </tr>
            <tr className="itinerary__row">
              <td><strong>Notes</strong></td>
              <td>{transferDetails['notes']}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="container">
      <h3 className={`${prefix}form__title`}>{`${directionName} Transfer`}</h3>
      <FormControl type="checkbox" label={'No Transfer Required'}
        checkboxLabeless={true}
        id={`${directionAbbr}-transfer-required`}
        name='transfer-required'
        onChange={handleCheckboxChange}
        checked={!transferDetails['transfer-required']}
      />
      <FormControl type="datetime" label={`${directionAbbr} Pickup Date`}
        timeLabel={'Time'}
        selected={transferDetails['pickup-time']}
        onChange={(e) => { handleDateChange(e, 'pickup-time') }}
        minuteInterval={5}
        defaultTime={'13:30'}
        oneLine={props.cms}
        dateFormat={Features.formats.mediumDate}
        showYearDropdown
      />
      <RadioOther label={`${directionAbbr} Pickup Location`}
        direction={directionAbbr}
        identifier={directionAbbr}
        name={'pickup-location'}
        value={transferDetails['pickup-location']}
        onChange={handleInputChange}
        radioOptions={PickUpLocations[props.direction]}
      />
      <RadioOther label={`${directionAbbr} Drop Off Location`}
        direction={directionAbbr}
        identifier={directionAbbr}
        name={'dropoff-location'}
        value={transferDetails['dropoff-location']}
        onChange={handleInputChange}
        radioOptions={DropOffLocations[props.direction]}
      />
      <FormControl type="textarea" label="Notes" name="notes" value={transferDetails['notes']} onChange={handleInputChange} />
      { !props.cms ? null : (
        <FormControl type="checkbox"
          label="Transfer Confirmed"
          checkboxLabeless={true}
          id={`${directionAbbr}-transfer-confirmed`}
          name='confirmed'
          onChange={handleCheckboxChange}
          checked={transferDetails['confirmed']}
        />
      )}
    </div>
  )
}

const enhance = compose(
  withRouter,
  withHooks(props => {
    const { savedTripRelation } = props
    const { attendeeId } = props.match.params
    const tripRelation = !attendeeId ? savedTripRelation : {
      'name': 'passport-trip',
      'id': attendeeId
    }
    const transfersReduxResource = nameSpaced('passport', useReduxResource('passport-transfer', `passport/attendee-transfers-${props.direction}`, tripRelation))

    useEffect(() => {
      if (attendeeId) {
        transfersReduxResource.findAllFromOneRelation(tripRelation, {
          fields: {
            'passport-transfers': 'confirmed,direction,dropoff-location,notes,pickup-location,pickup-time,transfer-required'
          },
          'filter[direction]': props.direction
        })
      }
    }, [attendeeId])

    useWatchForTruthy(transfersReduxResource.mutationState.succeeded, () => {
      props.resourceFinishedSaving(`${props.direction}-transfer`)
    })

    let transfer = transfersReduxResource.getReduxResources()
    if (transfer) {
      transfer = transfer[0]
    }
    const isEditing = attendeeId && transfer
    const saveTransfer = isEditing ? transfersReduxResource.updateResource : transfersReduxResource.createResource
    return {
      ...props,
      saveTransfer,
      transfer,
      isEditing,
      apiErrors: transfersReduxResource.mutationState.errors,
      isLoading: transfersReduxResource.mutationState.isLoading,
      resetMutation: transfersReduxResource.resetMutation,
    }
  })
)

export default enhance(PassportTransferDetailsForm)
