import React from 'react'
import moment from 'moment'
import { Features } from 'javascript/config/features'
import uuid from 'uuid/v1'

import UserService from 'javascript/services/users'
import LocationRestrictionsStore from 'javascript/stores/calendar-event-location-restrictions'

import LocationRestrictionsActions from 'javascript/actions/calendar-event-location-restrictions'

import Select from 'react-select'
import DatePicker from 'javascript/components/datepicker'
import Icon from 'javascript/components/icon'
import FormControl from 'javascript/components/form-control'

 export default class extends React.Component {
  state = {
    restrictions: [],
    errors: []
  }

  componentWillMount(){
    LocationRestrictionsStore.on('change', this.setRestrictionsToState)
  }

  componentWillUnmount(){
    LocationRestrictionsStore.removeListener('change', this.setRestrictionsToState)
  }

  componentDidMount(){
    const {eventLocation} = this.props
    LocationRestrictionsStore.unsetResources()
    LocationRestrictionsActions.getResources({
      include: 'users',
      filter: {
        'calendar-event-location-id': eventLocation.id
      },
      fields: {
        'calendar-event-location-restrictions': 'users,start-time,end-time,start-date,end-date',
        'users': 'full-name'
      }
    })
  }

  setRestrictionsToState = () => {
    this.setState({
      restrictions: LocationRestrictionsStore.getResources()
    })
  }

  changeDate = (v, type, key) => {
    const {restrictions} = this.state
    if (type === 'start' && restrictions[key]['end-date'] && moment(restrictions[key]['end-date']).isBefore(v)) {
      restrictions[key][`end-date`] = v.startOf('day').toString()
    } else if (type === 'end' && restrictions[key]['start-date'] && moment(restrictions[key]['start-date']).isAfter(v)) {
      restrictions[key][`start-date`] = v.endOf('day').toString()
    }
    restrictions[key][`${type}-date`] = type === 'end' ? v.endOf('day').toString() : v.startOf('day').toString()
    this.setState({
      restrictions
    })
  }

  removeRestriction = (restriction) => {
    if(!restriction.unSaved){
      return LocationRestrictionsActions.deleteResource(restriction)
    }

    const {restrictions} = this.state
    const update = restrictions.filter(update => {
      return !(update.unSaved && update.id === restriction.id)
    })
    this.setState({
      restrictions: update
    })
  }

  restrictLocations = () => {
    const {restrictions} = this.state
    const {eventLocation} = this.props

    restrictions.map(restriction => {
      const {links, type, id, ...attributes} = restriction

      if(!restriction.unSaved){
        return LocationRestrictionsActions.updateResource({
          id,
          ...attributes
        })
      }
      LocationRestrictionsActions.createResource({
        ...attributes,
        'calendar-event-location': {
          id: eventLocation.id
        }
      })
    })
    this.props.closeEvent()
  }

  validate = () => {
    const {restrictions} = this.state
    const errors = {}
    let count = 0

    restrictions.forEach((restriction,i) => {
      errors[i] = {}
      if (restriction['start-date'] === '') {
        errors[i]['start-date'] = 'Please provide a start date'
        count ++
      }
      if (restriction['end-date'] === '') {
        errors[i]['end-date'] = 'Please provide an end date'
        count ++
      }
      if (restriction['start-time'] === '') {
        errors[i]['start-time'] = 'Please provide a start time'
        count ++
      }
      if (restriction['end-time'] === '') {
        errors[i]['end-time'] = 'Please provide an end time'
        count ++
      }
    })

    if (count < 1) {
      this.setState({
        errors: []
      }, this.restrictLocations)
    } else {
      this.setState({
        errors
      })
    }
  }

  searchUsers = (input, callback) => {
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      UserService.search({
        filter: {
          'search': input,
          'user-type': 'internal'
        },
        fields: {
          'users': 'full-name'
        }
      }, (users) => {
        callback(null, {
          options: users
        })
      })
    }, 300)
  }

  render() {
    const { restrictions, errors } = this.state
    const { event } = this.props
    return (
      <div className="modal__wrapper">
        <div className="modal__header modal__header--with-action">
          <h3 className="heading--two modal__title">Restrict Location</h3>
          {restrictions.length > 0 &&
            <button className="button button--filled button--small" onClick={this.validate}><span className="button__count">{restrictions.length}</span>Set restrictions</button>
          }
        </div>
        <button className="modal__close" type="button" onClick={ this.props.closeEvent }>
          <Icon id="i-close" />
          Close
        </button>
        <div className="modal__content modal__content--wide">
          {restrictions.map((restriction, i) => (
            <div className="form__group" key={i}>
              <FormControl label="Start Date" required error={errors[i] && errors[i]['start-date']}>
                <DatePicker
                  selected={restriction['start-date']}
                  dateFormat={Features.formats.longDate}
                  onChange={v => this.changeDate(v, 'start', i)}
                  minDate={event['start-time']}
                  maxDate={event['end-time']} />
              </FormControl>
              <FormControl label="End Date" required error={errors[i] && errors[i]['end-date']}>
                <DatePicker
                  selected={restriction['end-date']}
                  dateFormat={Features.formats.longDate}
                  onChange={v => this.changeDate(v, 'end', i)}
                  minDate={event['start-time']}
                  maxDate={event['end-time']} />
              </FormControl>
              <FormControl label="Start Time" required error={errors[i] && errors[i]['start-time']}>
                <Select clearable={ false } options={ this.props.times } value={moment.utc(restriction['start-time']).format('HH:mm')} searchable={ false } onChange={time => {
                  const {restrictions} = this.state
                  const {calendar, event} = this.props
                  const [hours, minutes] = time.split(':')

                  const formattedTime = moment
                    .utc(event['start-time'])
                    .hours(hours)
                    .minutes(minutes)

                  restrictions[i]['start-time'] = formattedTime.toISOString()

                  if (time >= moment.utc(restriction['end-time']).format('HH:mm')) {
                    const endTime = formattedTime
                      .add(calendar['slot-length']/60, 'm')
                      .toISOString()

                    restrictions[i]['end-time'] = endTime
                  }

                  this.setState({
                    restrictions
                  })
                }} required simpleValue={true} />
              </FormControl>
              <FormControl label="End Time" required error={errors[i] && errors[i]['end-time']}>
                <Select clearable={ false } options={ this.props.times } value={moment.utc(restriction['end-time']).format('HH:mm')} searchable={ false } onChange={time => {
                  const {restrictions} = this.state
                  const {calendar, event} = this.props
                  const [hours, minutes] = time.split(':')

                  const formattedTime = moment
                    .utc(event['start-time'])
                    .hours(hours)
                    .minutes(minutes)

                  restrictions[i]['end-time'] = formattedTime.toISOString()

                  if (time <= moment.utc(restriction['start-time']).format('HH:mm')) {
                    const startTime = formattedTime
                      .subtract(calendar['slot-length']/60,'m')
                      .toISOString()

                      restrictions[i]['start-time'] = startTime
                  }

                  this.setState({
                    restrictions
                  })
                }} required simpleValue={true} />
              </FormControl>
              <FormControl label="Users">
                <Select.Async
                  value={restriction.users}
                  multi={true}
                  onChange={(users) => {
                    const {restrictions} = this.state
                    const update = [...restrictions]
                    update[i] = {
                      ...update[i],
                      users
                    }
                    this.setState({
                      restrictions: update
                    })
                  }}
                  labelKey="full-name"
                  valueKey="id"
                  loadOptions={this.searchUsers}
                  autoload={false}
                  clearable={ false }
                  backspaceRemoves={true}
                  placeholder="Type to search"/>
              </FormControl>
              <button className="delete" onClick={() => this.removeRestriction(restriction)}>
                <Icon classes="delete__icon"/>
              </button>
            </div>
          ))}

          <div className="form__control form__control--bordered">
            <button className="button button--small" onClick={() => {
              const {event} = this.props
              this.setState({
                restrictions: [...restrictions, {
                    'id': uuid(),
                    'start-date': moment(event['start-time']),
                    'end-date': moment(event['start-time']),
                    'start-time': '',
                    'end-time': '',
                    'users':[],
                    'unSaved': true
                }]
              })
            }}>Add a new restriction</button>
          </div>
        </div>
      </div>
    )
  }
}