import React from 'react'
import { NavLink } from 'react-router-dom'
import moment from 'moment'
import 'stylesheets/core/components/calendar'
import PageHelper from 'javascript/views/page-helper'
import Meeting from 'javascript/components/meeting'
import AddMeeting from 'javascript/components/add-meeting'
import Modal from 'javascript/components/modal'
import MeetingOverview from 'javascript/views/meetings/meeting'
import DeleteMeeting from 'javascript/views/meetings/delete-meeting'
import Icon from 'javascript/components/icon'

import allClientVariables from './variables'
import meetingsClientVariables from 'javascript/views/meetings/variables'

import MeetingsStore from 'javascript/stores/meetings'
import withTheme from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'


class Calendar extends PageHelper {
  constructor(props) {
    super(props)
    this.times = []
    for (let h = 0; h <= 23; h++) {
      for (let m = 0; m < 60; m += Number(props.calendar['slot-length']) / 60) {
        const hour = `0${h}`.slice(-2)
        const minutes = `0${m}`.slice(-2)
        this.times.push(`${hour}:${minutes}`)
      }
    }
    this.state = {
      modal: () => { }
    }
    this.eventsEnabled = this.props.theme.features.users.meetings.events
  }

  componentDidMount() {
    this.view.addEventListener('scroll', this.handleScroll, { passive: true })
    MeetingsStore.on('deleted', this.unsetModal)
    const position = this.updateCurrentTime()
    this.view.scrollTop = position
    const now = moment()
    const next = moment().add(1, 'minute').seconds(0)
    const timeout = next.diff(now, 'milleseconds')
    setTimeout(() => {
      this.updateCurrentTime()
      this.interval = setInterval(this.updateCurrentTime, 60000)
    }, timeout)
  }

  componentWillUnmount() {
    this.view.removeEventListener('scroll', this.handleScroll, { passive: true })
    MeetingsStore.removeListener('deleted', this.unsetModal)
    clearInterval(this.interval)
  }

  updateCurrentTime = () => {
    const time = new Date()
    const height = this.columns.offsetHeight
    const hourPos = time.getHours() * (height / 24)
    const minutePos = hourPos + (time.getMinutes() * (height / (24 * 60)))
    this.setState({
      timePosition: minutePos - 1
    })
    return minutePos - (this.view.offsetHeight / 3)
  }

  handleScroll = (e) => {
    this.timesEl.style.transform = `translate3d(0,${e.target.scrollTop * -1}px,0)`
    this.daysEl.style.transform = `translate3d(${e.target.scrollLeft * -1}px,0,0)`
  }

  renderTimes = () => {
    return (
      <div className="calendar__rows" ref={n => { this.timesEl = n }}>
        {this.times.map(t => (
          <div className="calendar__row calendar__time" key={t}>
            <span>{t}</span>
          </div>
        ))}
      </div>
    )
  }
  viewMeeting = (meeting, multiple = false, back) => () => {
    if (multiple) {
      this.setState({
        modal: () => (
          <Modal ref="modal" title={moment.utc(meeting[0].meetings[0]['start-time']).format(this.props.theme.features.formats.longDate)} closeEvent={this.unsetModal} modifiers={['meeting']}>
            <div className="modal__content">
              {meeting.map(g => (
                <div key={g.title}>
                  <h3>{g.title}</h3>
                  <div className="grid grid--four">
                    {g.meetings.map(m => {
                      const split = m['end-time'].split('T')
                      const time = split[1].split(':')
                      const endTime = `${split[0]} ${time[0]}:${time[1]}:00`
                      return (
                        <Meeting key={m.id} meeting={m} onClick={this.viewMeeting(m, false, this.viewMeeting(meeting, true))} classes={[moment() > moment(endTime) && 'passed']} events={this.props.events} />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Modal>
        )
      })
    } else {
      const split = meeting['end-time'].split('T')
      const time = split[1].split(':')
      const endTime = `${split[0]} ${time[0]}:${time[1]}:00`
      const isPassed = moment() > moment(endTime)
      this.setState({
        modal: () => (
          <Modal ref="modal" title={meeting.title} closeEvent={this.unsetModal} modifiers={['meeting']}>
            <MeetingOverview meeting={meeting} closeEvent={this.unsetModal} confirmDeletion={this.confirmDeletion} isPassed={isPassed} back={back ? back : null} event={this.props.event} user={this.props.user} />
          </Modal>
        )
      })
    }
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
  groupBy = (meetings) => {
    const groups = meetings.reduce((g, meeting) => {
      const group = `${moment.utc(meeting['start-time']).format('HH:mm')} - ${moment.utc(meeting['end-time']).format('HH:mm')}`
      const existingMeetings = g[group] ? g[group].meetings : []
      return {
        ...g,
        [group]: {
          title: group,
          meetings: [...existingMeetings, meeting]
        }
      }
    }, {})
    return Object.values(groups)
  }
  renderSlot = (slot, i) => {
    const { meetings } = this.props.calendar
    const { locationFilter, typeFilter } = this.props
    const isPassed = moment() > moment(slot.date.replace('UTC', ''), 'YYYY-MM-DD HH:mm:ss').add(Number(this.props.calendar['slot-length']) / 60, 'minutes')
    const closedEvent = this.props.event && this.props.event.closed
    let isOffsite = false
    if (this.props.event) {
      const day = this.props.event['calendar-event-opening-times'].find(o => moment(o['start-time']).format('DD/MM/YYY') === moment(slot.date.replace('UTC', ''), 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYY'))
      if (day) {
        const slotTime = moment.utc(slot.date.replace('UTC', ''), 'YYYY-MM-DD HH:mm:ss').format('X')
        const endSlot = moment.utc(slot.date.replace('UTC', ''), 'YYYY-MM-DD HH:mm:ss').add(Number(this.props.calendar['slot-length']) / 60, 'minutes').format('X')
        const start = moment.utc(day['start-time']).format('X')
        const end = moment.utc(day['end-time']).format('X')
        if (slotTime < start || endSlot > end) {
          isOffsite = true
        }
      }
    }

    let meetingsInSlot = meetings.filter(m => slot.meetings.find(sm => sm.id == m.id))
    if (locationFilter) {
      meetingsInSlot = meetingsInSlot.filter(m => m['calendar-event-location-id'] == locationFilter)
    }
    if (typeFilter) {
      if (typeFilter === 'meal') {
        meetingsInSlot = meetingsInSlot.filter(m => m['is-meal-slot'])
      } else if (typeFilter === 'meeting') {
        meetingsInSlot = meetingsInSlot.filter(m => !m['is-meal-slot'])
      }
    }
    let meetingsStartingInSlot = meetingsInSlot.filter(m => moment.utc(m['start-time']).format('X') === moment.utc(slot.date, 'YYYY-MM-DD HH:mm:ss').format('X'))
    if (!this.eventsEnabled) {
      meetingsStartingInSlot = meetingsStartingInSlot.filter(m => !m['is-event-meeting'])
      meetingsInSlot = meetingsInSlot.filter(m => !m['is-event-meeting'])
    }

    if (meetingsStartingInSlot.length === 1) {
      const split = meetingsStartingInSlot[0]['end-time'].split('T')
      const time = split[1].split(':')
      const endTime = `${split[0]} ${time[0]}:${time[1]}:00`

      return (
        <div className={`calendar__row calendar__slot ${isPassed && 'calendar__slot--passed'} ${isOffsite && 'calendar__slot--offsite'}`} key={i}>

          <Meeting meeting={meetingsStartingInSlot[0]} onClick={this.viewMeeting(meetingsStartingInSlot[0])} classes={[moment() > moment(endTime) && 'passed']} events={this.props.events} />

          {!isPassed && !closedEvent &&
            <AddMeeting slot={slot} event={this.props.event} />
          }
        </div>
      )
    } else if (meetingsStartingInSlot.length > 1) {
      return (
        <div className={`calendar__row calendar__slot ${isPassed && 'calendar__slot--passed'} ${isOffsite && 'calendar__slot--offsite'}`} key={i}>

          <Meeting meetings={this.groupBy(meetingsStartingInSlot)} onClick={this.viewMeeting(this.groupBy(meetingsStartingInSlot), true)} multiple={true} classes={[isPassed && 'passed', 'multiple']} events={this.props.events} />

          {!isPassed && !closedEvent &&
            <AddMeeting slot={slot} event={this.props.event} />
          }
        </div>
      )
    } else if (meetingsInSlot.length > 0) {
      return (
        <div className={`calendar__row calendar__slot ${isPassed && 'calendar__slot--passed'} ${isOffsite && 'calendar__slot--offsite'} calendar__slot--filled`} key={i}>
          {!isPassed && !closedEvent &&
            <AddMeeting slot={slot} event={this.props.event} />
          }
        </div>
      )
    } else {
      return (
        <div className={`calendar__row calendar__slot ${isPassed && 'calendar__slot--passed'} ${isOffsite && 'calendar__slot--offsite'}`} key={i}>
          {!isPassed && !closedEvent &&
            <AddMeeting slot={slot} event={this.props.event} />
          }
        </div>
      )
    }
  }
  printColumn = col => () => {
    window.open(`/${this.props.theme.variables.SystemPages.account.path}/${this.props.theme.variables.SystemPages.meeting.path}/print?timestamp=` + moment.utc(col.date, 'YYYY-MM-DD').unix())
  }
  render() {
    const { calendar, view, start , meetingsCV, theme, calendarCV} = this.props
    const slots = view === 'day' ? calendar['slots-array'] : calendar['locations-array'].filter(s => moment(s.date, 'YYYY-MM-DD').format('DD/MM/YYYY') === start)
    return (
      <div className={`calendar ${!meetingsCV.fixedCalendar && 'calendar--flexible'}`}>
        <div className="calendar__view" ref={n => { this.view = n }}>
          <div className="calendar__columns" ref={n => { this.columns = n }}>
            {slots.map((d, i) => (
              <div className="calendar__column" key={i}>
                {moment().startOf('day').diff(moment(d.date, 'YYYY-MM-DD').startOf('day'), 'days') === 0 &&
                  <div className="calendar__bar" style={{ top: this.state.timePosition }}></div>
                }
                <div className="calendar__rows">
                  {d.slots.map(this.renderSlot)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="calendar__times">
          {this.renderTimes()}
        </div>
        <div className="calendar__days">
          <div className="calendar__columns" ref={n => { this.daysEl = n }}>
            {slots.map((s, i) => (
              <div className="calendar__column calendar__day" key={i}>{view === 'day' ? moment.utc(s.date, 'YYYY-MM-DD').format(this.props.theme.features.formats.longDate) : s.location}
                <button onClick={this.printColumn(s)}>
                  <Icon id="i-print" width="20" height="18" viewBox="0 0 20 18" />
                </button>
              </div>
            ))}
          </div>
        </div>
        {this.state.modal()}
        <NavLink
          className={calendarCV.addMeetingClasses}
          to={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}/new`}
        >
          <ClientSpecific client="keshet">
            <div className="add-meeting" >
              <Icon id="i-add" viewBox="0 0 32 32" classes="add-meeting__icon add-meeting__icon--large" />
            </div>
          </ClientSpecific >
        </NavLink>
      </div>
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('meetingsCV', meetingsClientVariables),
  withClientVariables('calendarCV', allClientVariables)
)

export default enhance(Calendar)