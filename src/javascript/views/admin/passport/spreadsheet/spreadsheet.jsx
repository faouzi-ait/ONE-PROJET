import React, { useState, useEffect } from 'react'

import '!style-loader!css-loader!react-tabulator/lib/styles.css';
import '!style-loader!css-loader!react-tabulator/lib/css/tabulator.min.css'
import 'stylesheets/core/components/tabulator.sass'

import { ReactTabulator, reactFormatter } from 'react-tabulator';
import moment from 'moment'
import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Button from 'javascript/components/button'
import DeleteForm from 'javascript/components/index-helpers/delete-form'
import FormControl from 'javascript/components/form-control'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'
import Paginator from 'javascript/components/paginator'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'
import useCsvExport from 'javascript/utils/hooks/use-csv-export'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import { withRouter } from 'react-router-dom'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer';


const getTransportInfo = (data, direction) => {
  if (!data) return
  return data.filter((v) => v.direction === direction)[0] || {}
}

const formatDate = (dateStr, format) => {
  if (!dateStr) return ''
  return moment(dateStr).format(format)
}

const EditButton = (props) => {
  const cellData = props.cell._cell.row.data;
  const { localisation } = props.theme
  return (
    <div onClick={() => {
      props.history.push(`/admin/${localisation.passport.market.path}/${props.marketId}/attendee/${cellData.id}/edit`)
    }}>
      <Icon width="25" height="25" viewBox="0 0 25 25" id="i-edit" classes="cms-button__icon" />
    </div>
  )
}

const DeleteButton = (props) => {
  const cellData = props.cell._cell.row.data;
  const { modalState } = props
  return (
    <div onClick={() => {
      modalState.showModal(({ hideModal }) => {
        return (
          <Modal
            closeEvent={ hideModal }
            title="Warning" modifiers={['warning']}
            titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
            <div className="cms-modal__content">
              <DeleteForm resource={cellData} deleteResource={props.deleteTrip} resourceName={'Trip'} closeEvent={ hideModal } />
            </div>
          </Modal>
        )
      })
    }}>
      <Icon width="25" height="25" viewBox="0 0 25 25" id="i-delete" classes="cms-button__icon" />
    </div>
  )
}

const getColumns = (props) => ([
  { align: "center", formatter: reactFormatter(<EditButton {...props}/>), frozen: true},
  { align: "center", formatter: reactFormatter(<DeleteButton {...props}/>), frozen: true},
  { title:'First Name', field: 'first-name', editor: false, frozen: true },
  { title:'Last Name', field: 'last-name', editor: false, frozen: true },
  { title:'Email', field: 'email', editor: false },
  { title:'Photo', field: 'avatar', editor: false, align: 'center', formatter: 'image', formatterParams: { height:'50px' }},
  { title:'Complete', field: 'complete', editor: false, align:'center', formatter: 'tickCross' },
  { title:'Telephone', field: 'telephone-number', editor: false },
  { title:'Support Person', field: 'support-user', editor: false },
  { title:'User Type', field: 'trip-type', editor: false },
  { title:'Invoice Type', field: 'trip-invoice-type', editor: false },
  { title:'Recharge', field: 'recharge', editor: false, align: 'center', formatter: 'tickCross' },
  { title:'Recharge Code', field: 'recharge-code', editor: false },
  { title:'Total Hotel Recharge', field: 'hotel-recharge', editor: false, formatter: 'money' },
  { title:'Total Attendee Recharge', field: 'attendee-recharge', editor: false, formatter: 'money' },
  { title:'OBND Departure Time', field: 'outbound-departure-datetime', editor: false},
  { title:'OBND Flight Number', field: 'outbound-flight-number', editor: false },
  { title:'OBND Departure Airport', field: 'outbound-departure-airport', editor: false },
  { title:'OBND Destination Airport', field: 'outbound-destination-airport', editor: false },
  { title:'OBND Arrival Time', field: 'outbound-arrival-datetime', editor: false },
  { title:'OBND Pickup Time', field: 'outbound-pickup-time', editor: false },
  { title:'OBNDTransfer Notes', field: 'outbound-transfer-notes', editor: false, formatter: 'textarea' },
  { title:'RTN Pickup Time', field: 'return-pickup-time', editor: false },
  { title:'RTN Pickup Location', field: 'return-pickup-location', editor: false },
  { title:'RTN Departure Time', field: 'return-departure-datetime', editor: false },
  { title:'RTN Flight Number', field: 'return-flight-number', editor: false },
  { title:'RTN Departure Airport', field: 'return-departure-airport', editor: false },
  { title:'RTN Destination Airport', field: 'return-destination-airport', editor: false },
  { title:'RTN Arrival Time', field: 'return-arrival-datetime', editor: false },
  { title:'RTN Transfer Notes', field: 'return-transfer-notes', editor: false, formatter: 'textarea' },
  { title:'Hotel', field: 'hotel', editor: false },
  { title:'Room Type', field: 'room-type', editor: false },
  { title:'Check-in', field: 'check-in-date', editor: false },
  { title:'Check-out', field: 'check-out-date', editor: false },
  { title:'Notes', field: 'notes', editor: false, formatter: 'textarea' },
])


const PassportSpreadsheet = (props) => {

  const [searchParams, setSearchParams] = useState('')
  const [searchTimer, setSearchTimer] = useState(null)
  const { localisation, features } = props.theme

  useEffect(() => {
    clearTimeout(searchTimer)
    setSearchTimer(setTimeout(() => {
      props.updateSearch(searchParams)
    }, 300))
  }, [searchParams])

  const tables = document.getElementsByClassName('tabulator-table')
  for (let i = 0; i < tables.length; i++) {
    tables[i].style.paddingBottom = '100px'
    tables[i].style['padding-bottom'] = '100px'
  }

  const newAttendee = (resource) => {
    props.history.push(`/admin/${localisation.passport.market.path}/${props.marketId}/attendee/new`)
  }

  const tableData = (props.trips || []).map((trip) => {
    const obndFlight = getTransportInfo(trip.flights, 'outbound')
    const rtnFlight = getTransportInfo(trip.flights, 'inbound')
    const obndTransfer = getTransportInfo(trip.transfers, 'outbound')
    const rtnTransfer = getTransportInfo(trip.transfers, 'inbound')
    const hotelReservation = trip['hotel-reservations'][0] || {
      'room-type': '',
      'check-in-date': '',
      'check-out-date': '',
      'confirmed': false
    }
    const tripRecharges = trip.recharges || {
      'recharge-code': '',
      'hotel-recharge-amount': '',
      'trip-recharge-amount': ''
    }
    const supportUser = trip['support-user'] || {
      'title': '',
      'first-name': '',
      'last-name': ''
    }

    return {
      ...trip,
      'avatar': trip.avatar.admin_preview.url || '',
      'complete': trip['complete'],
      'support-user': `${supportUser['title']} ${supportUser['first-name']} ${supportUser['last-name']}`,
      'trip-type': trip['trip-type'] ? trip['trip-type'].name : '',
      'trip-invoice-type': trip['trip-invoice-type'] ? trip['trip-invoice-type'].name : '',
      'recharge': tripRecharges['required'],
      'recharge-code': tripRecharges['recharge-code'],
      'hotel-recharge': `${features.passport.rechargePrefix} ${tripRecharges['hotel-recharge-amount']}`,
      'attendee-recharge': `${features.passport.rechargePrefix} ${tripRecharges['trip-recharge-amount']}`,
      'outbound-departure-datetime': formatDate(obndFlight['departure-date'], features.formats.dateTime),
      'outbound-flight-number': obndFlight['flight-number'] || '',
      'outbound-departure-airport': obndFlight['departure-airport'] || '',
      'outbound-destination-airport': obndFlight['destination-airport'] || '',
      'outbound-arrival-datetime': formatDate(obndFlight['arrival-time'], features.formats.dateTime),
      'outbound-pickup-time': formatDate(obndTransfer['pickup-time'], features.formats.dateTime),
      'outbound-transfer-notes': obndTransfer['notes'] || '',
      'return-pickup-time': formatDate(rtnTransfer['pickup-time'], features.formats.dateTime),
      'return-pickup-location': rtnTransfer['pickup-location'] || '',
      'return-departure-datetime': formatDate(rtnFlight['departure-date'], features.formats.dateTime),
      'return-flight-number': rtnFlight['flight-number'] || '',
      'return-departure-airport': rtnFlight['departure-airport'] || '',
      'return-destination-airport': rtnFlight['destination-airport'] || '',
      'return-arrival-datetime': formatDate(rtnFlight['arrival-time'], features.formats.dateTime),
      'return-transfer-notes': rtnTransfer['notes'] || '',
      'hotel': hotelReservation['hotel'] ? hotelReservation['hotel']['name'] : '',
      'room-type': hotelReservation['room-type'],
      'check-in-date': hotelReservation['check-in-date'],
      'check-out-date': hotelReservation['check-out-date'],
      // Extra data not rendered in grid
      'name': `${trip['first-name']} ${trip['last-name']}` // used by delete confirmation form

    }
  })

  return (
    <div className="container">
      <section className="panel">
        <div className="grid grid--stretch">
          <FormControl type="text" label="Search"
            name="searchParams"
            value={searchParams}
            placeholder="Search first name or last name"
            onChange={({target}) => setSearchParams(target.value)}
          />
          <div className="cms-form__control cms-form__control--shrink">
            <Button type="button" className="button button--filled" onClick={newAttendee} >Add {localisation.passport.attendee}</Button>
          </div>
          <div className="cms-form__control cms-form__control--shrink">
            <Button type="button" className="button button--filled" onClick={props.exportSpreadsheet} >Export {localisation.passport.spreadsheet}</Button>
          </div>
        </div>
      </section>
      <section className="panel">
        <ReactTabulator columns={getColumns(props)} data={tableData} options={{
          layout: 'fitDataFill',
          placeholder: 'No Data Available',
        }} />
      </section>
      { props.totalPages > 1 &&
        <Paginator currentPage={ props.pageNumber } totalPages={ props.totalPages } onChange={ props.updatePageNumber }/>
      }
    </div>
  )
}

const PAGE_SIZE = 10

const enhance = compose(
  withRouter,
  withTheme,
  withModalRenderer,
  withHooks(props => {
    const [query, setQuery] = useState({
      pageNumber: 1,
      searchParams: '',
    })
    const [totalPages, setTotalPages] = useState(0)
    const [savedSearchParams, setSavedSearchParams] = useState('')

    const { marketId } = props.match.params
    const marketRelation = {
      'name': 'passport-market',
      'id': marketId
    }
    const tripSearchResultsReduxResource = nameSpaced('passport', useReduxResource('passport-trip-search-result', 'passport/spreadsheet-results', marketRelation))
    const tripReduxResource = nameSpaced('passport', useResource('passport-trip'))
    const spreadsheetReduxResource = nameSpaced('passport', useReduxResource('passport-market', 'passport/markets'))
    const [spreadsheetExport] = useState(useCsvExport())

    const updateSearch = (searchParams) => {
      if (searchParams !== query.searchParams) {
        setQuery({
          pageNumber: 1,
          searchParams,
        })
      }
    }

    const getTrips = () => {
      const queryParams = {
        include: 'trip,trip.support-user,trip.trip-type,trip.trip-invoice-type,trip.recharges,trip.flights,trip.transfers,trip.hotel-reservations,trip.hotel-reservations.hotel',
        fields: {
          'passport-trip-search-results': 'trip',
          'passport-trips': 'avatar,complete,email,first-name,last-name,notes,support-user,telephone-number,trip-type,trip-invoice-type,recharges,flights,transfers,hotel-reservations',
          'user': 'title,first-name,last-name',
          'passport-trip-types': 'name',
          'passport-trip-invoice-types': 'name',
          'passport-recharges': 'recharge-code,hotel-recharge-amount,trip-recharge-amount,required',
          'passport-flights': 'direction,departure-date,flight-number,departure-airport,destination-airport,arrival-time,confirmed',
          'passport-transfers': 'direction,pickup-time,pickup-location,notes,confirmed',
          'passport-hotel-reservations': 'check-in-date,check-out-date,room-type,confirmed,hotel',
          'passport-hotels': 'name'
        },
        'page[size]': PAGE_SIZE,
        'page[number]': query.pageNumber,
        'filter[market]' : marketId,
      }
      if (query.searchParams.length) {
        queryParams['filter[keyword]'] = query.searchParams
      }
      tripSearchResultsReduxResource.findAll(queryParams)
      .then((response) => {
        setTotalPages(response.meta['page-count'])
      })
    }

    const updatePageNumber = (pageNumber) => {
      setQuery((prevQuery) => ({
        ...prevQuery,
        pageNumber: Number.parseInt(pageNumber)
      }))
    }

    const exportSpreadsheet = () => {
      spreadsheetExport.create(`passport/markets/${props.marketId}`, {}, 'csv', props.market.name)
    }

    useEffect(() => {
      getTrips()
    }, [query])

    useWatchForTruthy(tripReduxResource.mutationState.succeeded, () => {
      getTrips()
      props.modalState.hideModal()
    })

    const flightConfirmationReduxResource =  nameSpaced('passport', useReduxResource(`passport-flight`, `passport/confirmation-flight`, marketRelation))
    const flightConfirmations = flightConfirmationReduxResource.getReduxResources() || []
    const transferConfirmationReduxResource =  nameSpaced('passport', useReduxResource(`passport-transfer`, `passport/confirmation-transfer`, marketRelation))
    const transferConfirmations = transferConfirmationReduxResource.getReduxResources() || []
    const hotelConfirmationReduxResource =  nameSpaced('passport', useReduxResource(`passport-hotel-reservation`, `passport/confirmation-hotel-reservation`, marketRelation))
    const hotelConfirmations = hotelConfirmationReduxResource.getReduxResources() || []

    useEffect(() => {
      getTrips()
    }, [flightConfirmations.length, transferConfirmations.length, hotelConfirmations.length])

    return {
      ...props,
      deleteTrip: tripReduxResource.deleteResource,
      marketId,
      pageNumber: query.pageNumber,
      totalPages,
      trips: (tripSearchResultsReduxResource.getReduxResources() || []).map((searchResult) => searchResult.trip),
      updatePageNumber,
      updateSearch,
      exportSpreadsheet
    }
  })
)

export default enhance(PassportSpreadsheet)


