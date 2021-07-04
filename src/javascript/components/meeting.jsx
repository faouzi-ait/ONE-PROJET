import React from 'react'
import moment from 'moment'

import 'stylesheets/core/components/meeting'

import withTheme from 'javascript/utils/theme/withTheme'

import HelperComponent from 'javascript/components/helper'
import Icon from 'javascript/components/icon'


class Meeting extends HelperComponent {
  constructor(props) {
    super(props)
    this.resourceName = 'meeting'
    if (props.multiple) {
      if (props.meetings.length > 4) {
        this.count = 0
        props.meetings.forEach(m => {
          this.count += m.meetings.length
        })
      }
    }
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  render() {
    const { meetings, meeting, multiple, theme } = this.props

    if (multiple) {
      if (meetings.length > 4) {
        return (
          <article className={this.state.classes} onClick={this.props.onClick}>
            <div className="meeting__column">
              <span className="meeting__time">{moment.utc(meetings[0].meetings[0]['start-time']).format('HH:mm')} - multiple durations</span>
              <h3 className="meeting__title">{this.count} {this.count === 1 ? 'Meeting' : 'Meetings'}</h3>
            </div>
          </article>
        )
      } else {
        return (
          <article className={this.state.classes} onClick={this.props.onClick}>
            {meetings.map(m => (
              <div className="meeting__column" key={m.title}>
                <span className="meeting__time">{m.title}</span>
                <h3 className="meeting__title">{m.meetings.length} {m.meetings.length === 1 ? 'Meeting' : 'Meetings'}</h3>
              </div>
            ))}
          </article>
        )
      }
    }
    const startTime = moment.utc(meeting['start-time']).format('HH:mm')
    const endTime = moment.utc(meeting['end-time']).format('HH:mm')
    const event = this.props.events ? this.props.events.find(e => (e['calendar-event-locations'] || []).find(l => l.id == meeting['calendar-event-location-id'])) : null
    const location = event ? event['calendar-event-locations'].find(l => l.id == meeting['calendar-event-location-id']) : null

    return (
      <article className={this.state.classes} onClick={this.props.onClick}>
        <header className="meeting__header">
          <span className="meeting__time">{startTime} - {endTime}</span>
          <span className="meeting__owner">{meeting['owner-full-name']}</span>
          {theme.features.users.meetings.defaultLunchLocation && meeting['is-meal-slot'] ? (
            <div></div>
          ) : (
            <span className="meeting__attendees">
              {meeting['has-vip'] &&
                <Icon id="i-admin-star" width="10" height="10" viewBox="0 0 35 35" classes="meeting__icon meeting__icon--vip"/>
              }
              <Icon width="26" height="15" id="i-users" viewBox="0 0 26 15" classes="meeting__icon"/>
              {meeting['meeting-attendees-count']}{(meeting['is-event-meeting'] && location) ? `/${location['max-attendees']}` : ''}
            </span>
          )}
        </header>
        <h3 className="meeting__title">{meeting.title}</h3>
        <p className="meeting__room">{meeting.location}</p>
        <footer className="meeting__footer">
          <span className="meeting__list">
            <Icon width="14" height="11" id="i-list" viewBox="0 0 22 17" classes="meeting__icon"/>
            {meeting['list-name']}
          </span>
          {meeting['checked-in'] &&
            <Icon width="16" height="16" id="i-checked-in" viewBox="0 0 16 16" classes="meeting__icon"/>
          }
          {meeting['is-event-meeting'] &&
            <Icon width="16" height="16" id="i-event" viewBox="0 0 16 16" classes="meeting__icon"/>
          }
          {meeting['is-meal-slot'] &&
            <Icon width="16" height="16" id="i-meal" viewBox="0 0 16 16" classes="meeting__icon"/>
          }
          {meeting.critical &&
            <Icon width="16" height="14" id="i-admin-warn" viewBox="0 0 31 27" classes="meeting__icon"/>
          }
          {meeting['has-meeting-notes'] &&
            <Icon id="i-note" classes="meeting__icon"/>
          }
          {theme.features.users.meetings.virtual && meeting['virtual'] &&
            <Icon id="i-virtual-meeting" classes="meeting__icon"/>
          }
        </footer>
      </article>
    )
  }
}
export default withTheme(Meeting)