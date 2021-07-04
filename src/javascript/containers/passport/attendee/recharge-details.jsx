import React, { useState, useEffect } from 'react'
import deepEqual from 'deep-equal'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import FormControl from 'javascript/components/form-control'

// Hooks
import usePrefix from 'javascript/utils/hooks/use-prefix'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'
import useTheme from 'javascript/utils/theme/useTheme'
// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import { withRouter } from 'react-router-dom'

const getInitialState = () => ({
  'hotel-recharge-amount': 0,
  'recharge-code': '',
  'required': false,
  'trip-recharge-amount': 1500,
})

const cleanCurrencyFloats = (value, features) => {
  if (!value || !value.length) return value
  return value
    .replace(features.passport.rechargePrefix, '')
    .replace(',', '')
    .trim()
}

const PassportRechargeDetailsForm = (props) => {

  const { features } = useTheme()
  const { savedTripRelation, marketId } = props
  // savedTripRelation - if this is provided - this component will attempt to save it's current state
  const { prefix } = usePrefix()
  const [rechargeDetails, setRechargeDetails] = useState(getInitialState())

  useEffect(() => {
    if (props.recharge) {
      setRechargeDetails(props.recharge)
    } else {
      setRechargeDetails(getInitialState(props))
    }
  }, [props.recharge])

  useEffect(() => {
    if (savedTripRelation) {
      // trip has saved - try saving recharge
      if (deepEqual(rechargeDetails, getInitialState(props))) {
        // Do not save recharge.. user has not entered data
        return props.resourceFinishedSaving('recharge')
      }
      const update = {
        ...rechargeDetails,
        trip: savedTripRelation,

      }
      if (!props.isEditing) {
        update['market'] = {
          'id': marketId
        }
      }
      props.saveRecharge(update)
    }
  }, [savedTripRelation])

  const handleInputChange = ({ target }) => {
    const update = Object.assign({}, rechargeDetails)
    update[target.name] = target.value
    setRechargeDetails(update)
  }

  const handleCurrencyChange = ({ target }) => {
    const update = Object.assign({}, rechargeDetails)
    update[target.name] = cleanCurrencyFloats(target.value, features)
    setRechargeDetails(update)
  }

  const handleCheckboxChange = ({ target }) => {
    let update = Object.assign({}, rechargeDetails)
    update[target.name] = target.checked
    setRechargeDetails(update)
  }

  return (
    <div className="container">
      { props.cms ? (
          <FormControl type="checkbox" label="Recharge Required"
            checkboxLabeless={true}
            id='recharge-required'
            name='required'
            onChange={handleCheckboxChange}
            checked={rechargeDetails['required']}
          />
        ) : null
      }
      { !props.cms && props.afterClosingDate ? (
          <div className={`${prefix}form__control`}>
            <label className={`${prefix}form__label`}>Recharge Code</label>
            <div className={`${prefix}form__inner`}>
              <label className={`${prefix}form__label`}>{ rechargeDetails['recharge-code'] }</label>
            </div>
          </div>
        ) : (
          <FormControl type="text" label="Recharge Code"
            name="recharge-code"
            value={rechargeDetails['recharge-code']}
            onChange={handleInputChange}
          />
        )
      }
      { props.cms ? (
          <>
            <FormControl type="currency" label="Hotel Recharge"
              name="hotel-recharge-amount"
              value={rechargeDetails['hotel-recharge-amount']}
              currencyPrefix={features.passport.rechargePrefix + ' '}
              onChange={handleCurrencyChange}
            />
            <FormControl type="currency" label="Attendee Recharge"
              name="trip-recharge-amount"
              value={rechargeDetails['trip-recharge-amount']}
              currencyPrefix={features.passport.rechargePrefix + ' '}
              onChange={handleCurrencyChange}
            />
          </>
        ) : null
      }

    </div>
  )
}

const enhance = compose(
  withRouter,
  withHooks(props => {
    const { marketId, attendeeId } = props.match.params
    const { savedTripRelation } = props
    const tripRelation = !attendeeId ? savedTripRelation : {
      'name': 'passport-trip',
      'id': attendeeId
    }
    const rechargeReduxResource = nameSpaced('passport', useReduxResource('passport-recharge', 'passport/attendee-recharges', tripRelation))

    useEffect(() => {
      if (attendeeId) {
        rechargeReduxResource.findAllFromOneRelation(tripRelation, {
          fields: {
            'passport-recharges': 'hotel-recharge-amount,recharge-code,required,trip-recharge-amount'
          }
        })
      }
    }, [attendeeId])

    useWatchForTruthy(rechargeReduxResource.mutationState.succeeded, () => {
      props.resourceFinishedSaving('recharge')
    })

    let recharge = rechargeReduxResource.getReduxResources()
    if (recharge) {
      recharge = recharge[0]
    }
    const isEditing = attendeeId && recharge
    const saveRecharge = isEditing ? rechargeReduxResource.updateResource : rechargeReduxResource.createResource

    return {
      ...props,
      marketId,
      saveRecharge,
      recharge,
      isEditing,
      apiErrors: rechargeReduxResource.mutationState.errors,
      isLoading: rechargeReduxResource.mutationState.isLoading,
      resetMutation: rechargeReduxResource.resetMutation,
    }
  })
)

export default enhance(PassportRechargeDetailsForm)
