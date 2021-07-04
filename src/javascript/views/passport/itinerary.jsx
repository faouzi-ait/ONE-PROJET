import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

import 'stylesheets/core/components/passport/itinerary.sass'

// Components
import Banner from 'javascript/components/banner'
import Form from 'javascript/containers/passport/attendee/form'
import FormControl from 'javascript/components/form-control'
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import Select from 'react-select'

// Hooks
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'
import passportClientVariables from 'javascript/views/passport/passport.variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useTheme from 'javascript/utils/theme/useTheme'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-loader'

const PassportItinerary = (props) => {

  const [submitForm, setSumbitForm] = useState(false) //this is used as a flag to force the form to saveTrip
  const [loadingButton, setLoadingButton] = useState(false)
  const availableUsers = (props.userTrips || []).map((user) => ({
    ...user,
    value: user.id,
    label: `${user['title']} ${user['first-name']} ${user['last-name']}`
  }))

  const passportCV = useClientVariables(passportClientVariables)

  let buttonClasses = 'button'
  /* #region  itv */
  buttonClasses += ' button--filled'
  /* #endregion */

  if (loadingButton) {
    buttonClasses += ' button--loading'
  }

  const updateLoadingButtonState = (value) => setLoadingButton(value)

  if (!props.resource) {
    props.pageReceivedError()
  }

  const { localisation } = useTheme()

  return (
    <Meta
      title={`${localisation.client} :: ${localisation.passport.itinerary}`}
      meta={{
        description: `Edit & View ${localisation.passport.upper} ${localisation.passport.itinerary}`
      }}
    >
      <LoadPageBannerImage slug={localisation.passport.path} fallbackBannerImage={passportCV.defaultBannerImage}>
        {({ image }) => (
          <Banner
            classes={['short-zoomed']}
            title={localisation.passport.upper}
            image={image}
          />
        )}
      </LoadPageBannerImage>
      <main>
        { availableUsers.length < 2 ? null : (
          <div className="container">
            <div className="grid grid--two" style={{ marginTop: '15px'}}>
              <div className="grid grid--stretch">
                <div className="itinerary__user-select">
                  <FormControl label="Select an Attendee" >
                    <Select
                      value={props.attendeeId}
                      onChange={(selected) => {
                        props.history.push(`/${localisation.passport.path}/${props.marketId}/${selected.id}/itinerary`)
                      }}
                      clearable={false}
                      styles={{zIndex: 20}}
                      options={availableUsers}
                      placeholder="Select an Attendee"
                    />
                  </FormControl>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="panel-section">
          <div class="container">
            <div className="panel-section__header">
              <h2 className="panel-section__title">{`Edit ${localisation.passport.itinerary}`}</h2>
              <div className="panel-section__action">
                <button type="submit" className={buttonClasses} onClick={() => setSumbitForm(true)}>Save</button>
                <NavLink to={`/${localisation.passport.path}`} className={buttonClasses} styles={{ paddingRight: '8px'}} >
                  <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
                  Back to {localisation.passport.upper}
                </NavLink>
              </div>
            </div>
          </div>
          <Form
             isEditing="true"
             resource={props.resource}
             pageIsLoading={props.pageIsLoading}
             cms={false}
             submitForm={submitForm}
             updateLoadingButtonState={updateLoadingButtonState}
             returnPath={`/${localisation.passport.path}`} />
        </div>
      </main>
    </Meta>
  )
}

const enhance = compose(
  withLoader,
  withHooks(props => {
    const { marketId, attendeeId } = props.match.params
    const marketRelation = {
      'name': 'passport-market',
      'id': marketId
    }
    const myRelation = {
      'name': 'user',
      'id': props.user.id
    }
    const tripReduxResource = nameSpaced('passport', useReduxResource('passport-trip', 'passport/attendee', marketRelation))
    const isTripLoading = tripReduxResource.queryState.isLoading
    const myTripsReduxResource = nameSpaced('passport', useReduxResource('passport-trip-search-result', 'passport/itinerary-my-trips', myRelation))
    const isMyTripLoading = myTripsReduxResource.queryState.isLoading
    const supportTripsReduxResource = nameSpaced('passport', useReduxResource('passport-trip-search-result', 'passport/itinerary-support-trips', myRelation))
    const isSupportTripsLoading = supportTripsReduxResource.queryState.isLoading
    const [resource, setResource] = useState({})

    useEffect(() => {
      tripReduxResource.findOne(attendeeId, {
        include: 'trip-type,trip-invoice-type,support-user,user,market',
        fields: {
          'passport-trips': 'avatar,email,first-name,job-title,last-name,notes,telephone-number,title,trip-type,trip-invoice-type,support-user,user,market',
          'passport-trip-types': 'name',
          'passport-trip-invoice-types': 'name',
          'passport-markets': 'travel-end-date,active',
          'user': 'first-name,last-name,title',
        }
      })
      .then((response) => {
        setResource(response.market.active ? response : null)
      })
    }, [attendeeId])

    useEffect(() => {
      myTripsReduxResource.findAll({
        include: 'trip,trip.market',
        fields: {
          'passport-trip-search-results': 'trip',
          'passport-trips': 'first-name,last-name,title,market',
          'passport-markets': 'active',
        },
        'filter[user]': myRelation.id,
        'filter[market]': marketId,
      })
      supportTripsReduxResource.findAll({
        include: 'trip,trip.market',
        fields: {
          'passport-trip-search-results': 'trip',
          'passport-trips': 'first-name,last-name,title,market',
          'passport-markets': 'active',
        },
        'filter[market]': marketId,
        'filter[support-user]': props.user.id
      })
    }, [props.user.id])

    useEffect(() => {
      props.pageIsLoading([isTripLoading, isSupportTripsLoading, isMyTripLoading])
    }, [isTripLoading, isSupportTripsLoading, isMyTripLoading])

    const mergeAllTrips = (myTrips, supportTrips) => {
      if (myTrips && supportTrips) {
        return myTrips
          .map((searchTrip) => searchTrip.trip)
          .filter((trip) => trip.market.active)
          .concat(supportTrips
            .map((searchTrip) => searchTrip.trip)
            .filter((trip) => trip.market.active)
          )
      }
      return null
    }

    const userTrips = mergeAllTrips(myTripsReduxResource.getReduxResources(), supportTripsReduxResource.getReduxResources())

    return {
      ...props,
      marketId,
      userTrips,
      attendeeId,
      resource,
    }
  })
)

export default enhance(PassportItinerary)
