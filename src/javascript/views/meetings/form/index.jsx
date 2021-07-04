import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { withRouter } from 'react-router'
import pluralize from 'pluralize'
import deepEqual from 'deep-equal'

import 'stylesheets/core/components/meeting'

import { findOneByModel } from 'javascript/utils/apiMethods'
import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import withUser from 'javascript/components/hoc/with-user'
import zones from 'javascript/views/events/zones.json'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withHooks from 'javascript/utils/hoc/with-hooks'
import allClientVariables from './variables'

// Components
import AsyncSearchResource from 'javascript/components/async-search-resource'
import AsyncSearchUser from 'javascript/components/async-search-users'
import Banner from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import Checkbox from 'javascript/components/custom-checkbox'
import CustomSelect from 'javascript/components/custom-select'
import DatePicker from 'javascript/components/datepicker'
import FileUploader from 'javascript/components/file-uploader'
import FormControl from 'javascript/components/form-control'
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import NewAttendees from 'javascript/views/meetings/new-attendees'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import RegisteredAttendees from 'javascript/views/meetings/registered-attendees'
import RouteLeavingGuard from 'javascript/components/route-leaving-guard'
import SlideToggle from 'javascript/components/slide-toggle'
import SmallScreenMessage from 'javascript/components/small-screen-message'
import Tabs from 'javascript/components/tabs'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'
import { NavLink } from 'react-router-dom'
// Actions
import CalendarActions from 'javascript/actions/calendar'
import EventActions from 'javascript/actions/events'
import LocationActions from 'javascript/actions/calendar-event-locations'
import LocationRestrictionsActions from 'javascript/actions/calendar-event-location-restrictions'
import MeetingActions from 'javascript/actions/meetings'
// Stores
import CalendarStore from 'javascript/stores/calendar'
import EventStore from 'javascript/stores/events'
import LocationRestrictionsStore from 'javascript/stores/calendar-event-location-restrictions'
import LocationStore from 'javascript/stores/calendar-event-locations'
import MeetingStore from 'javascript/stores/meetings'

class MeetingForm extends PageHelper {
  constructor(props) {
    super(props)
    const { theme } = this.props
    this.state = {
      ...this.props.initialState,
      attendeesHaveChanged: false,
      formInputsHaveChanged: false, // exlcudes attendeesHaveChanged status
      initialResourceState: null,
      nextLocation: null,
      modal: () => {},
      'virtual-bg-image': {},
      isLoading: false
    }
    if (!isAdmin(props.user) && !hasPermission(props.user, 'manage_meetings')) {
      this.state.resource.owner = { id: props.user.id }
    }
    this.isEventEnabled = theme.features.users.meetings.events
  }

  componentWillMount() {
    if (this.isEventEnabled) {
      EventStore.on('change', this.getResources)
      LocationStore.on('change', this.getResources)

      if (this.props.meetingsCV.shouldValidateLocation) {
        LocationRestrictionsStore.on('change', this.validateLocationRestrictions)
      }
    }
    CalendarStore.on('change', this.getResources)
    MeetingStore.on('save', this.redirect)
    MeetingStore.on('error', this.updateErrors)
    this.calculateDates()
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.checkPosition, { passive: true })
    if (this.isEventEnabled) {
      EventStore.removeListener('change', this.getResources)
      LocationStore.removeListener('change', this.getResources)

      if (this.props.meetingsCV.shouldValidateLocation) {
        LocationRestrictionsStore.removeListener('change', this.validateLocationRestrictions)
      }
    }
    CalendarStore.removeListener('change', this.getResources)
    MeetingStore.removeListener('save', this.redirect)
    MeetingStore.removeListener('error', this.updateErrors)
  }

  componentDidMount() {
    window.addEventListener('scroll', this.checkPosition, { passive: true })
    if (this.isEventEnabled) {
      EventActions.getResources({
        include: 'calendar-event-meal-slots',
        filter: {
          active: true,
          closed: false,
        },
        fields: {
          'calendar-events':
            'title,timezone,calendar-event-meal-slots,start-time,end-time',
          'calendar-event-meal-slots':
            'start-hour-and-minute,end-hour-and-minute',
        },
      })
    }
    CalendarActions.getFirstResource({
      fields: {
        calendars: 'slot-length',
      },
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.isEdit && this.props.meetingResource !== prevProps.meetingResource) {
      const update = {...this.props.meetingResource}
      if (this.state.initialCount) delete update.initialCount
      const initialResourceState = {
        ...update.resource,
        'meeting-attendees': update.resource['meeting-attendees'].map((attendee) => ({...attendee}))
      }
      this.setState({
        ...update,
        initialResourceState
      }, () => {
        if (this.state.type === 'event') {
          EventActions.getResources({
            include: 'calendar-event-meal-slots',
            filter: {
              'active': true
            },
            fields: {
              'calendar-events': 'title,timezone,calendar-event-meal-slots,start-time,end-time',
              'calendar-event-meal-slots': 'start-hour-and-minute,end-hour-and-minute'
            }
          })
          this.searchLocations()
        }
        CalendarActions.getFirstResource({
          fields: { calendars: 'slot-length' }
        })
      })
    }

    const massageResourceForEquality = (resource) => {
      if (!resource || !resource.id) return null
      const update = {...resource}
      const blackList = ['list', 'meeting-attendees']
      blackList.forEach((key) => delete update[key])
      const formatDates = ['start-time', 'end-time']
      formatDates.forEach((key) => update[key] = moment(update[key]).format('DD/MM/YYYY HH:mm'))
      const onlyTrackIds = ['owner']
      onlyTrackIds.forEach((key) => update[key] = update[key]?.['id'])
      return update
    }

    if (this.props.isEdit) {
      if (this.state.initialResourceState?.['meeting-attendees'] && this.state.resource?.['meeting-attendees']) {
        const formInputsHaveChanged = !deepEqual(massageResourceForEquality(this.state.initialResourceState), massageResourceForEquality(this.state.resource))
        const attendeesHaveChanged = !deepEqual(this.state.initialResourceState['meeting-attendees'], this.state.resource['meeting-attendees'])
        // this.state.nextLocation = [Object] (form is saving)
        if (!this.state.nextLocation && (this.state.formInputsHaveChanged !== formInputsHaveChanged || this.state.attendeesHaveChanged !== attendeesHaveChanged)) {
          this.setState({
            attendeesHaveChanged,
            formInputsHaveChanged
          })
        }
      }
    } else {
      if (this.state.resource !== prevState.resource && !this.state.nextLocation) {
        this.setState({
          formInputsHaveChanged: true
        })
      }
    }
  }

  redirect = () => {
    const { variables } = this.props.theme
    const meetingsUrl = `/${variables.SystemPages.account.path}/${variables.SystemPages.meeting.path}`
    if (this.state.nextLocation?.pathname && this.state.nextLocation.pathname !== meetingsUrl) {
      return this.props.history.push(this.state.nextLocation)
    }
    if (this.props.location.state && this.props.location.state.event) {
      this.props.history.push({
        pathname: meetingsUrl,
        state: {
          'calendar-events': this.props.location.state.event,
        },
      })
    } else {
      this.props.history.push({
        pathname: meetingsUrl,
        state: {
          date: this.state.meetingDate.format('DD/MM/YYYY'),
        },
      })
    }
  }

  getResources = () => {
    const calendar = CalendarStore.getResource()
    const locations = LocationStore.getResources() || []
    if (calendar && !this.state.times?.length) {
      const times = []
      for (let h = 0; h <= 23; h++) {
        for (let m = 0; m < 60; m += Number(calendar['slot-length']) / 60) {
          const hour = `0${h}`.slice(-2)
          const minutes = `0${m}`.slice(-2)
          times.push({
            value: `${hour}:${minutes}`,
            label: `${hour}:${minutes}`,
          })
        }
      }
      this.setState({
        times,
      })
      if (!this.props.isEdit) {
        const start = this.state.startTime?.split(':')
        const endTime = moment()
              .hour(start[0])
              .minute(start[1])
              .add(Number(calendar['slot-length']) / 60, 'minutes')
              .format('HH:mm')
        this.setState({
          endTime
        }, this.calculateDates)
      }
    }
    this.setState({
      events: EventStore.getResources(),
      calendar: calendar,
      locations: locations ? locations : [],
    }, () => {
      if (this.isEventEnabled) {
        if (this.state.events && this.state.calendar) {
          this.finishedLoading()
        }
      } else if (this.state.calendar) {
        this.finishedLoading()
      }
    })
  }

  calculateDates = () => {
    const { startTime, endTime, meetingDate, resource } = this.state
    if (!startTime || !endTime || !meetingDate) return
    resource['start-time'] = moment
      .utc(meetingDate)
      .hours(startTime.split(':')[0])
      .minutes(startTime.split(':')[1])
    resource['end-time'] = moment
      .utc(meetingDate)
      .hours(endTime.split(':')[0])
      .minutes(endTime.split(':')[1])

    this.setState({
        resource,
    }, this.searchLocations)
  }

  updateErrors = () => {
    this.setState({
      errors: MeetingStore.getErrors(),
    }, () => {
      if (this.refs.errors) {
        window.scrollTop = this.refs.errors.offsetTop - 130
      }
    })
  }

  renderErrors = () => {
    if (this.state.errors) {
      return (
        <div ref="errors" className="form__errors">
          {Object.keys(this.state.errors).map((key, i) => {
            const error = this.state.errors[key]
            return (
              <p className="form__error" key={i}>
                {' '}
                {error}
              </p>
            )
          })}
        </div>
      )
    }
  }

  searchLocations = () => {
    const { resource } = this.state
    let locationQuery = {
      fields: {
        'calendar-event-locations': 'name,nickname,meal,max-attendees,total-meals-bookable,meals-allocation-stats'
      },
      filter: {
        'available-between': `${resource['start-time'].format()}|${resource['end-time'].format()}`
      },
      page: { size: 200 }
    }

    if (resource['calendar-event']?.id) {
      locationQuery = Object.assign(locationQuery, {
        filter: {
          'calendar_event_id': resource['calendar-event'].id,
        }
      })
    }
    LocationActions.getResources(locationQuery)
  }

  newAttendees = () => {
    this.setState({
      modal: () => (
        <Modal ref="modal" closeEvent={this.unsetModal} customContent={true}>
          <NewAttendees
            resource={this.state.resource}
            closeEvent={this.unsetModal}
            assignAttendees={this.assignAttendees}
          />
        </Modal>
      ),
    })
  }

  registeredAttendees = () => {
    this.setState({
      modal: () => (
        <Modal ref="modal" closeEvent={this.unsetModal} customContent={true}>
          <RegisteredAttendees
            resource={this.state.resource}
            closeEvent={this.unsetModal}
            assignAttendees={this.assignAttendees}
            locations={this.state.locations}
            date={this.state.meetingDate}
            attendees={this.props.isEdit ? this.state.initialCount : 0}
          />
        </Modal>
      ),
    })
  }

  assignAttendees = (users) => {
    this.setState({
      resource: {
        ...this.state.resource,
        'meeting-attendees': users,
      },
    }, this.unsetModal)
  }

  removeUser = (index) => {
    this.setState({
      resource: {
        ...this.state.resource,
        'meeting-attendees': this.state.resource['meeting-attendees'].filter((u, j) => j !== index)
      }
    })
    this.unsetModal()
  }

  validateLocationRestrictions = () => {
    this.setState({
      locationIsInValid: LocationRestrictionsStore.getResources().length > 0,
    })
  }

  validateLocation = () => {
    if (!this.isEventEnabled || this.state.type !== 'event') {
      return false
    }

    const { resource } = this.state
    if ( resource['calendar-event-location'].id && resource['start-time'] && resource['end-time']) {
      LocationRestrictionsActions.getResources({
        filter: {
          'calendar-event-location-id': resource['calendar-event-location'].id,
          'restricted-for-user-id': resource.owner.id,
          'date-range': {
            start: resource['start-time'].toISOString(),
            end: resource['end-time'].toISOString(),
          },
        },
        fields: {
          'calendar-event-location-restrictions': 'id',
        },
      })
    }
  }

  validateMeeting = (lastLocation = {}) => {
    const { resource } = this.state
    const errors = {}
    let count = 0
    if (!resource.title.length) {
      errors.title = 'Please give your meeting a title'
      count++
    }
    if (!resource.owner.id) {
      errors.owner = 'Please choose a meeting host'
      count++
    }
    if (!resource['virtual'] && !resource.location.length) {
      errors.location = 'Please provide a location'
      count++
    }
    if (count > 0) {
      this.setState({
        errors,
      })
    } else {
      this.setState({
        errors: {},
        attendeesHaveChanged: false,
        formInputsHaveChanged: false,
        nextLocation: lastLocation,
      }, () => {
        const update = {
          'title': resource.title,
          'start-time': resource['start-time'],
          'end-time': resource['end-time'],
          'timezone': resource.timezone,
          'location': resource.location,
          'owner': resource.owner,
          /**
           * Why we default to 0, in comments here: https://rawnet.atlassian.net/browse/ONE-1834
           */
          'source-list-id': resource['source-list-id'] || 0,
          'description': resource.description,
          'critical': resource.critical,
          'virtual': resource.virtual,
          'virtual-bg-image': resource['virtual-bg-image'],
          'remove-virtual-bg-image': resource['remove-virtual-bg-image'],
          'chat-enabled': resource['chat-enabled'],
          'conference': resource['conference'],
        }
        let save = MeetingActions.createResource
        if (this.props.isEdit) {
          update['id'] = resource.id,
          save = MeetingActions.updateResource
        }
        const attendees = resource['meeting-attendees'].map(a => {
          const update = {...a}
          delete update['territory-names']
          return update
        });
        save(update, attendees)
      })

    }
  }

  validateEvent = (lastLocation = {}) => {
    const { resource, meetingDate, locationIsInValid } = this.state
    const event = this.state.events.find(e => e.id === resource['calendar-event'].id)
    const location = resource['calendar-event-location'].id
      ? this.state.locations.find(l => l.id === resource['calendar-event-location'].id)
      : null
    const errors = {}
    let count = 0

    if (locationIsInValid) {
      count++
    }

    if (!resource.title.length) {
      errors.title = 'Please give your meeting a title'
      count++
    }
    if (!resource.owner.id) {
      errors.owner = 'Please choose a meeting host'
      count++
    }
    if (!resource['calendar-event-location'].id) {
      errors.location = 'Please choose a location'
      count++
    }
    if (!resource['calendar-event'].id) {
      errors.event = 'Please choose an event'
      count++
    }
    if (
      meetingDate < moment.utc(event['start-time']).startOf('day') ||
      meetingDate > moment.utc(event['end-time']).endOf('day')
    ) {
      errors.date = 'Meeting must fall within event dates'
      count++
    }
    if (location && Number(location['max-attendees']) < resource['meeting-attendees'].length + 1) {
      errors.attendees = 'Too many attendees for meeting room'
      count++
    }
    if (resource['calendar-event-meal-slot']) {
      const meal = event['calendar-event-meal-slots'].find(m => m.id == resource['calendar-event-meal-slot'].id)
      const mealStart = moment.utc(meal['start-hour-and-minute'], 'HH:mm')
      const mealEnd = moment.utc(meal['end-hour-and-minute'], 'HH:mm')
      const meetingStart = moment.utc(this.state.startTime, 'HH:mm')
      const meetingEnd = moment.utc(this.state.endTime, 'HH:mm')
      let disabled = true
      if (
        (meetingStart < mealEnd && meetingStart >= mealStart) ||
        (meetingEnd > mealStart && meetingEnd <= mealEnd) ||
        (mealEnd <= meetingEnd && mealStart >= meetingStart)
      ) {
        disabled = false
      }
      if (disabled) {
        errors.meal = 'Meal slot must sit inside meeting times'
        count++
      }
    }
    if (count > 0) {
      this.setState({
        errors,
        isLoading: true,
      })
    } else {
      this.setState({
        errors: {},
        attendeesHaveChanged: false,
        formInputsHaveChanged: false,
        nextLocation: lastLocation,
      }, () => {
        const update = {
          'title': resource.title,
          'start-time': resource['start-time'],
          'end-time': resource['end-time'],
          'calendar-event': resource['calendar-event'],
          'calendar-event-location': resource['calendar-event-location'],
          'calendar-event-meal-slot': resource['calendar-event-meal-slot'],
          'owner': resource.owner,
          'source-list-id': resource['source-list-id'],
          'description': resource.description,
          'critical': resource.critical,
        }
        let save = MeetingActions.createResource
        if (this.props.isEdit) {
          update['id'] = resource.id,
          save = MeetingActions.updateResource
        }
        save(update, resource['meeting-attendees'].map(a => ({...a})))
      })
    }
  }

  checkPosition = () => {
    const container = this.refs.stickyContainer
    const elem = this.refs.stickyElement
    const height = elem.clientHeight
    const offset = container.offsetTop
    const top = typeof window.scrollY === 'undefined' ? window.pageYOffset : window.scrollY
    if (top + window.innerHeight < offset) {
      elem.classList.add('meeting__sticky-btns')
      elem.classList.add('sticky')
      elem.classList.add('sticky--bottom')
      elem.style['margin-bottom'] = '0'
      container.style['padding-top'] = height + 'px'
    } else {
      container.style['padding-top'] = '0'
      elem.style['margin-bottom'] = '6rem'
      elem.classList.remove('meeting__sticky-btns')
      elem.classList.remove('sticky')
      elem.classList.remove('sticky--bottom')
    }
  }

  render() {
    const { isEdit, theme, meetingsCV } = this.props
    const { resource, type, events, loaded, locations, meetingLocation } = this.state
    const event = resource['calendar-event']?.id && events
      ? events.find(e => e.id === resource['calendar-event'].id)
      : null
    let mealSlots = []
    if (event) {
      mealSlots = event['calendar-event-meal-slots'].map(s => {
        const mealStart = moment.utc(s['start-hour-and-minute'], 'HH:mm')
        const mealEnd = moment.utc(s['end-hour-and-minute'], 'HH:mm')
        const meetingStart = moment.utc(this.state.startTime, 'HH:mm')
        const meetingEnd = moment.utc(this.state.endTime, 'HH:mm')
        let disabled = true
        if (
          (meetingStart < mealEnd && meetingStart >= mealStart) ||
          (meetingEnd > mealStart && meetingEnd <= mealEnd) ||
          (mealEnd <= meetingEnd && mealStart >= meetingStart)
        ) {
          disabled = false
        }
        return {
          value: s.id,
          label: `${s['start-hour-and-minute']} - ${s['end-hour-and-minute']}`,
          disabled,
        }
      })
    }
    const filteredLocations = resource['calendar-event-meal-slot']?.id
      ? locations.filter(l => l.meal)
      : locations

    if (isEdit && meetingLocation && !filteredLocations.includes(meetingLocation)) {
      filteredLocations.push(meetingLocation)
    }
    const selectedLocation = resource['calendar-event-location'] &&
      filteredLocations.filter(i => i.id === resource['calendar-event-location'].id)[0]

    const pageTitle = isEdit ? `Edit ${resource.title}` : 'New Meeting'
    const finalBreadCrumb = isEdit ? {
      name: `Edit ${resource.title}`, url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}/${resource.id}/edit`
    } : {
      name: 'New Meeting', url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}/new`
    }

    let cancelState = {}
    if(this.props.location?.state?.event){
      cancelState = {'calendar-events': this.props.location.state.event}
    } else {
      cancelState = {date: this.state.meetingDate?.format('DD/MM/YYYY')}
    }


    const virtualBgImageSrc = this.state['virtual-bg-image']?.preview || this.state.resource['virtual-bg-image']?.admin_preview.url

    return (
      <PageLoader {...this.state}>
        <Meta {...this.props.meta}>
          <main className="meeting__form">
            <div className="fade-on-load">
              <LoadPageBannerImage slug={`meetings`} fallbackBannerImage={meetingsCV.bannerImage}>
                {({ image }) => (
                  <Banner
                    title={pageTitle}
                    classes={meetingsCV.bannerClasses}
                    image={image}
                  />
                )}
              </LoadPageBannerImage>
              <Breadcrumbs classes={meetingsCV.breadcrumbClasses} paths={[
                  { name: theme.variables.SystemPages.account.upper, url: `/${theme.variables.SystemPages.account.path}` },
                  { name: theme.variables.SystemPages.meeting.upper, url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}` },
                  finalBreadCrumb,
              ]} />
              <AccountNavigation currentPage={`/${theme.variables.SystemPages.meeting.path}`} />
              <div className={meetingsCV.wrapperClasses}>
                <div className="container">
                  <div className="panel-section">
                    <div className="panel-section__header">
                      <h2 className="panel-section__title">Summary</h2>
                      <div className="panel-section__action">
                        <SlideToggle identifier="critical" off="Critical"
                          checked={resource.critical}
                          onChange={e => {
                            this.setState({
                              resource: {
                                ...resource,
                                critical: e.target.checked,
                              },
                            })
                          }}
                        />
                      </div>
                    </div>
                    <div className="panel-section__panel">
                      <FormControl type="text"
                        label={meetingsCV.titleLabel}
                        placeholder="Add a meeting title"
                        modifiers={meetingsCV.titleInputClasses}
                        error={this.state.errors.title}
                        value={resource.title}
                        onChange={e => {
                          this.setState({
                            resource: {
                              ...resource,
                              title: e.target.value,
                            },
                          })
                        }}
                        required
                        error={this.state.errors.title}
                      />
                      {theme.features.users.meetings.events && (
                        <Tabs
                          active={type === 'event' ? 1 : 0}
                          onChange={e => {
                            this.setState({
                              type: e.value ? 'event' : 'meeting',
                            })
                          }}
                        >
                          <div title="Standard Meeting"></div>
                          <div title="Event Meeting"></div>
                        </Tabs>
                      )}
                      {type === 'event' && events && (
                        <div className="u-align-center" style={{ margin: '30px auto 0', maxWidth: 380 }}>
                          <FormControl label="Select an event" required error={this.state.errors.event} >
                            <CustomSelect
                              options={(events || []).map(e => ({
                                  value: e.id,
                                  label: `${e.title} ${moment
                                    .utc(e['start-time'])
                                    .format(theme.features.formats.shortDate)
                                  }-${moment
                                    .utc(e['end-time'])
                                    .format(theme.features.formats.shortDate)}`,
                                }))
                              }
                              simpleValue={true}
                              clearable={false}
                              value={resource['calendar-event']?.id || null}
                              onChange={({ target }) =>
                                this.setState({
                                  resource: {
                                    ...resource,
                                    'calendar-event': { id: target.value },
                                  },
                                }, this.searchLocations)
                              }
                            />
                          </FormControl>
                        </div>
                      )}
                    </div>
                  </div>

                  {theme.features.users.meetings.virtual && (
                    <div className="panel-section">
                      <div className="panel-section__header">
                        <h2 className="panel-section__title">
                          Virtual Meeting
                        </h2>
                      </div>
                      <div className="panel-section__panel">
                        <p>
                          Making your meeting virtual will give you a unique url to share with your attendees. You will be able to
                          share videos and pdf assets to your attendees in a live presentation.
                        </p>
                        <FormControl type="checkbox"
                          id='virtual'
                          checkboxLabel={'Make meeting virtual'}
                          onChange={({ target }) => {
                            this.setState({
                              resource: {
                                ...resource,
                                'virtual': target.checked,
                              },
                            })
                          }}
                          checked={resource['virtual']}
                        />
                        {resource['virtual'] && (
                          <>
                            <FormControl type="checkbox"
                              id="chat-disabled"
                              onChange={({target}) => {
                                this.setState({
                                  resource: {
                                    ...resource,
                                    'chat-enabled': !target.checked,
                                  },
                                })
                              }}
                              checkboxLabel={'Disable in-meeting chat'}
                              checked={!resource['chat-enabled']}
                            />
                            <FormControl type="checkbox"
                              id="conference"
                              onChange={({target}) => {
                                this.setState({
                                  resource: {
                                    ...resource,
                                    'conference': target.checked,
                                  },
                                })
                              }}
                              checkboxLabel={'Video conferencing enabled'}
                              checked={resource['conference']}
                            />
                            <FileUploader title={'Background Image'}
                              name={'virtual-bg-image'}
                              fileType={'Image'}
                              fileSrc={virtualBgImageSrc}
                              filePath={this.state['virtual-bg-image']?.path}
                              onRemoveFile={() => {
                                this.setState({
                                  resource: {
                                    ...resource,
                                    'virtual-bg-image': null,
                                    'remove-virtual-bg-image': true
                                  },
                                  'virtual-bg-image': {}
                                })
                              }}
                              onChange={(targetName, baseStr, file) => {
                                this.setState({
                                  [targetName]: {
                                    preview: baseStr,
                                    file: file,
                                    path: file.name
                                  },
                                  resource: {
                                    ...resource,
                                    [targetName]: baseStr
                                  }
                                })
                              }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="panel-section">
                    <div className="panel-section__header">
                      <h2 className="panel-section__title">
                        Time &amp; Location
                      </h2>
                    </div>

                    <div className="panel-section__panel">
                      <div className="form__group">
                        <FormControl label="Assign a date" required error={this.state.errors?.date}>
                          <DatePicker minDate={ event && type === 'event'
                              ? moment.utc(event['start-time'])
                              : moment.utc()
                            }
                            maxDate={event && type === 'event'
                              ? moment.utc(event['end-time'])
                              : null
                            }
                            selected={this.state.meetingDate}
                            dateFormat={theme.features.formats.longDate}
                            onChange={v => this.setState({
                                meetingDate: moment.utc(v),
                              }, () => {
                                this.calculateDates()
                                if (meetingsCV.shouldValidateLocation) {
                                  this.validateLocation()
                                }
                              })
                            }
                          />
                        </FormControl>
                        <FormControl label="Start Time" required>
                          <CustomSelect required
                            simpleValue={true}
                            clearable={false}
                            options={this.state.times}
                            value={this.state.startTime}
                            searchable={false}
                            onChange={({ target }) => {
                              const v = target.value
                              if (v >= this.state.endTime) {
                                const endTime = moment
                                  .utc(this.state.meetingDate)
                                  .hours(v.split(':')[0])
                                  .minutes(v.split(':')[1])
                                  .add(this.state.calendar['slot-length'] / 60, 'm')
                                  .format('HH:mm')
                                this.setState({
                                  startTime: v,
                                  endTime: endTime,
                                }, () => {
                                  this.calculateDates()
                                  if (meetingsCV.shouldValidateLocation) {
                                    this.validateLocation()
                                  }
                                })
                              } else {
                                this.setState({
                                  startTime: v,
                                }, () => {
                                  this.calculateDates()
                                  if (meetingsCV.shouldValidateLocation) {
                                    this.validateLocation()
                                  }
                                })
                              }
                            }}
                          />
                        </FormControl>

                        <FormControl label="End Time" required>
                          <CustomSelect required clearable={false}
                            options={this.state.times}
                            value={this.state.endTime}
                            searchable={false}
                            simpleValue={true}
                            onChange={({ target }) => {
                              const v = target.value
                              if (v <= this.state.startTime) {
                                const startTime = moment
                                  .utc(this.state.meetingDate)
                                  .hours(v.split(':')[0])
                                  .minutes(v.split(':')[1])
                                  .subtract(this.state.calendar['slot-length'] / 60, 'm')
                                  .format('HH:mm')
                                this.setState({
                                  endTime: v,
                                  startTime: startTime,
                                }, () => {
                                  this.calculateDates()
                                  if (meetingsCV.shouldValidateLocation) {
                                    this.validateLocation()
                                  }
                                })
                              } else {
                                this.setState({
                                  endTime: v,
                                }, () => {
                                  this.calculateDates()
                                  if (meetingsCV.shouldValidateLocation) {
                                    this.validateLocation()
                                  }
                                })
                              }
                            }}
                          />
                        </FormControl>
                        {type === 'meeting' ? (
                          <FormControl label="Timezone">
                            <CustomSelect
                              options={zones} simpleValue={true} clearable={false}
                              value={resource.timezone}
                              onChange={({ target }) => {
                                this.setState({
                                  resource: {
                                    ...resource,
                                    timezone: target.value,
                                  },
                                })
                              }}
                            />
                          </FormControl>
                        ) : (
                          <div>
                            {event && (
                              <FormControl label="Timezone" type="text" value={event.timezone} readOnly />
                            )}
                          </div>
                        )}
                      </div>
                      {type === 'event' ? (
                        <div className="form__group">
                          <FormControl label="Meal Slot" error={this.state.errors.meal}>
                            <CustomSelect
                              options={mealSlots} simpleValue={true}
                              value={ resource['calendar-event-meal-slot']
                                ? resource['calendar-event-meal-slot'].id
                                : null
                              }
                              onChange={({ target }) =>
                                this.setState({
                                  resource: {
                                    ...resource,
                                    'calendar-event-meal-slot': {
                                      id: target.value,
                                    },
                                  },
                                })
                              }
                            />
                          </FormControl>
                          <FormControl label="Location" required error={this.state.errors.location}>
                            <CustomSelect simpleValue={true}  clearable={false}
                              options={filteredLocations.map(l => ({
                                value: l.id,
                                label: `${l.name} ${
                                  l.nickname ? ': ' + l.nickname : ''
                                } ${l.name !== theme.features.users.meetings.defaultLunchName
                                  ? '(' + l['max-attendees'] + ')'
                                  : ''
                                } ${l.meal ? '(Meal)' : ''}`,
                              }))}
                              value={resource['calendar-event-location']?.id || null}
                              onChange={({ target }) =>
                                this.setState({
                                  resource: {
                                    ...resource,
                                    'calendar-event-location': {
                                      id: target.value,
                                    },
                                  },
                                }, () => {
                                  if (meetingsCV.shouldValidateLocation) {
                                    this.validateLocation()
                                  }
                                })
                              }
                            />
                          </FormControl>
                        </div>
                      ) : (
                        <>
                          {!resource['virtual'] && (
                            <FormControl type="text" label="Location" required
                              value={resource.location}
                              error={this.state.errors.location}
                              onChange={e =>
                                this.setState({
                                  resource: {
                                    ...resource,
                                    location: e.target.value,
                                  },
                                }, () => {
                                  if (meetingsCV.shouldValidateLocation) {
                                    this.validateLocation()
                                  }
                                })
                              }
                            />
                          )}
                        </>
                      )}
                      {this.state.locationIsInValid &&
                        meetingsCV.shouldValidateLocation && (
                          <p className="form__error">
                            This location is restricted during these times.
                            Please contact your event manager.
                          </p>
                        )}
                    </div>
                  </div>
                  {selectedLocation?.meal &&
                  ((resource['calendar-event-meal-slot'] &&
                    !resource['calendar-event-meal-slot'].id) ||
                    !resource['calendar-event-meal-slot']) ? (
                    <div></div>
                  ) : (
                    <div className="panel-section">
                      <div className="panel-section__header">
                        <h2 className="panel-section__title">Attendees</h2>
                        <div className="panel-section__action">
                          <button
                            className={meetingsCV.unregisteredButtonClasses}
                            onClick={this.newAttendees}
                          >
                            Manage unregistered attendees
                          </button>
                          <button
                            className={meetingsCV.registeredButtonClasses}
                            onClick={this.registeredAttendees}
                          >
                            Manage registered attendees
                          </button>
                        </div>
                      </div>
                      <div className="panel-section__panel" style={{position: 'relative'}}>
                        {(isAdmin(this.props.user) || hasPermission(this.props.user, 'manage_meetings')) && (
                          <FormControl label="Meeting host" required error={this.state.errors.owner} style={{maxWidth: '400px'}} >
                            <AsyncSearchUser
                              urlContext={'meeting-owner'}
                              clearable={false}
                              value={resource.owner?.id ? resource.owner : null}
                              onChange={(user) => {
                                this.setState({
                                  resource: {
                                    ...resource,
                                    owner: user,
                                    list: null,
                                  },
                                }, () => {
                                  this.props.setAssociatedList(null)
                                  if (meetingsCV.shouldValidateLocation) {
                                    this.validateLocation()
                                  }
                                })
                              }}
                            />
                          </FormControl>
                        )}
                        {this.state.attendeesHaveChanged && (
                          <span className="meeting__attendee-warning">Changes to attendees will not be updated until the meeting has been saved.</span>
                        )}
                        <div
                          className={`form__control ${isAdmin(this.props.user) || hasPermission('manage_meetings')
                            ? 'form__control--bordered'
                            : ''
                          }`}
                        >
                          {this.state.errors.attendees && (
                            <p className="form__error">{this.state.errors.attendees}</p>
                          )}
                          {resource['meeting-attendees']?.length < 1 ? (
                            <p>You currently have no meeting attendees</p>
                          ) : (
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Company</th>
                                  <th>Role</th>
                                  <th>Email</th>
                                  <th>Status</th>
                                  <th className="u-align-center">VIP</th>
                                  {theme.features.users.meetings.virtual && resource['virtual'] && <th className="u-align-center">Send Invite</th>}
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {resource['meeting-attendees'].map((u, i) => (
                                  <tr key={i}>
                                    <td>{u['first-name']} {u['last-name']}</td>
                                    <td>{u.company?.name || u.company}</td>
                                    <td>{u['job-title']}</td>
                                    <td>{u.email}</td>
                                    <td>
                                      <span className={`tag tag--count tag--${u.status ? u.status : u['user-type']}`}>
                                        {u.status ? u.status : u['user-type']}
                                      </span>
                                    </td>
                                    <td className="u-align-center">
                                      <Checkbox id={`attendees-${i}`} labeless={true} checked={u.vip} onChange={e => {
                                          resource['meeting-attendees'][i].vip = e.target.checked
                                          this.setState({
                                            resource,
                                          })
                                        }}
                                      />
                                    </td>
                                    {theme.features.users.meetings.virtual && resource['virtual'] && (
                                      <td className="u-align-center">
                                        <Checkbox id={`send-virtual-meeeting-email-${i}`} labeless={true} checked={u['send-virtual-meeting-email']} onChange={e => {
                                            resource['meeting-attendees'][i]['send-virtual-meeting-email'] = e.target.checked
                                            this.setState({
                                              resource,
                                            })
                                          }}
                                        />
                                      </td>
                                    )}
                                    <td style={{ textAlign: 'right' }}>
                                      <button
                                        className="delete"
                                        onClick={() => this.removeUser(i)}
                                      >
                                        <Icon id="i-close" classes="delete__icon" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {this.state.resource.owner?.id && (
                    <div className="panel-section">
                      <div className="panel-section__header">
                        <h2 className="panel-section__title">
                          {theme.localisation.list.upper}
                        </h2>
                      </div>
                      <div className="panel-section__panel">
                        <FormControl
                          label={`Associate a ${theme.localisation.list.lower}`}
                        >
                          <AsyncSearchResource
                            resourceType={'lists'}
                            query={{
                              fields: ['name', 'user'],
                              include: 'user',
                              includeFields: {
                                users: ['first-name', 'last-name']
                              }
                            }}
                            filter={{
                              'for_meeting_user_id': resource.owner.id
                            }}
                            mapResults={(list) => ({
                              value: list.id,
                              label: `${list.name} (${list.user['first-name']} ${list.user['last-name']})`,
                              list
                            })}
                            value={this.props.associatedList}
                            onChange={(list) => {
                              this.props.setAssociatedList(list)
                              this.setState({
                                resource: {
                                  ...resource,
                                  'source-list-id': list.value,
                                },
                              })
                            }}
                            placeholder="Search..."
                          />
                        </FormControl>
                      </div>
                    </div>
                  )}

                  <div className="panel-section">
                    <div className="panel-section__header">
                      <h2 className="panel-section__title">Description</h2>
                    </div>
                    <div className="panel-section__panel">
                      <FormControl
                        type="textarea"
                        label="Meeting Description"
                        modifiers={['full-width']}
                        value={resource.description}
                        onChange={e =>
                          this.setState({
                            resource: {
                              ...resource,
                              description: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  {this.renderErrors()}
                </div>
                <RouteLeavingGuard
                  when={this.state.attendeesHaveChanged || this.state.formInputsHaveChanged}
                  renderModal={({
                    stay,
                    leave,
                  }) => (
                    <Modal
                      title={'Unsaved Changes'}
                      closeEvent={ stay() }
                      titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}
                    >
                      <div className="modal__content">
                        {this.state.attendeesHaveChanged && (
                          <div>
                            Invites, if selected to be sent, will not be delivered until the meeting has been saved.
                          </div>
                        )}
                        <div style={{paddingBottom: '20px'}}>
                          What would you like to do?
                        </div>
                        <div className="grid">
                          <button type="button" className="button " onClick={stay()} >
                            Cancel
                          </button>
                          <button type="button" className="button button--filled" onClick={leave(type === 'meeting' ? this.validateMeeting : this.validateEvent)} >
                            Save Meeting
                          </button>
                          <button type="button" className="button button--filled" onClick={leave()} >
                            Leave Anyway
                          </button>
                        </div>
                      </div>
                    </Modal>
                  )}
                />

                <div ref="stickyContainer" className="sticky-container">
                  <div className={meetingsCV.actionsClasses} ref="stickyElement" >
                    <div className="container">
                      <div className="actions__inner">
                        <NavLink className={meetingsCV.cancelButtonClasses} to={{
                            pathname: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}`,
                            state: cancelState
                          }}>
                          Cancel
                        </NavLink>
                        <button
                        className={`${meetingsCV.createButtonClasses} ${this.state.isLoading && 'button--loading'}`}
                        onClick={type === 'meeting' ? this.validateMeeting : this.validateEvent}
                      >
                          {isEdit ? 'Save Meeting' : 'Create Meeting'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            {this.state.modal()}
            <SmallScreenMessage page="Meeting Manager"/>
          </main>
        </Meta>
      </PageLoader>
    )
  }
}

const enhance = compose(
  withUser,
  withTheme,
  withRouter,
  withClientVariables('meetingsCV', allClientVariables),
  withHooks((props) => {
    const [associatedList, setAssociatedList] = useState(null)
    const sourceListId = props.meetingResource?.resource?.['source-list-id']
    useEffect(() => {
      if (sourceListId && sourceListId !== '0' && !associatedList) {
        findOneByModel('list', sourceListId, {
          fields: ['name', 'user'],
          include: 'user',
          includeFields: {
            users: ['first-name', 'last-name']
          }
        }).then((list) => {
          setAssociatedList({
            value: list.id,
            label: `${list.name} (${list.user['first-name']} ${list.user['last-name']})`,
            list
          })
        })
      }
    }, [sourceListId])

    return {
      associatedList,
      setAssociatedList
    }
  })
)

export default enhance(MeetingForm)
