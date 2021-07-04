import React, { useState, useEffect } from 'react'
import moment from 'moment'

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

const PassportEventsForm = (props) => {
  const { localisation, features } = useTheme()

  const [event, setEvent] = useState({
    'active': false,
    'description': '',
    'end-date': '',
    'name': '',
    'location': '',
    'start-date': '',
    'market': {
      'id': props.marketId
    }
  })
  const [locationError, setLocationError] = useState(false)
  const [dateErrors, setDateErrors] = useState({})

  useEffect(() => {
    if (!props.resource || !Object.keys(props.resource).length) return
    const locationId = props.resource?.location ? props.resource.location.id : null
    setEvent({
      ...props.resource,
      'market': {
        'id': props.marketId
      },
      'location': locationId
    })
  }, [props.resource])

  const handleInputChange = (e) => {
    const update = Object.assign({}, event)
    update[e.target.name] = e.target.value
    setEvent(update)
    if (e.target.name === 'location') {
      setLocationError(false)
    }
  }

  const handleCheckboxChange = ({ target }) => {
    const update = Object.assign({}, event)
    update[target.name] = target.checked
    setEvent(update)
  }

  const handleDateChange = (date, dateName) => {
    const update = Object.assign({}, event)
    update[dateName] = date ? date.utc().toDate().toUTCString() : null
    setEvent(update)
  }

  const datesAreValid = () => {
    const errors = {}
    if (!event['start-date'] || !event['end-date']) {
      return true // Dates are not set yet..
    }
    const startDate = moment(event['start-date'])
    const endDate = moment(event['end-date'])
    if (startDate.isAfter(endDate)) {
      errors['start-date'] = 'must be before End-date'
    }
    setDateErrors(errors)
    return !Boolean(Object.keys(errors).length)
  }

  const saveEvent = (e) => {
    e.preventDefault()
    props.resetMutation()
    if (!event.location) {
      return setLocationError(true)
    }
    if (!datesAreValid()) {
      return
    }
    const update = Object.assign({}, event)
    update.location = {
      id: update.location
    }
    if (props.isEditing) { // Update Existing
      delete update['market']
      props.apiUpdateEvent(update)
    } else { // Create New
      props.apiCreateEvent(update)
    }
  }

  const renderErrors = () => {
    const errors = Object.assign({}, props.apiErrors, dateErrors)
    if (!errors) return null
    return (
      <ul className="cms-form__errors">
        {Object.keys(errors).map((key, i) => {
          const error = errors[key]
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
        return location['active'] === true
      })
      .map((location) => ({
        value: location.id,
        label: location.name
      }))
  }

  const { marketId, isLoading, isEditing } = props
  const buttonText = isEditing ? `Save ${localisation.passport.event.upper}` : `Create ${localisation.passport.event.upper}`
  const buttonClasses = isLoading ? 'button button--filled button--loading' : 'button button--filled'
  return (
    <div className="container">
      <form className="cms-form cms-form--large" onSubmit={saveEvent}>
        <FormControl type="text" label="Event Name" name="name" value={event.name} onChange={handleInputChange} />
        <FormControl label="Location" required error={locationError ? 'Select a location' : null}>
          <Select options={createLocationOptions()}
            value={event['location']}
            onChange={(value) => handleInputChange({ target: { name: 'location', value } })}
            required={true}
            simpleValue={ true }
            clearable={false}
            searchable={false} />
        </FormControl>
        <FormControl type="textarea" label="Description" name="description" value={event.description} required onChange={handleInputChange} />
        <FormControl type="datetime" required
          label="Start Date / Time"
          selected={event['start-date']}
          onChange={e => { handleDateChange(e, 'start-date') }}
          minuteInterval={5}
          defaultTime={'09:30'}
          dateFormat={features.formats.mediumDate}
          showYearDropdown
        />
        <FormControl type="datetime" required
          label="End Date / Time"
          selected={event['end-date']}
          onChange={e => { handleDateChange(e, 'end-date') }}
          minuteInterval={5}
          defaultTime={'15:00'}
          dateFormat={features.formats.mediumDate}
          showYearDropdown
        />
        <FormControl type="checkbox" label='Active'
          checkboxLabeless={true}
          id='active'
          name='active'
          onChange={handleCheckboxChange}
          checked={event['active']}
        />
        <div className="cms-form__control cms-form__control--actions">
          { renderErrors() }
          <NavLink to={`/admin/${localisation.passport.market.path}/${marketId}/edit`} className="button">Cancel</NavLink>
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
    const eventsReduxResource = nameSpaced('passport', useReduxResource('passport-market-event', 'passport/events', relation))
    const locationsReduxResource = nameSpaced('passport', useReduxResource('passport-location', 'passport/locations', relation))

    const { localisation: localisation } = useTheme()

    useWatchForTruthy(eventsReduxResource.mutationState.succeeded, () => {
      props.history.push(`/admin/${localisation.passport.market.path}/${marketId}/edit`)
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
      apiCreateEvent: eventsReduxResource.createResource,
      apiUpdateEvent: eventsReduxResource.updateResource,
      apiErrors: eventsReduxResource.mutationState.errors,
      isLoading: eventsReduxResource.mutationState.isLoading,
      resetMutation: eventsReduxResource.resetMutation,
      locations,
    }
  })
)

export default enhance(PassportEventsForm)

