import React, { useState, useEffect } from 'react'

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
import useTheme from 'javascript/utils/theme/useTheme'

const PassportHotelsForm = (props) => {
  const { localisation: Localisation } = useTheme()
  const [hotel, setHotel] = useState({
    'active': false,
    'name': '',
    'rooms': '',
    'location': '',
    'market': {
      'id': props.marketId
    }
  })

  useEffect(() => {
    if (!props.resource || !Object.keys(props.resource).length) return
    const locationId = props.resource.location ? props.resource.location.id : null
    setHotel({
      ...props.resource,
      'market': {
        'id': props.marketId
      },
      'location': locationId
    })
  }, [props.resource])

  const handleInputChange = (e) => {
    const update = Object.assign({}, hotel)
    update[e.target.name] = e.target.value
    setHotel(update)
  }

  const handleCheckboxChange = ({ target }) => {
    const update = Object.assign({}, hotel)
    update[target.name] = target.checked
    setHotel(update)
  }

  const saveLocation = (e) => {
    e.preventDefault()
    props.resetMutation()
    const update = Object.assign({}, hotel)
    delete update['occupied-rooms']
    delete update['remaining-rooms']
    update.location = {
      id: update.location
    }
    if (props.isEditing) { // Update Existing
      delete update['market']
      props.apiUpdateHotel(update)
    } else { // Create New
      props.apiCreateHotel(update)
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

  const createLocationOptions = () => {
    return (props.locations || [])
      .filter((location) => {
        return location['location-type'] === 'hotel' && location['active'] === true
      })
      .map((location) => ({
        value: location.id,
        label: location.name
      }))
  }

  const { marketId, isLoading, isEditing } = props
  const buttonText = isEditing ? `Save ${Localisation.passport.hotel.upper}` : `Create ${Localisation.passport.hotel.upper}`
  const buttonClasses = isLoading ? 'button button--filled button--loading' : 'button button--filled'
  return (
    <div className="container">
      <form className="cms-form cms-form--large" onSubmit={saveLocation}>
        <FormControl label="Location" required>
          <Select options={createLocationOptions()}
            value={hotel['location']}
            onChange={(value) => handleInputChange({ target: { name: 'location', value } })}
            required
            simpleValue={ true }
            clearable={false}
            searchable={false} />
        </FormControl>
        <FormControl type="text" label="Hotel Name" name="name" value={hotel.name} onChange={handleInputChange} />
        <FormControl type="number" label="Total Rooms" name="rooms" value={hotel.rooms} required onChange={handleInputChange} />
        <FormControl type="checkbox" label='Active'
          checkboxLabeless={true}
          id='active'
          name='active'
          onChange={handleCheckboxChange}
          checked={hotel['active']}
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
    const { localisation: Localisation } = useTheme()
    const hotelsReduxResource = nameSpaced('passport', useReduxResource('passport-hotel', 'passport/hotels', relation))
    const locationsReduxResource = nameSpaced('passport', useReduxResource('passport-location', 'passport/locations', relation))

    useWatchForTruthy(hotelsReduxResource.mutationState.succeeded, () => {
      props.history.push(`/admin/${Localisation.passport.market.path}/${marketId}/edit`)
    })

    const locations = locationsReduxResource.getReduxResources()

    useEffect(() => {
      if (!locations) {
        locationsReduxResource.findAllFromOneRelation(relation, {
          fields: {
            'passport-locations': 'active,name'
          },
          'filter[active]': true
        })
      }
    }, [])

    return {
      ...props,
      marketId,
      apiCreateHotel: hotelsReduxResource.createResource,
      apiUpdateHotel: hotelsReduxResource.updateResource,
      apiErrors: hotelsReduxResource.mutationState.errors,
      isLoading: hotelsReduxResource.mutationState.isLoading,
      resetMutation: hotelsReduxResource.resetMutation,
      locations,
    }
  })
)

export default enhance(PassportHotelsForm)

