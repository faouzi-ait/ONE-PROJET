import React, { useEffect, useState } from 'react'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import FileUploader from 'javascript/components/file-uploader'
import NavLink from 'javascript/components/nav-link'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import { withRouter } from 'react-router-dom'
import useTheme from 'javascript/utils/theme/useTheme'

const getFlightScheduleInitialState = () => ({
  file: false,
  path: ''
})

const PassportMarketsForm = (props) => {
  const { localisation: Localisation, features: Features } = useTheme()

  const [market, setMarket] = useState({
    'active': false,
    'end-date': '',
    'name' : '',
    'start-date': '',
    'travel-end-date': ''
  })
  const { isLoading, isEditing, marketId } = props
  const marketPath = `/admin/${Localisation.passport.market.path}`
  const buttonText = isEditing ? `Save ${Localisation.passport.market.upper}` : `Create ${Localisation.passport.market.upper}`
  const buttonClasses = isLoading ? 'button button--filled button--loading' : 'button button--filled'
  const [dateErrors, setDateErrors] = useState({})
  const [flightPdf, setFlightPdf] = useState(getFlightScheduleInitialState())

  useEffect(() => {
    if (!props.resource || !Object.keys(props.resource).length) return
    setMarket(props.resource)
    if (props.resource['flight-schedule-pdf'] && props.resource['flight-schedule-pdf'].url) {
      const path = `/${marketId}/flight-schedule`
      setFlightPdf({
        file: true,
        path: <a href={path}>{`${window.location.origin}${path}`}</a>
      })
    }
  }, [props.resource])

  const handleDateChange = (date, dateName) => {
    const update = Object.assign({}, market)
    update[dateName] = date ? date.endOf('day').toDate().toUTCString() : null
    setMarket(update)
  }

  const handleInputChange = (e) => {
    const update = Object.assign({}, market)
    update[e.target.name] = e.target.value
    setMarket(update)
  }

  const handleCheckboxChange = ({ target }) => {
    const update = Object.assign({}, market)
    update[target.name] = target.checked
    setMarket(update)
  }

  const saveMarket = (e) => {
    e.preventDefault()
    props.resetMutation()
    if (!datesAreValid()) {
      return
    }
    if (props.isEditing) { // Update Existing User
      props.apiUpdateMarket(market)
    } else { // Create New User
      props.apiCreateMarket(market)
    }
  }

  const datesAreValid = () => {
    const errors = {}
    if (!market['start-date'] || !market['end-date'] || !market['travel-end-date']) {
      return errors // Dates are not set yet.. API will give errors
    }
    const startDate = moment(market['start-date'])
    const endDate = moment(market['end-date'])
    const closingDate = moment(market['travel-end-date'])
    if (startDate.isAfter(endDate)) {
      errors['start-after'] = 'end-date'
    }
    if (closingDate.isAfter(startDate)) {
      errors['closing-after'] = 'start-date'
    }
    setDateErrors(errors)
    return !Boolean(Object.keys(errors).length)
  }

  const removeFlightPdf = () => {
    const update = Object.assign({}, market)
    update['flight-schedule-pdf'] = null
    update['remove-flight-schedule-pdf'] = true
    setMarket(update)
    setFlightPdf(getFlightScheduleInitialState())
  }

  const addFlightPdf = (targetName, baseStr, file) => {
    const update = Object.assign({}, market)
    update['flight-schedule-pdf'] = baseStr
    update['remove-flight-schedule-pdf'] = ''
    setMarket(update)
    setFlightPdf({
      file: true,
      path: file.name
    })
  }

  const renderErrors = () => {
    const errors = Object.assign({}, props.apiErrors, dateErrors)

    if (!errors) return null
    const errorNames = {
      'start-after': 'Start-date cannot be after',
      'start-date': 'Start-date',
      'end-date': 'End-date',
      'travel-end-date': 'Closing-date',
      'closing-after': 'Closing-date cannot be after'
    }
    return (
      <ul className="cms-form__errors">
        {Object.keys(errors).map((key, i) => {
          const error = errors[key]
          return (
            <li key={i}>{errorNames[key]} {error}</li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="container">
      <form className="cms-form cms-form--large" onSubmit={saveMarket}>
        <FormControl type="text" label="Name" name="name" value={market.name} required onChange={handleInputChange} />
        <FormControl type="date" required
          label="Start Date"
          selected={market['start-date']}
          onChange={e => { handleDateChange(e, 'start-date') }}
          dateFormat={Features.formats.mediumDate}
          showYearDropdown
        />
        <FormControl type="date" required
          label="End Date"
          selected={market['end-date']}
          onChange={e => { handleDateChange(e, 'end-date') }}
          dateFormat={Features.formats.mediumDate}
          showYearDropdown
        />
        <FormControl type="date" required
          label="Closing Date"
          selected={market['travel-end-date']}
          onChange={e => { handleDateChange(e, 'travel-end-date') }}
          dateFormat={Features.formats.mediumDate}
          showYearDropdown
        />
        { isEditing && (
            <div className="cms-form__control">
              <label className="cms-form__label">{Localisation.passport.spreadsheet}</label>
              <div className="cms-form__inner">
                <NavLink to={`${marketPath}/${marketId}/spreadsheet`} className="button button--filled">View</NavLink>
              </div>
            </div>
          )
        }
        <FileUploader title={'Flight Schedule'}
          name="flight-schedule-pdf"
          fileType={'pdf'}
          previewImage={false}
          fileSrc={flightPdf.file}
          filePath={flightPdf.path}
          onRemoveFile={removeFlightPdf}
          onChange={addFlightPdf}
        />
        <FormControl type="checkbox" label='Active'
          checkboxLabeless={true}
          id='active'
          name='active'
          onChange={handleCheckboxChange}
          checked={market['active']}
        />
        <div className="cms-form__control cms-form__control--actions">
          { renderErrors() }
          <NavLink to={marketPath} className="button">Cancel</NavLink>
          <Button type="submit" className={buttonClasses}>{buttonText}</Button>
        </div>
      </form>
    </div>
  )
}

const enhance = compose(
  withRouter,
  withHooks(props => {
    const { localisation: Localisation } = useTheme()
    const { marketId } = props.match.params
    const marketsReduxResource = nameSpaced('passport', useReduxResource('passport-market', 'passport/markets'))

    useWatchForTruthy(marketsReduxResource.mutationState.succeeded, () => {
      if (!marketId) { // createResource - move to edit form
        const newMarketId = marketsReduxResource.mutationState.lastResource.id
        props.history.push(`/admin/${Localisation.passport.market.path}/${newMarketId}/edit`)
      } else { // was editing.. return to marketIndex
        props.history.push(`/admin/${Localisation.passport.market.path}`)
      }
    })

    return {
      ...props,
      marketId,
      apiCreateMarket: marketsReduxResource.createResource,
      apiUpdateMarket: marketsReduxResource.updateResource,
      apiErrors: marketsReduxResource.mutationState.errors,
      isLoading: marketsReduxResource.mutationState.isLoading,
      resetMutation: marketsReduxResource.resetMutation
    }
  })
)

export default enhance(PassportMarketsForm)

