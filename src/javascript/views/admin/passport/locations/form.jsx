import React, { useState, useEffect} from 'react'

import { capitalize } from 'javascript/utils/generic-tools'
import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import NavLink from 'javascript/components/nav-link'
import Select from 'react-select'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import { withRouter } from 'react-router-dom'
import { regExpLiteral } from '@babel/types';
import useTheme from 'javascript/utils/theme/useTheme'

const locationTypeOptions = [{
  label: 'Hotel',
  value: 'hotel'
}, {
  label: 'Restaurant',
  value: 'restaurant'
}, {
  label: 'Other',
  value: 'event'
}]

const PassportLocationsForm = (props) => {
  const { localisation: Localisation } = useTheme()

  const [location, setLocation] = useState({
    'active': false,
    'address': '',
    'latitude': '',
    'location-type': '',
    'longitude': '',
    'name': '',
    'markets': [{
      'id': props.marketId
    }]
  })
  const [latitudeError, setLatitudeError] = useState(false)
  const [longitudeError, setLongitudeError] = useState(false)

  useEffect(() => {
    if (!props.resource || !Object.keys(props.resource).length) return
    setLocation({
      ...props.resource,
      'markets': [{
        'id': props.marketId
      }]
    })
  }, [props.resource])


  const handleInputChange = (e) => {
    const update = Object.assign({}, location)
    update[e.target.name] = e.target.value
    setLocation(update)
  }

  const handleCheckboxChange = ({ target }) => {
    const update = Object.assign({}, location)
    update[target.name] = target.checked
    setLocation(update)
  }

  const isLatLongValid = () => {
    const latitudeIsValid = /^-?([1-8]?[0-9]\.{1}\d{1,6}$|90\.{1}0{1,8}$)/.test(location.latitude.trim())
    setLatitudeError(!latitudeIsValid)
    const longitudeIsValid = /^-?((([1]?[0-7][0-9]|[1-9]?[0-9])\.{1}\d{1,8}$)|[1]?[1-8][0]\.{1}0{1,8}$)/.test(location.longitude.trim())
    setLongitudeError(!longitudeIsValid)
    return latitudeIsValid && longitudeIsValid
  }

  const saveLocation = (e) => {
    e.preventDefault()
    if (isLatLongValid()) {
      props.resetMutation()
      const update = Object.assign({}, location)
      if (props.isEditing) { // Update Existing
        delete update['markets']
        props.apiUpdateLocation(update)
      } else { // Create New
        props.apiCreateLocation(update)
      }
    }
  }

  const renderErrors = () => {
    if (!props.apiErrors) return null
    return (
      <ul className="cms-form__errors">
        {Object.keys(props.apiErrors).map((key, i) => {
          const error = props.apiErrors[key]
          return (
            <li key={i}>{capitalize(key)} {error}</li>
          )
        })}
      </ul>
    )
  }

  const marketId = props.marketId
  const { isLoading, isEditing } = props
  const buttonText = isEditing ? `Save ${Localisation.passport.location.upper}` : `Create ${Localisation.passport.location.upper}`
  const buttonClasses = isLoading ? 'button button--filled button--loading' : 'button button--filled'
  return (
    <div className="container">
      <form className="cms-form cms-form--large" onSubmit={saveLocation}>
        <FormControl type="text" label="Name" name="name" value={location.name} required onChange={handleInputChange} />
        <FormControl label="Type" required>
          <Select options={locationTypeOptions}
            value={location['location-type']}
            onChange={(value) => { handleInputChange({ target: { name: 'location-type', value } }) }}
            simpleValue={true}
            required
            clearable={false}
            searchable={false} />
        </FormControl>
        <FormControl type="text" required
          label="Latitude"
          name="latitude"
          placeholder="51.501269"
          error={latitudeError ? 'Latitude must be an number between -90 and 90. (e.g. 51.501269)' : ''}
          value={location.latitude}
          onChange={handleInputChange}
        />
        <FormControl type="text" required
          label="Longitude"
          name="longitude"
          placeholder="-0.124694"
          error={longitudeError ? 'Longitude must be an number between -180 and 180. (e.g. -0.124694)' : ''}
          value={location.longitude}
          onChange={handleInputChange}
        />
        <FormControl type="textarea" label="Address" name="address" value={location.address} required onChange={handleInputChange} />
        <FormControl type="checkbox" label='Active'
          checkboxLabeless={true}
          id='active'
          name='active'
          onChange={handleCheckboxChange}
          checked={location['active']}
        />
        <div className="cms-form__control cms-form__control--actions">
          { renderErrors() }
          <NavLink to={`/admin/${Localisation.passport.market.path}/${marketId}/edit`} className="button">Cancel</NavLink>
          <Button type="submit" className={buttonClasses}>{buttonText}</Button>
        </div>
      </form>
    </div>
  )
}

const enhance = compose(
  withRouter,
  withHooks(props => {
    const { marketId } = props.match.params
    const relation = {
      'name': 'passport-market',
      'id': marketId
    }
    const locationsReduxResource = nameSpaced('passport', useReduxResource('passport-location', 'passport/locations', relation))
    const { localisation: Localisation } = useTheme()

    useWatchForTruthy(locationsReduxResource.mutationState.succeeded, () => {
      props.history.push(`/admin/${Localisation.passport.market.path}/${marketId}/edit`)
    })

    return {
      ...props,
      marketId,
      apiCreateLocation: locationsReduxResource.createResource,
      apiUpdateLocation: locationsReduxResource.updateResource,
      apiErrors: locationsReduxResource.mutationState.errors,
      isLoading: locationsReduxResource.mutationState.isLoading,
      resetMutation: locationsReduxResource.resetMutation,
    }
  })
)

export default enhance(PassportLocationsForm)

