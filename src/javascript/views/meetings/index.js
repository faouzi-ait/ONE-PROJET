import React from 'react'
import PageHelper from 'javascript/views/page-helper'

import PageLoader from 'javascript/components/page-loader'
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import DatePicker from 'javascript/components/datepicker'
import moment from 'moment'
import CustomSelect from 'javascript/components/custom-select'
import FormControl from 'javascript/components/form-control'
import Modal from 'javascript/components/modal'
import Banner from 'javascript/components/banner'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'

import CalendarStore from 'javascript/stores/calendar'
import CalendarActions from 'javascript/actions/calendar'

import MeetingStore from 'javascript/stores/meetings'

import EventStore from 'javascript/stores/events'
import EventActions from 'javascript/actions/events'
import UserStore from 'javascript/stores/users'
import UserActions from 'javascript/actions/users'

import AccountNavigation from 'javascript/components/account-navigation'
import Calendar from 'javascript/views/meetings/calendar'
import SendInvites from 'javascript/views/events/invites'
import Search from 'javascript/views/meetings/search'
import MeetingOverview from 'javascript/views/meetings/meeting'
import DeleteMeeting from 'javascript/views/meetings/delete-meeting'
import SmallScreenMessage from 'javascript/components/small-screen-message'
import Breadcrumbs from 'javascript/components/breadcrumbs'

import EventService from 'javascript/services/events'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
import allClientVariables from './variables'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'

class Meetings extends PageHelper {
  constructor(props) {
    super(props)
    let startDate = moment.utc()
    if (props.location.state && props.location.state['date']) {
      // This has come from history.push() - i.e. meetings/new (redirect)
      // props.location.state has to be serialised - so cannot send `moments` - therefore stringified
      startDate = moment(props.location.state['date'], 'DD/MM/YYYY')
    }
    this.state = {
      query: {
        'calendar-start-date': startDate.format('DD/MM/YYYY'),
        'calendar-length': 4,
        'include': 'meetings,calendar-event-locations',
        'fields': {
          'calendars': 'slot-length,slots-array,locations-array,default-timezone,meetings',
          'meetings': [
            'has-vip,owner-full-name,description,start-time,end-time,list-name,critical',
            'title,has-meeting-notes,is-meal-slot,is-event-meeting,meeting-attendees-count',
            'checked-in,location,calendar-event-location-id,virtual'
          ].join(','),
          'calendar-event-locations': 'id'
        },
        filter: {
          meetings: {
            between: `${startDate.format('DD/MM/YYYY')},${startDate.clone().add(4, 'days').format('DD/MM/YYYY')}`
          }
        }
      },
      first: true,
      displayDate: startDate,
      type: 'all',
      location: '',
      view: 'day',
      events: [],
      modal: () => { }
    }
    if (props.location.state && props.location.state['calendar-events']) {
      const event = props.location.state['calendar-events']
      this.state.query.filter['calendar-events'] = { id: event.id }
      this.state.query.filter.meetings['calendar_event_id'] = event.id
      this.state.query.filter['calendar-event-locations'] = {
        'calendar_event_id': event.id
      }
      const start = moment(event['start-time']).startOf('day')
      const length = moment(event['end-time']).startOf('day').diff(start, 'days')
      this.state.query.filter.meetings.between = `${start.format('DD/MM/YYYY')},${start.clone().add(length + 1, 'days').format('DD/MM/YYYY')}`
      this.state.query['calendar-start-date'] = start.format('DD/MM/YYYY')
      this.state.query['calendar-length'] = length
      this.state.displayDate = start.clone()
    }
    this.eventsEnabled = this.props.theme.features.users.meetings.events
  }
  componentWillMount() {
    CalendarStore.on('change', this.updateCalendar)
    MeetingStore.on('checkIn', this.performQuery)
    MeetingStore.on('deleted', this.performQuery)
    EventStore.on('change', this.getResources)
    EventStore.on('save', this.getResources)
    UserStore.on('change', this.getResources)
  }
  componentDidMount() {
    this.performQuery()
    if (this.eventsEnabled) {
      EventStore.unsetResources()
      EventActions.getResources({
        include: 'calendar-event-locations,calendar-event-meal-slots,calendar-event-opening-times',
        fields: {
          'calendar-events': 'title,start-time,end-time,calendar-event-locations,calendar-event-meal-slots,calendar-event-opening-times,invites-sent-at,closed',
          'calendar-event-locations': 'name,nickname,max-attendees',
          'calendar-event-meal-slots': 'start-hour-and-minute,end-hour-and-minute',
          'calendar-event-opening-times': 'start-time,end-time'
        },
        filter: {
          active: true
        }
      })
    }
    UserActions.getResources({
      filter: { 'choices-for': 'meeting-owner' },
      page: { size: 200 },
      fields: { users: 'first-name,last-name' },
    })
  }
  componentWillUnmount() {
    CalendarStore.removeListener('change', this.updateCalendar)
    MeetingStore.removeListener('checkIn', this.performQuery)
    MeetingStore.removeListener('deleted', this.performQuery)
    EventStore.removeListener('change', this.getResources)
    EventStore.removeListener('save', this.getResources)
    UserStore.removeListener('change', this.getResources)
    clearInterval(this.interval)
  }
  getResources = () => {
    this.setState({
      events: EventStore.getResources(),
      users: UserStore.getResources()
    })
  }
  updateCalendar = () => {
    this.setState({
      calendar: CalendarStore.getResource()
    }, () => {
      this.finishedLoading()
      if (this.state.first) {
        const slot = Number(this.state.calendar['slot-length']) / 60
        const now = moment().minutes(('0' + Math.ceil(moment().minutes() / slot) * slot).slice(-2))
        const next = moment().add(slot, 'minute').seconds(0)
        const timeout = next.diff(now, 'milleseconds')
        setTimeout(() => {
          this.performQuery()
          this.interval = setInterval(this.performQuery, slot * 60 * 1000)
        }, timeout)
        this.setState({ first: false })
      }
    })
  }

  clearFilters = () => {
    const newState = {
      query: {
        ...this.state.query,
        'calendar-start-date': moment.utc().format('DD/MM/YYYY'),
        'calendar-length': 4,
        filter: {
          meetings: {
            between: `${moment.utc().format('DD/MM/YYYY')},${moment.utc().add(4, 'days').format('DD/MM/YYYY')}`
          }
        }
      },
      displayDate: moment.utc(),
      location: null,
      type: null,
      view: 'day'
    }
    if (!isAdmin(this.props.user) && !hasPermission(this.props.user, 'manage_meetings')) {
      newState.query.filter.meetings.owner_id = this.props.user.id
    }
    this.setState(newState, this.performQuery)
  }

  goToToday = () => {
    const newDate = moment.utc()
    this.setState({
      query: {
        ...this.state.query,
        'calendar-start-date': newDate.format('DD/MM/YYYY'),
        filter: {
          ...this.state.query.filter,
          meetings: {
            ...this.state.query.filter.meetings,
            between: `${newDate.format('DD/MM/YYYY')},${newDate.clone().add(this.state.query['calendar-length'], 'days').format('DD/MM/YYYY')}`
          }
        }
      },
      displayDate: newDate
    }, this.performQuery)
  }

  updateDate = (v) => {
    this.setState({
      query: {
        ...this.state.query,
        'calendar-start-date': v.format('DD/MM/YYYY'),
        filter: {
          ...this.state.query.filter,
          meetings: {
            ...this.state.query.filter.meetings,
            between: `${v.format('DD/MM/YYYY')},${v.clone().add(this.state.query['calendar-length'], 'days').format('DD/MM/YYYY')}`
          }
        }
      },
      displayDate: moment(v).toDate().toString()
    }, this.performQuery)
  }

  nextDay = () => {
    const newDate = this.state.displayDate.clone().add(1, 'd')
    this.setState({
      query: {
        ...this.state.query,
        'calendar-start-date': newDate.format('DD/MM/YYYY'),
        filter: {
          ...this.state.query.filter,
          meetings: {
            ...this.state.query.filter.meetings,
            between: `${newDate.format('DD/MM/YYYY')},${newDate.clone().add(this.state.query['calendar-length'], 'days').format('DD/MM/YYYY')}`
          }
        }
      },
      displayDate: newDate
    }, this.performQuery)
  }

  previousDay = () => {
    const newDate = this.state.displayDate.clone().subtract(1, 'd')
    this.setState({
      query: {
        ...this.state.query,
        'calendar-start-date': newDate.format('DD/MM/YYYY'),
        filter: {
          ...this.state.query.filter,
          meetings: {
            ...this.state.query.filter.meetings,
            between: `${newDate.format('DD/MM/YYYY')},${newDate.clone().add(this.state.query['calendar-length'], 'days').format('DD/MM/YYYY')}`
          }
        }
      },
      displayDate: newDate
    }, this.performQuery)
  }

  filterEvent = ({ target }) => {
    const v = target.value
    const { events, query } = this.state
    const meetings = query.filter.meetings ? query.filter.meetings : {}
    if (v) {
      const event = events.find(e => e.id === v)
      meetings['calendar_event_id'] = v
      const start = moment(event['start-time']).startOf('day')
      const length = moment(event['end-time']).startOf('day').diff(start, 'days') + 1 // inclusive first day
      meetings.between = `${start.format('DD/MM/YYYY')},${start.clone().add(length, 'days').format('DD/MM/YYYY')}`
      this.setState({
        query: {
          ...query,
          'calendar-start-date': start.format('DD/MM/YYYY'),
          'calendar-length': length - 1,
          filter: {
            ...query.filter,
            meetings,
            'calendar-events': { id: v },
            'calendar-event-locations': {
              'calendar_event_id': v
            }
          }
        },
        displayDate: start
      }, this.performQuery)
    } else {
      delete meetings['calendar_event_id']
      delete query.filter['calendar-events']
      delete query.filter['calendar-event-locations']
      meetings.between = `${moment.utc().format('DD/MM/YYYY')},${moment.utc().add(4, 'days').format('DD/MM/YYYY')}`
      this.setState({
        query: {
          ...query,
          'calendar-start-date': moment.utc().format('DD/MM/YYYY'),
          'calendar-length': 4,
          filter: {
            ...query.filter,
            meetings
          }
        },
        displayDate: moment.utc(),
        view: 'day'
      }, () => {
        this.performQuery()
      })
    }
  }

  filterHost = ({ target }) => {
    const v = target.value
    const { query } = this.state
    const meetings = query.filter.meetings ? query.filter.meetings : {}
    if (v) {
      meetings.owner_id = v
    } else {
      delete meetings.owner_id
    }
    this.setState({
      query: {
        ...query,
        filter: {
          ...query.filter,
          meetings
        }
      }
    }, this.performQuery)
  }

  confirmInvites = (resource) => () => {
    this.setState({
      modal: () => (
        <Modal closeEvent={this.unsetModal} title="Please Confirm" modifiers={['small']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} ref="modal">
          <div className="modal__content">
            <SendInvites resource={resource} closeEvent={this.unsetModal} />
          </div>
        </Modal>
      )
    })
  }

  performQuery = () => {
    CalendarStore.unsetResources()
    CalendarActions.getFirstResource(this.state.query)
  }

  viewMeeting = meeting => () => {
    const split = meeting['end-time'].split('T')
    const time = split[1].split(':')
    const endTime = `${split[0]} ${time[0]}:${time[1]}:00`
    const isPassed = moment() > moment(endTime)
    this.setState({
      modal: () => (
        <Modal ref="modal" title={meeting.title} closeEvent={this.unsetModal} modifiers={['meeting']}>
          <MeetingOverview meeting={meeting} closeEvent={this.unsetModal} confirmDeletion={this.confirmDeletion} isPassed={isPassed} back={this.search} user={this.props.user} />
        </Modal>
      )
    })
  }

  search = () => {
    this.setState({
      modal: () => (
        <Modal ref="modal" closeEvent={this.unsetModal} customContent={true}>
          <Search closeEvent={this.unsetModal} viewMeeting={this.viewMeeting} />
        </Modal>
      )
    })
  }
  confirmDeletion = (meeting) => () => {
    this.setState({
      modal: () => (
        <Modal closeEvent={this.viewMeeting(meeting)} title="Warning" modifiers={['warning']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} ref="modal">
          <div className="modal__content">
            <DeleteMeeting resource={meeting} closeEvent={this.viewMeeting(meeting)} />
          </div>
        </Modal>
      )
    })
  }
  printCalendar = () => {
    window.open(`/${this.props.theme.variables.SystemPages.account.path}/${this.props.theme.variables.SystemPages.meeting.path}/print?timestamp=` + (this.state.displayDate / 1000) + '&days=5')
  }
  render() {
    const { theme, indexVariablesCV } = this.props
    const { events, query, users } = this.state
    const selectedEvent = events && query.filter['calendar-events'] && query.filter['calendar-events'].id ? events.find(e => e.id === query.filter['calendar-events'].id) : null
    const selectedUser = users && query.filter['meetings'] && query.filter['meetings']['owner_id'] ? users.find(u => u.id === query.filter['meetings']['owner_id']) : null
    return (
      <PageLoader {...this.state}>
        <Meta
          title={`${theme.localisation.client} :: Meetings`}
          meta={{
            description: 'Your schedule'
          }}>
          <main className={`meetings ${!indexVariablesCV.fixedCalendar && 'meetings--flexible'}`}>
            {indexVariablesCV.showBanner &&
              <LoadPageBannerImage slug={theme.variables.SystemPages.meeting.path}>
                {({ image }) => (
                  <Banner
                    title={theme.variables.SystemPages.meeting.upper}
                    classes={indexVariablesCV.bannerClasses}
                    image={image}
                  />
                )}
              </LoadPageBannerImage>
            }
            {indexVariablesCV.showBreadcrumb &&
              <Breadcrumbs paths={[
                { name: theme.variables.SystemPages.account.upper, url: `/${theme.variables.SystemPages.account.path}` },
                { name: theme.variables.SystemPages.meeting.upper , url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}` }
              ]} />
            }
            <AccountNavigation currentPage={`/${theme.variables.SystemPages.meeting.path}`} />
            <div className="meetings__wrapper">
              <div className="meetings__controls">
                <div className="meetings__container">
                  <button className={indexVariablesCV.todayButtonClasses} onClick={this.goToToday}>Today</button>
                  <div className="meetings__range">
                    <button className={indexVariablesCV.rangeButtonClasses} onClick={this.previousDay}>
                      <Icon id="i-left-arrow" classes="button__icon" />
                    </button>
                    <DatePicker onChange={this.updateDate} selected={this.state.displayDate} dateFormat={theme.features.formats.longDate} />
                    <button className={indexVariablesCV.rangeButtonClasses} onClick={this.nextDay}>
                      <Icon id="i-right-arrow" classes="button__icon" />
                    </button>
                  </div>
                  <button className={indexVariablesCV.searchButtonClasses} style={{ marginLeft: 'auto' }} onClick={this.search}>
                  <ClientChoice>
                    <ClientSpecific client="default">
                    <Icon id="i-mag" classes="button__icon" />
                      Search for an attendee
                    </ClientSpecific>
                    <ClientSpecific client="all3">
                    <Icon id="i-mag" width="22" height="22" classes="button__icon" />
                      Search for an attendee
                    </ClientSpecific>
                  </ClientChoice>
                  </button>
                  <button className={indexVariablesCV.clearButtonClasses} onClick={this.clearFilters}>
                    <ClientSpecific client="ae">
                      <Icon id="i-filter" classes="button__icon" />
                    </ClientSpecific>
                    Clear Filters
                  </button>
                </div>
              </div>
              <div className="meetings__filters">
                <div className="meetings__container">
                  {this.eventsEnabled &&
                    <FormControl label="Event">
                      <CustomSelect options={events ? events.map(e => ({
                        value: e.id,
                        label: e.title
                      })) : null} value={selectedEvent ? selectedEvent.id : null} placeholder="All" onChange={this.filterEvent} simpleValue={true} />
                    </FormControl>
                  }
                  {(isAdmin(this.props.user) || hasPermission(this.props.user, 'manage_meetings')) &&
                    <FormControl label="Host">
                      <CustomSelect options={users ? users.sort((a, b) => {
                          return a['first-name'].localeCompare(b['first-name']) || a['last-name'].localeCompare(b['last-name'])
                        }).map(u => ({
                        value: u.id,
                        label: `${u['first-name']} ${u['last-name']}`
                      })) : null} value={selectedUser ? selectedUser.id : null} placeholder="All" onChange={this.filterHost} simpleValue={true} />
                    </FormControl>
                  }
                  {this.eventsEnabled &&
                    <FormControl label="Locations">
                      <CustomSelect options={selectedEvent ? selectedEvent['calendar-event-locations'].map(l => ({
                        value: l.id,
                        label: `${l.name} ${l.nickname ? ': ' + l.nickname : ''}`
                      })) : null} value={this.state.location} simpleValue={true} placeholder="All" onChange={({ target }) => this.setState({ location: target.value })} disabled={selectedEvent ? false : true} />
                    </FormControl>
                  }
                  {this.eventsEnabled &&
                    <FormControl label="Meetings & Meals">
                      <CustomSelect options={[
                        { value: 'meeting', label: 'Meetings' },
                        { value: 'meal', label: 'Meals' }
                      ]} value={this.state.type} simpleValue={true} placeholder="All" onChange={({ target }) => this.setState({ type: target.value })} />
                    </FormControl>
                  }
                  {this.eventsEnabled && selectedEvent &&
                    <FormControl label="View by">
                      <CustomSelect options={[
                        { value: 'day', label: 'Day' },
                        { value: 'location', label: 'Location' }
                      ]} value={this.state.view} simpleValue={true} onChange={({ target }) => this.setState({ view: target.value })} clearable={false} />
                    </FormControl>
                  }
                </div>
              </div>
              <div className="meetings__calendar">
                <Calendar calendar={this.state.calendar} locationFilter={this.state.location} typeFilter={this.state.type} event={selectedEvent} events={this.state.events} view={this.state.view} start={this.state.query['calendar-start-date']} user={this.props.user} />
              </div>
              {selectedEvent &&
                <div className="meetings__actions">
                  <div className="meetings__container">
                    <button className="button button--reversed" onClick={this.printCalendar}>Print All</button>
                    <button className="button button--reversed" onClick={() => {
                      EventService.exportResource(selectedEvent.id, 'csv', 'all', `${selectedEvent.title}_all`)
                    }}>Export All</button>
                    <button className="button button--reversed" onClick={() => {
                      EventService.exportResource(selectedEvent.id, 'csv', 'meeting-notes', `${selectedEvent.title}_notes`)
                    }}>Export notes to CSV</button>
                    <button className="button button--reversed" onClick={() => {
                      EventService.exportResource(selectedEvent.id, 'docx', 'meeting-notes', `${selectedEvent.title}_notes`)
                    }}>Export notes to Doc</button>
                    {!selectedEvent['invites-sent-at'] &&
                      <button className="button button--filled" onClick={this.confirmInvites(selectedEvent)}>Send Invites</button>
                    }
                  </div>
                </div>
              }
            </div>
            {this.state.modal()}
            <SmallScreenMessage page="Meeting Manager" fixedHeight/>
          </main>
        </Meta>
      </PageLoader>
    )
  }
}

const enhance = compose(
  withClientVariables('indexVariablesCV', allClientVariables),
)

export default enhance(Meetings)
