import React, { Suspense } from 'react'
import { NavLink } from 'react-router-dom'
import copyToClipboard from 'copy-to-clipboard'
import deepmerge from 'deepmerge-concat'

import Tabs from 'javascript/components/tabs'
import Notes from 'javascript/views/meetings/notes'
import ListNotes from 'javascript/views/meetings/list-notes'
import Icon from 'javascript/components/icon'

import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
import moment from 'moment'

// Actions
import MeetingActions from 'javascript/actions/meetings'

// Store
import MeetingStore from 'javascript/stores/meetings'
import NotesStore from 'javascript/stores/meeting-notes'
import styled from 'styled-components'
import {
  MeetingType,
  CalendarEventType,
  UserType,
} from 'javascript/types/ModelTypes'
import SummaryTab from './SummaryTab'
import withTheme from 'javascript/utils/theme/withTheme'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  meeting: MeetingType
  confirmDeletion: (meeting: MeetingType) => () => void
  event: CalendarEventType
  back: () => void
  user: UserType
  theme: ThemeType
}

interface State {
  copiedUrl: boolean
  meeting: MeetingType
  loading: boolean
  modal: () => any
}

class Meeting extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      copiedUrl: false,
      meeting: null,
      loading: true,
      modal: () => {},
    }
  }

  componentWillMount() {
    NotesStore.on('change', this.refreshStore)
    MeetingStore.on('change', this.getResources)
    MeetingStore.on('checkIn', this.getResources)
  }

  componentDidMount() {
    this.refreshStore()
  }

  componentWillUnmount() {
    MeetingStore.removeListener('change', this.getResources)
    MeetingStore.removeListener('checkIn', this.getResources)
    NotesStore.removeListener('change', this.refreshStore)
    MeetingStore.unsetResource()
  }

  refreshStore = () => {
    let query = {
      include:
        'meeting-notes,owner,list,source-list,source-list.user,meeting-attendees,calendar-event-location',
      fields: {
        meetings: [
          'start-time,end-time,meeting-notes,owner,description,critical',
          'list,source-list,title,has-meeting-notes,is-meal-slot,is-event-meeting',
          'meeting-attendees-count,checked-in,meeting-attendees,calendar-event-location',
          'location'
        ].join(','),
        users: 'first-name,last-name',
        lists: 'name,user',
        'meeting-notes': 'text,created-at,pre-meeting-note',
        'meeting-attendees': 'first-name,last-name,vip,company,territory-names',
        'calendar-event-location': 'name,nickname',
      },
    }
    if (this.props.theme.features.users.meetings.virtual) {
      query = deepmerge.concat(query, {
        include: 'virtual-meeting,meeting-attendees.user',
        fields: {
          'meetings': 'virtual,virtual-meeting,chat-enabled,conference',
          'virtual-meetings': 'id,live,token',
          'meeting-attendees': 'send-virtual-meeting-email,user'
        }
      })
    }
    MeetingActions.getResource(this.props.meeting.id, query)
  }

  getResources = () => {
    this.setState({
      meeting: MeetingStore.getResource(),
      loading: false,
    })
  }

  listNameWithUser = (list) => {
    let listName = list.name
    if(list.user) {
      listName += ` (${list.user['first-name']} ${list.user['last-name']})`
    }
    return listName
  }

  toggleCheckIn = () => {
    const { meeting } = this.state
    MeetingActions.checkIn({
      id: meeting.id,
      'checked-in': !meeting['checked-in'],
    })
  }

  userIsAttendeeOrHost = () => {
    const { user } = this.props
    const { meeting } = this.state
    if (user.id === meeting.owner.id) return true
    return meeting['meeting-attendees'].filter((attendee) => {
      return attendee.user && user.id === attendee.user.id
    }).length > 0
  }

  renderVirtualScreeningButton = () => {
    const { theme, user } = this.props
    const { meeting } = this.state
    if (theme.features.users.meetings.virtual && meeting.virtual && meeting['virtual-meeting'] && this.userIsAttendeeOrHost()) {
      const virtualUrl = user.id === meeting.owner?.id ? 'virtual-host' : 'virtual'
      return (
        <NavLink className="button" to={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}/${virtualUrl}/${meeting['virtual-meeting'].id}`}>
          Join Meeting
        </NavLink>
      )
    }
  }

  render() {
    const { meeting } = this.state
    const closedEvent = this.props.event && this.props.event.closed
    const {
      theme: { features, localisation, variables },
    } = this.props
    if (!meeting) {
      return (
        <div className="modal__content">
          <div className="loader"></div>
        </div>
      )
    }
    const isVirtualMeeting = features.users.meetings.virtual && meeting.virtual

    const virtualMeetingUrl = isVirtualMeeting && meeting['virtual-meeting']
      ? `${window.location.origin}/${variables.SystemPages.account.path}/${variables.SystemPages.meeting.path}/virtual/${meeting['virtual-meeting'].id}?virtual-meeting-token=${ meeting['virtual-meeting']['token']}`
      : ''

    return (
      <div className="modal__content">
        <Tabs>
          <div title="Details">
            <div className="meeting-summary">
              <Column>
                <Label>Date</Label>
                <Copy>
                  {moment
                    .utc(meeting['start-time'])
                    .format(features.formats.shortDate)}
                </Copy>
                <Label>Time</Label>
                <Copy>
                  {moment.utc(meeting['start-time']).format('HH:mm')} -{' '}
                  {moment.utc(meeting['end-time']).format('HH:mm')}
                </Copy>
                {!isVirtualMeeting && (
                  <>
                    <Label>Location</Label>
                    <Copy>
                      {meeting['is-event-meeting'] ? (
                        <span>
                          {meeting['calendar-event-location'].name}{' '}
                          {meeting['calendar-event-location'].nickname
                            ? `: ${meeting['calendar-event-location'].nickname}`
                            : ''}
                        </span>
                      ) : (
                        <span>{meeting.location}</span>
                      )}
                    </Copy>
                  </>
                )}
                <Label>Host</Label>
                <Copy>
                  {meeting.owner['first-name']} {meeting.owner['last-name']}
                </Copy>
                {features.users &&
                  features.users.meetings &&
                  features.users.meetings.events &&
                  !isVirtualMeeting && (
                    <div>
                      <Label>Meal</Label>
                      <Copy>{meeting['is-meal-slot'] ? 'Yes' : 'No'}</Copy>
                    </div>
                )}
                {meeting['source-list'] && (
                  <>
                    <Label>{localisation.list.upper}</Label>
                    <Copy>
                      {this.listNameWithUser(meeting['source-list'])}
                    </Copy>
                  </>
                )}
                {!isVirtualMeeting && (
                  <>
                    <Label>Critical</Label>
                    <Copy>{meeting.critical ? 'Yes' : 'No'}</Copy>
                  </>
                )}
                { virtualMeetingUrl &&
                  <>
                    <Label>
                      Virtual Meeting
                      <button
                        className="meeting__copy-button"
                        onClick={() => {
                          copyToClipboard(virtualMeetingUrl)
                          this.setState({
                            copiedUrl: true
                          }, () => {
                            setTimeout(() => {
                              this.setState({
                                copiedUrl: false
                              })
                            }, 700)
                          })
                        }}
                      >
                        <Icon id="i-copy" className="meeting__icon"/>
                      </button>
                      {this.state.copiedUrl ? <span style={{color: 'red'}}>Copied</span> : null}
                    </Label>
                    <Copy>{virtualMeetingUrl}</Copy>
                  </>
                }
              </Column>

              <Column>
                <LabelSpaced>Description</LabelSpaced>
                <Copy>{meeting.description}</Copy>
              </Column>

              <Column>
                <LabelSpaced>Attendees</LabelSpaced>
                {meeting['meeting-attendees'].map(a => (
                  <Copy key={a.id}>
                    {a.vip && (
                      <Icon
                        id="i-admin-star"
                        width="16"
                        height="16"
                        viewBox="0 0 35 35"
                      />
                    )}{' '}
                    {a['first-name']} {a['last-name']}{' '}
                    <small>{a.company} {a['territory-names']?.length > 0 && `, ${a['territory-names'].join(', ')}`}</small>
                  </Copy>
                ))}
              </Column>
            </div>
          </div>
          <div title="Notes">
            <Notes meeting={this.state.meeting} editable={!closedEvent} />
          </div>
          <div title={localisation.list.upper}>
            <ListNotes listId={this.state.meeting.list.id} theme={this.props.theme} />
          </div>
          <div title={'Summary'}>
            <div>
              <Suspense fallback={<div className="loader"></div>}>
                <SummaryTab meeting={this.state.meeting} user={this.props.user} />
              </Suspense>
            </div>
          </div>
        </Tabs>

        <div className="modal__actions">
          {this.props.back && (
            <button className="button" onClick={this.props.back}>
              Back
            </button>
          )}
          { features.users.meetings.virtual && this.renderVirtualScreeningButton() }
          {!closedEvent &&
            (isAdmin(this.props.user) ||
              hasPermission(this.props.user, 'manage_meetings') ||
              meeting.owner.id === this.props.user.id) && (
              <>
                {this.props.event ? (
                  <NavLink
                    className="button"
                    to={{
                      pathname: `/${variables.SystemPages.account.path}/${variables.SystemPages.meeting.path}/${meeting.id}/edit`,
                      state: { event: this.props.event },
                    }}
                  >
                    Edit Meeting
                  </NavLink>
                ) : (
                  <NavLink
                    to={`/${variables.SystemPages.account.path}/${variables.SystemPages.meeting.path}/${meeting.id}/edit`}
                    className="button"
                  >
                    Edit Meeting
                  </NavLink>
                )}
                <button
                  className="button button--filled"
                  onClick={this.toggleCheckIn}
                >
                  {meeting['checked-in'] ? 'Checked In' : 'Check In'}
                </button>
                <button
                  className="button button--error"
                  onClick={this.props.confirmDeletion(meeting)}
                >
                  Cancel Meeting
                </button>
              </>
            )}
        </div>

        {this.state.modal()}
      </div>
    )
  }
}

export default withTheme(Meeting)

const Label = styled.h4.attrs({
  className: `meeting-summary__label`,
})``

const LabelSpaced = styled.h4.attrs({
  className: 'meeting-summary__label--spaced',
})``

const Column = styled.div.attrs({
  className: 'meeting-summary__column',
})``

const Copy = styled.p.attrs({
  className: 'meeting-summary__copy',
})``
