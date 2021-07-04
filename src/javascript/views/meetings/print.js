import React from 'react'
import moment from 'moment'

import Store from 'javascript/stores/calendar'
import Actions from 'javascript/actions/calendar'
import withTheme from 'javascript/utils/theme/withTheme'

class MeetingsPrint extends React.Component {
  state = {}
  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search)
    const timestamp = urlParams.get('timestamp')
    const days = urlParams.get('days') ? Number(urlParams.get('days')) : 1
    const query = {
      'calendar-start-date': moment.unix(timestamp).utc().format('DD/MM/YYYY'),
      'calendar-length': days-1,
      'include': 'meetings,calendar-event-locations,meetings.meeting-attendees',
      'fields': {
        'calendars': 'slot-length,slots-array,locations-array,default-timezone,meetings',
        'meetings': 'has-vip,owner-full-name,description,start-time,end-time,list-name,critical,title,has-meeting-notes,is-meal-slot,is-event-meeting,meeting-attendees-count,checked-in,location,calendar-event-location-id,meeting-attendees',
        'calendar-event-locations': 'id',
        'meeting-attendees': 'first-name,last-name,company,territory-names'
      },
      filter: {
        meetings: {
          between: `${moment.unix(timestamp).utc().format('DD/MM/YYYY')},${moment.unix(timestamp).utc().add(days, 'days').format('DD/MM/YYYY')}`
        }
      }
    }
    Actions.getDataResource(1, query)
  }
  componentWillMount() {
    Store.on('dataChange', this.updateCalendar)
  }
  componentWillUnmount() {
    Store.removeListener('dataChange', this.updateCalendar)
  }
  updateCalendar = () => {
    this.setState({
      calendar: Store.getDataResource('1')
    }, () => setTimeout(window.print, 1000))
  }
  renderColumn = (column) => {
    return [
      <thead>
        <tr>
          <th colSpan="5" className="date">{column.location && `${column.location} `}{moment(column.date, 'YYYY-MM-DD').format(this.props.theme.features.formats.longDate)}</th>
        </tr>
        <tr>
          <th>Time</th>
          <th>Title</th>
          <th>Location</th>
          <th>Host</th>
          <th>Attendees</th>
        </tr>
      </thead>,
      <tbody>
        {column.slots.map(s => {
          const meetingsInSlot = this.state.calendar.meetings.filter(m => s.meetings.find(sm => sm.id == m.id))
          const meetingsStartingInSlot = meetingsInSlot.filter(m => moment.utc(m['start-time']).format('X') === moment.utc(s.date, 'YYYY-MM-DD HH:mm:ss').format('X'))
          return meetingsStartingInSlot.map(m => {
            return (
              <tr key={m.id}>
                <td>{moment.utc(m['start-time']).format('HH:mm')} - {moment.utc(m['end-time']).format('HH:mm')}</td>
                <td>{m.title}</td>
                <td>{m['calendar-event-location'] ? (
                  m['calendar-event-location'].name
                ):(
                  m.location
                )}</td>
                <td>{m['owner-full-name']}</td>
                <td><ul>{m['meeting-attendees'].map(u => <li key={u.id}>{u['first-name']} {u['last-name']} <span className="company">{u.company} {u['territory-names']?.length > 0 && `, ${u['territory-names'].join(', ')}`}</span></li>)}</ul></td>
              </tr>
            )
          })
      })}
      </tbody>
    ]
  }
  renderCalendar = () => {
    const { calendar } = this.state
    const columns = calendar['slots-array']
    return columns.map(c => this.renderColumn(c))
  }
  render() {
    return (
      <table className="print-table">
        {this.state.calendar && this.renderCalendar()}
      </table>
    )
  }
}

export default withTheme(MeetingsPrint)