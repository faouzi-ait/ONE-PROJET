import React from 'react'
import moment from 'moment'

import zones from 'javascript/views/events/zones.json'

// Actions
import Actions from 'javascript/actions/events'
import CalendarActions from 'javascript/actions/calendar'
import UserActions from 'javascript/actions/users'

// Stores
import Store from 'javascript/stores/events'
import CalendarStore from 'javascript/stores/calendar'
import UserStore from 'javascript/stores/users'

// Components
import Banner from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import CustomSelect from 'javascript/components/custom-select'
import DatePicker from 'javascript/components/datepicker'
import DeleteLocation from 'javascript/views/events/delete-location'
import DeleteMeal from 'javascript/views/events/delete-meal'
import FormControl from 'javascript/components/form-control'
import Icon from 'javascript/components/icon'
import Locations from 'javascript/views/events/locations'
import { NavLink } from 'react-router-dom'
import MealSlots from 'javascript/views/events/meal-slots'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import Select from 'react-select'
import SlideToggle from 'javascript/components/slide-toggle'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'

import allClientVariables from './variables'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

const times = []
for (let h = 0; h <= 23; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hour = `0${h}`.slice(-2)
    const minutes = `0${m}`.slice(-2)
    times.push({
      value: `${hour}:${minutes}`,
      label: `${hour}:${minutes}`
    })
  }
}

class EventsNew extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      modal: () => { },
      errors: {},
      users: [],
      resource: {
        active: false,
        title: '',
        calendar: { id: 1 },
        contact: {},
        'start-time': moment.utc().startOf('day'),
        'end-time': moment.utc().endOf('day'),
        'timezone': 'Etc/Greenwich',
        'calendar-event-opening-times': [{
          'date': moment.utc().format('DD/MM/YYYY'),
          'start-time': moment.utc().hour(9).minute(0).format('HH:mm'),
          'end-time': moment.utc().hour(17).minute(0).format('HH:mm')
        }],
        'calendar-event-locations': [],
        'calendar-event-meal-slots': []
      },
      defaultLunchLocation: this.props.theme.features.users.meetings.defaultLunchLocation
    }
  }
  componentWillMount() {
    Store.on('change', this.redirect)
    UserStore.on('change', this.getResources)
    CalendarStore.on('change', this.getResources)
  }
  componentDidMount() {
    window.addEventListener('scroll', this.checkPosition, { passive: true })
    UserActions.getResources({
      'filter[user_type]': 'internal',
      fields: {
        users: 'first-name,last-name'
      },
      page: { size: 200 }
    })

    CalendarActions.getFirstResource({
      fields: {
        calendars: 'slot-length'
      }
    })

    if (this.state.defaultLunchLocation) {
      const locations = [{
        'name': this.props.theme.features.users.meetings.defaultLunchName,
        'nickname': '',
        'max-attendees': 1000,
        'meal': true,
        'total-meals-bookable': 0,
        'max-meals-available': 0,
        'multi-meetings': true
      }]
      this.setState({
        resource: {
          ...this.state.resource,
          'calendar-event-locations': locations
        }
      })
    }
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.checkPosition, { passive: true })
    Store.removeListener('change', this.redirect)
    CalendarStore.removeListener('change', this.getResources)
    UserStore.removeListener('change', this.getResources)
  }
  getResources = () => {
    this.setState({
      users: UserStore.getResources(),
      calendar: CalendarStore.getResource()
    }, this.finishedLoading)
  }
  redirect = () => {
    const { variables } = this.props.theme
    this.props.history.push(`/${variables.SystemPages.account.path}/${variables.SystemPages.events.path}`)
  }
  checkPosition = () => {
    const container = this.refs.stickyContainer
    const elem = this.refs.stickyElement
    const height = elem?.clientHeight
    const offset = container?.offsetTop
    const top = typeof window.scrollY === "undefined" ? window.pageYOffset : window.scrollY
    if (top > offset) {
      elem.classList.add('sticky')
      container.style['padding-top'] = height + 'px'
    } else {
      container.style['padding-top'] = '0'
      elem.classList.remove('sticky')
    }
  }
  changeDate = type => v => {
    this.setState({
      resource: {
        ...this.state.resource,
        [`${type}-time`]: type === 'end' ? v.endOf('day') : v.startOf('day')
      }
    }, this.calculateDays)
  }
  calculateDays = () => {
    const { resource } = this.state
    const days = resource['end-time'].diff(resource['start-time'], 'days') + 1
    const currentTimes = resource['calendar-event-opening-times']
    const newDays = []
    const currentDay = resource['start-time'].clone().subtract(1, 'days')
    for (let i = 0; i < days; i++) {
      currentDay.add(1, 'days')
      const time = currentTimes.find(t => t.date === currentDay.format('DD/MM/YYYY'))
      if (time) {
        newDays.push(time)
      } else {
        newDays.push({
          date: currentDay.format('DD/MM/YYYY'),
          'start-time': currentDay.hour(9).minute(0).format('HH:mm'),
          'end-time': currentDay.hour(17).minute(0).format('HH:mm')
        })
      }
    }
    this.setState({
      resource: {
        ...resource,
        'calendar-event-opening-times': newDays
      }
    })
  }
  editLocations = () => {
    this.setState({
      modal: () => (
        <Modal ref="modal" closeEvent={this.unsetModal} customContent={true}>
          <Locations resource={this.state.resource} closeEvent={this.unsetModal} assignLocations={this.assignLocations} />
        </Modal>
      )
    })
  }
  editMealSlots = () => {
    this.setState({
      modal: () => (
        <Modal ref="modal" closeEvent={this.unsetModal} customContent={true}>
          <MealSlots resource={this.state.resource} closeEvent={this.unsetModal} assignMealSlots={this.assignMealSlots} />
        </Modal>
      )
    })
  }
  assignMealSlots = (slots) => () => {
    this.setState({
      resource: {
        ...this.state.resource,
        'calendar-event-meal-slots': slots
      }
    }, this.unsetModal)
  }
  assignLocations = (locations) => () => {
    this.setState({
      resource: {
        ...this.state.resource,
        'calendar-event-locations': locations
      }
    }, this.unsetModal)
  }
  validate = () => {
    const errors = {}
    let count = 0
    if (!this.state.resource.title.length) {
      errors.title = "Please give your event a title"
      count++
    }
    if (this.state.resource['calendar-event-locations'].length < 1) {
      errors.locations = "Please add at least one location to your event"
      count++
    }
    if (!this.state.resource.contact.id) {
      errors.contact = "Please select an event contact"
      count++
    }
    if (count < 1) {
      this.setState({
        errors: {}
      }, this.submit)
    } else {
      this.setState({
        errors
      })
    }
  }
  removeLocation = (index) => {
    this.setState({
      resource: {
        ...this.state.resource,
        'calendar-event-locations': this.state.resource['calendar-event-locations'].filter((l, j) => j !== index)
      }
    })
    this.unsetModal()
  }
  removeMeal = (index) => {
    this.setState({
      resource: {
        ...this.state.resource,
        'calendar-event-meal-slots': this.state.resource['calendar-event-meal-slots'].filter((l, j) => j !== index)
      }
    })
    this.unsetModal()
  }
  confirmDeletion = (resource, type, index) => () => {
    if (type === 'location') {
      this.setState({
        modal: () => (
          <Modal closeEvent={this.unsetModal} title="Warning" modifiers={['warning']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} ref="modal">
            <div className="modal__content">
              <DeleteLocation resource={resource} closeEvent={this.unsetModal} complete={this.removeLocation} index={index} />
            </div>
          </Modal>
        )
      })
    } else if (type === 'meal') {
      this.setState({
        modal: () => (
          <Modal closeEvent={this.unsetModal} title="Warning" modifiers={['warning']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} ref="modal">
            <div className="modal__content">
              <DeleteMeal resource={resource} closeEvent={this.unsetModal} complete={this.removeMeal} index={index} />
            </div>
          </Modal>
        )
      })
    }
  }
  submit = () => {
    Actions.createResource(this.state.resource)
  }
  render() {
    const {theme} = this.props
    const { resource } = this.state
    return (
      <PageLoader {...this.state}>
        <Meta
          title={`${theme.localisation.client} :: New Event`}
          meta={{
            description: 'Set up a new event'
          }}>
          <main>
            <div className="fade-on-load">
              <LoadPageBannerImage slug={`events`} fallbackBannerImage={this.props.indexVariablesCV.bannerImage}>
                {({ image }) => (
                  <Banner classes={['intro']} title="New Event" image={image} />
                )}
              </LoadPageBannerImage>
              <Breadcrumbs classes={['bordered']} paths={[
                { name: theme.variables.SystemPages.account.upper, url: `/${theme.variables.SystemPages.account.path}` },
                { name: 'Events', url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.events.path}` },
                { name: 'New Event', url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.events.path}/new` }
              ]} />
              <AccountNavigation currentPage={`/${theme.variables.SystemPages.events.path}`} />
              <div ref="stickyContainer" className="sticky-container">
                <div className="actions actions--center" ref="stickyElement">
                  <div className="container">
                    <div className="actions__inner">
                      <NavLink className="button" to={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.events.path}`}>Cancel</NavLink>
                      <button className="button button--filled" onClick={this.validate}>Create Event</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={this.props.indexVariablesCV.sectionClasses}>
              <div className="container">

                <div className="panel-section">
                  <div className="panel-section__header">
                    <h2 className="panel-section__title">Summary</h2>
                    <div className="panel-section__action">
                      <SlideToggle identifier="active" off="Active" onChange={e => {
                        this.setState({
                          resource: {
                            ...resource,
                            active: e.target.checked
                          }
                        })
                      }} checked={resource.active} />
                    </div>
                  </div>
                  <div className="panel-section__panel">
                    <FormControl type="text" placeholder="Add an event title" modifiers={['large']} value={resource.title} onChange={e => {
                      this.setState({
                        resource: {
                          ...resource,
                          title: e.target.value
                        }
                      })
                    }} required error={this.state.errors.title} />
                    <div className="form__group">
                      <FormControl label="Start Date">
                        <DatePicker selected={resource['start-time']} dateFormat={theme.features.formats.longDate} onChange={this.changeDate('start')} />
                      </FormControl>
                      <FormControl label="End Date">
                        <DatePicker selected={resource['end-time']} dateFormat={theme.features.formats.longDate} onChange={this.changeDate('end')} minDate={resource['start-time']} />
                      </FormControl>
                      <FormControl label="Timezone">
                        <CustomSelect options={zones} value={resource.timezone} onChange={({ target }) => {
                          this.setState({
                            resource: {
                              ...resource,
                              timezone: target.value
                            }
                          })
                        }} simpleValue={true} clearable={false} />
                      </FormControl>
                    </div>
                    <div style={{ maxWidth: 520 }}>
                      <FormControl label="Event Contact" error={this.state.errors.contact}>
                        <CustomSelect options={this.state.users && this.state.users.map(u => ({
                          value: u.id,
                          label: `${u['first-name']} ${u['last-name']}`
                        }))} value={resource.contact.id} onChange={({ target }) => {
                          this.setState({
                            resource: {
                              ...resource,
                              contact: { id: target.value }
                            }
                          })
                        }} simpleValue={true} clearable={false} required />
                      </FormControl>
                    </div>
                  </div>
                </div>

                <div className="panel-section">
                  <div className="panel-section__header">
                    <h2 className="panel-section__title">Status</h2>
                  </div>
                  <div className="panel-section__panel">
                    <div className="form__group">
                      <div className="form__control">
                        <SlideToggle identifier="active" on="Active" onChange={e => {
                          this.setState({
                            resource: {
                              ...resource,
                              active: e.target.checked
                            }
                          })
                        }} checked={resource.active}
                        hint="If an event is active it means users can see the event in the drop down in the meetings section. If it is inactive, it will not appear for users to see or add meetings to, e.g. they will not be able to view any meetings associated to that event. An event should only be made inactive if it is no longer needed by any users." />
                      </div>
                    </div>

                    <div className="form__group">
                      <div className="form__control">
                        <SlideToggle identifier="closed" on="Closed" onChange={e => {
                          this.setState({
                            resource: {
                              ...resource,
                              closed: e.target.checked
                            }
                          })
                        }} checked={resource.closed}
                        hint="If an event is closed, users will not be able to add meetings. They will be able to view all meetings (but not edit) associated to the event in the meetings section. An event can be closed if you wish to prevent people adding more meetings/making further changes. It can be opened or closed at any time." />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel-section">
                  <div className="panel-section__header">
                    <h2 className="panel-section__title">Locations</h2>
                    <div className="panel-section__action">
                      <button className="button button--filled" onClick={this.editLocations}>Manage Locations</button>
                    </div>
                  </div>
                  <div className="panel-section__panel">
                    {(resource['calendar-event-locations'].length < 1) ? (
                      <p>You currently have no locations</p>
                    ) : (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Location Name</th>
                              <th>Location Nickname</th>
                              <th className="u-align-center">Attendees</th>
                              <th className="u-align-center">Meal</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {resource['calendar-event-locations'].map((l, i) => (
                              <tr key={i}>
                                <td>{l.name}</td>
                                <td>{l.nickname}</td>
                                <td className="u-align-center">{l['max-attendees']}</td>
                                <td className="u-align-center">{l.meal ? 'Yes' : 'No'}</td>
                                {!!theme.features.users.meetings.defaultLunchLocation && l.name !== theme.features.users.meetings.defaultLunchName &&
                                  <td style={{ textAlign: 'right' }}>
                                    <button className="delete" onClick={this.confirmDeletion(l, 'location', i)}>
                                    <Icon id="i-close" classes="delete__icon" /></button>
                                  </td>
                                }
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    {this.state.errors.locations &&
                      <p className="form__error">{this.state.errors.locations}</p>
                    }
                  </div>
                </div>

                <div className="panel-section">
                  <div className="panel-section__header">
                    <h2 className="panel-section__title">Stand Opening</h2>
                  </div>
                  <div className="panel-section__panel">
                    {resource['calendar-event-opening-times'].map((s, i) => (
                      <div className="form__group" key={i}>
                        <h3 style={{ margin: '43px 20px 0 0' }}>Day {i + 1}</h3>
                        <FormControl label="Start Time">
                          <CustomSelect value={s['start-time']} options={times} onChange={({ target }) => {
                            resource['calendar-event-opening-times'][i]['start-time'] = target.value
                            this.setState({
                              resource
                            })
                          }} simpleValue={true} clearable={false} />
                        </FormControl>
                        <FormControl label="End Time">
                          <CustomSelect value={s['end-time']} options={times} onChange={({ target }) => {
                            resource['calendar-event-opening-times'][i]['end-time'] = target.value
                            this.setState({
                              resource
                            })
                          }} simpleValue={true} clearable={false} />
                        </FormControl>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel-section">
                  <div className="panel-section__header">
                    <h2 className="panel-section__title">Meal Slots</h2>
                    <div className="panel-section__action">
                      <button className="button button--filled" onClick={this.editMealSlots}>Manage Meal Slots</button>
                    </div>
                  </div>
                  <div className="panel-section__panel">
                    {(resource['calendar-event-meal-slots'].length < 1) ? (
                      <p>You currently have no meal slots</p>
                    ) : (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Slot</th>
                              <th>Start Time</th>
                              <th colSpan="2">End Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resource['calendar-event-meal-slots'].map((s, i) => (
                              <tr key={i}>
                                <td>Meal Slot {i + 1}</td>
                                <td>{s['start-hour-and-minute']}</td>
                                <td>{s['end-hour-and-minute']}</td>
                                <td style={{ textAlign: 'right' }}>
                                  <button className="delete" onClick={this.confirmDeletion(s, 'meal', i)}>
                                  <Icon id="i-close" classes="delete__icon" /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                  </div>
                </div>

                {this.state.defaultLunchLocation && resource['calendar-event-locations'][0] &&
                  <div className="panel-section">
                    <div className="panel-section__header">
                      <h2 className="panel-section__title">Meal Slot capacity</h2>
                    </div>
                    <div className="panel-section__panel">
                      <div className="form__group">
                        <FormControl label="Total meals bookable" type="number" value={resource['calendar-event-locations'][0]['total-meals-bookable']} onChange={e => {
                          const locations = resource['calendar-event-locations']
                          locations[0]['total-meals-bookable'] = e.target.value
                          this.setState({
                            resource: {
                              ...resource,
                              'calendar-event-locations': locations
                            }
                          })
                        }} required error={this.state.errors.totalMealsBookable} />
                        <FormControl label="Total meals available" type="number" value={resource['calendar-event-locations'][0]['max-meals-available']} onChange={e => {
                          const locations = resource['calendar-event-locations']
                          locations[0]['max-meals-available'] = e.target.value
                          this.setState({
                            resource: {
                              ...resource,
                              'calendar-event-locations': locations
                            }
                          })
                        }} required error={this.state.errors.maxMealsAvailable} />
                      </div>
                    </div>
                  </div>
                }
              </div>
              </div>
            </div>
            {this.state.modal()}
          </main>
        </Meta>
      </PageLoader>
    )
  }
}

const enhance = compose(
  withClientVariables('indexVariablesCV', allClientVariables),
)

export default enhance(EventsNew)