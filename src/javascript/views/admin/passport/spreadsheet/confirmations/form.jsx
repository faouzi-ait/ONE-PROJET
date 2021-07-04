import React, { useState, useEffect } from 'react'
import deepmerge from 'deepmerge-concat'
import moment from 'moment'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'
import '!style-loader!css-loader!react-tabulator/lib/styles.css';
import '!style-loader!css-loader!react-tabulator/lib/css/tabulator.min.css'

// Components
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import { ReactTabulator } from 'react-tabulator';

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import { withRouter } from 'react-router-dom'
import useTheme from 'javascript/utils/theme/useTheme'

const formatDate = (dateStr, format) => {
  if (!dateStr) return ''
  return moment(dateStr).format(format)
}

const resourceFieldMap = {
  'hotel-reservation': 'hotel',
  'flight': 'departure-date',
  'transfer': 'pickup-time'
}

const columnNameMap = {
  'hotel-reservation': 'Hotel',
  'flight': 'Departure',
  'transfer': 'Transfer'
}

const getColumns = (props) => ([
  { title: 'First Name', field: 'first-name', editor: false },
  { title: 'Last Name', field: 'last-name', editor: false },
  { title: `${columnNameMap[props.type]}`, field: 'detail', editor: false},
  { title: 'Confirmed', field: 'confirmed', editor: true, align:'center', formatter: 'tickCross' },
])

const PassportConfirmationForm = (props) => {

  const { type, modalState } = props
  const [isLoading, setIsLoading] = useState(false)
  const [confirmAll, setConfirmAll] = useState(false)
  const [unConfirmedTargetCount, setUnConfirmedTargetCount] = useState(-1)
  const buttonClasses = isLoading ? 'button button--filled button--loading' : 'button button--filled'
  const { features } = useTheme()

  useEffect(() => {
    if (props.resources && (props.resources.length === unConfirmedTargetCount)) {
      // All Confirmations have finished saving..
      modalState.hideModal()
    }
  }, [props.resources])

  const tableData = (props.resources || []).map((resource) => {
    let detail = resource[resourceFieldMap[type]]
    detail = props.type === 'hotel-reservation' ? detail.name : formatDate(detail, features.formats.dateTime)
    return {
      ...resource,
      'first-name': resource.trip['first-name'] || '',
      'last-name': resource.trip['last-name'] || '',
      'detail': detail,
      'confirmed': confirmAll || resource['confired'],
    }
  })

  const saveClicked = () => {
    setIsLoading(true)
    const confirmedRows = tableData.filter((row) => row.confirmed)
    setUnConfirmedTargetCount(tableData.length - confirmedRows.length)
    confirmedRows.forEach((row) => {
      setTimeout(() => props.updateConfirmationStatus(row), 50) //slowing down BE spamming
    })
  }

  const renderTable = () => (
    <>
      <div className="grid grid--end">
        <FormControl type="checkbox" label='Confirm All'
          checkboxLabeless={true}
          id='confirm-all'
          checked={confirmAll}
          onChange={({ target }) => setConfirmAll(target.checked)}
        />
      </div>
      <ReactTabulator columns={getColumns(props)} data={tableData} options={{ layout: 'fitColumns' }} />
    </>
  )

  const renderAllConfirmed = () => {
    const resourceName = pluralize(type).replace('-', ' ')
    return  (
      <div>
        <p>All {resourceName} have been confirmed.</p>
      </div>
    )
  }

  return (
    <div className="cms-modal__content">
      { tableData.length ? renderTable() : renderAllConfirmed() }
      <div className="cms-form__control cms-form__control--actions">
        <Button type="button" className="button" onClick={modalState.hideModal} >Cancel</Button>
        { tableData.length ? <Button type="button" className={buttonClasses} onClick={saveClicked} >Save</Button> : null}
      </div>
    </div>
  )
}

const enhance = compose(
  withRouter,
  withHooks(props => {
    const { type } = props
    const { marketId } = props.match.params
    const marketRelation = {
      'name': 'passport-market',
      'id': marketId
    }

    const confirmationReduxResource =  nameSpaced('passport', useReduxResource(`passport-${type}`, `passport/confirmation-${type}`, marketRelation))

    let query = {
      include: 'trip',
      fields: {
        [`passport-${type}s`]: `${resourceFieldMap[type]},confirmed,trip`,
        'passport-trips': 'first-name,last-name',
      },
      'filter[confirmed]': false
    }
    if (type === 'hotel-reservation') {
      query = deepmerge.concat(query, {
        include: 'hotel',
        fields: {
          'passport-hotels': 'name',
        }
      })
    }

    useEffect(() => {
      confirmationReduxResource.findAllFromOneRelation(marketRelation, query)
    }, [props.type])

    const resources = confirmationReduxResource.getReduxResources()
    const hasConfirmedResources = Boolean((resources || []).filter((resource) => resource.confirmed).length)
    useEffect(() => {
      if (hasConfirmedResources) {
        confirmationReduxResource.findAllFromOneRelation(marketRelation, query)
      }
    }, [hasConfirmedResources])

    return {
      ...props,
      updateConfirmationStatus: confirmationReduxResource.updateResource,
      resources
    }

  })
)

export default enhance(PassportConfirmationForm)
