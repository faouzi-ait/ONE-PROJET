import React from 'react'
import moment from 'moment'

import meetingsClientVariables from 'javascript/views/meetings/variables'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'
import UserService from 'javascript/services/users'

import Icon from 'javascript/components/icon'
import Checkbox from 'javascript/components/custom-checkbox'


class MeetingsRegisteredAttendees extends React.Component {
  constructor(props) {
    super(props)
    const { theme } = this.props
    const defaultLunch = props.locations.filter(
      i => i.name === theme.features.users.meetings.defaultLunchName,
    )[0]
    const date = moment.utc(props?.date?.toDate()).format().split('T')[0] + ' UTC'
    this.state = {
      users: props.resource['meeting-attendees'],
      term: '',
      results: null,
      selected: false,
      maxReached: false,
      locations: props.locations,
      initialAttendees: props.attendees ? props.attendees : 0,
      defaultLunchLocation:
        theme.features.users.meetings.defaultLunchLocation &&
        defaultLunch &&
        defaultLunch.id === props.resource['calendar-event-location']?.id &&
        defaultLunch,
      lunchSlot:
        props.resource['calendar-event-meal-slot'] &&
        defaultLunch &&
        defaultLunch['meals-allocation-stats'] &&
        defaultLunch['meals-allocation-stats']?.[date] &&
        defaultLunch['meals-allocation-stats']?.[date].filter(
          i =>
            i['meal-slot-id'] ===
            parseInt(props.resource['calendar-event-meal-slot'].id),
        ),
      modal: () => {},
    }
  }
  componentDidMount() {
    this.refs.input.focus()
    this.slotLimit =
      this.state.lunchSlot && this.state.lunchSlot.length > 0
        ? this.state.lunchSlot[0]['attendees-assigned'] + 1
        : 1
    const maxReached =
      this.state.defaultLunchLocation &&
      this.state.users.length - this.state.initialAttendees >=
        this.state.defaultLunchLocation['total-meals-bookable'] - this.slotLimit
    this.setState({
      maxReached,
    })
  }
  searchUsers = e => {
    const ownerId = this.props.resource?.owner?.id
    const excludedUserIds = (this.state.users || []).reduce((acc, attendee) => {
      if (attendee.type === 'users') {
        acc.push(attendee.id)
      }
      return acc
    }, [])

    if (ownerId) excludedUserIds.push(ownerId)
    clearTimeout(this.timer)
    this.setState(
      {
        term: e.target.value,
        loading: true,
      },
      () => {
        if (!this.state.term.length) {
          this.setState({
            results: null,
            loading: false,
          })
        } else {
          this.timer = setTimeout(() => {
            UserService.search(
              {
                include: 'company',
                fields: {
                  users:
                    'first-name,last-name,job-title,email,company,user-type,meeting-attendee-id',
                  companies: 'name',
                },
                filter: {
                  search_active: this.state.term,
                  'choices-for': 'meeting-attendee-user',
                  'exclude-ids': excludedUserIds.join(',')
                },
                page: {
                  size: 200,
                },
              },
              this.setResults,
            )
          }, 300)
        }
      },
    )
  }

  setResults = results => {
    const selected = results.filter(r =>
      this.state.users.find(u => u.id === r.id && u.status?.toLowerCase() !== 'unregistered'),
    )
    this.setState({
      results: results.map(r => ({
        ...r,
        vip: false,
        'send-virtual-meeting-email': false
      })),
      loading: false,
      selected: selected.length === results.length,
    })
  }

  toggleUser = u => e => {
    const maxReached =
      this.state.defaultLunchLocation &&
      this.state.users.length - this.state.initialAttendees >=
        this.state.defaultLunchLocation['total-meals-bookable'] -
          this.slotLimit -
          1 &&
      e.target.checked
    if (e.target.checked) {
      this.setState({
        users: [...this.state.users, u],
        maxReached,
      })
    } else {
      this.setState({
        users: this.state.users.filter(e => e.id !== u.id),
        selected: false,
        maxReached,
      })
    }
  }

  toggleAll = () => {
    if (this.state.selected) {
      this.setState({
        selected: false,
        users: this.state.users.filter(
          u => !this.state.results.find(r => r.id === u.id),
        ),
      })
    } else {
      const stripped = this.state.users.filter(
        u => !this.state.results.find(r => r.id === u.id),
      )
      this.setState({
        selected: true,
        users: [...stripped, ...this.state.results],
      })
    }
  }

  render() {
    const { users, results } = this.state
    const { theme, meetingsCV } = this.props
    return (
      <div className={meetingsCV.modalClasses}>
        <div className="modal__header modal__header--with-action">
          <h3 className="modal__title">Assign Attendees</h3>
          {users.filter(
            u =>
              (u.status && u.status.toLowerCase() !== 'unregistered') ||
              (u.id && u.type !== 'meeting-attendees'),
          ).length > 0 ? (
            <button
              className={meetingsCV.addAttendeesButtonClasses}
              onClick={() => this.props.assignAttendees(users)}
            >
              <span className="button__count">
                {
                  users.filter(
                    u =>
                      (u.status && u.status.toLowerCase() !== 'unregistered') ||
                      (u.id && u.type !== 'meeting-attendees'),
                  ).length
                }
              </span>
              Assign selected attendees
            </button>
          ) : null}
        </div>
        <button
          className="modal__close"
          type="button"
          onClick={this.props.closeEvent}
        >
          <Icon id="i-close" />
          Close
        </button>
        <div
          className={`modal__search ${this.state.loading &&
            'modal__search--loading'}`}
        >
          <input
            type="text"
            ref="input"
            onChange={this.searchUsers}
            value={this.state.term}
            placeholder="Search for a user"
          />
          {results && (
            <p>
              Displaying {results.length}{' '}
              {results.length === 1 ? 'result' : 'results'}
            </p>
          )}
          {results && (
            <button
              className="modal__close"
              onClick={e =>
                this.setState({
                  term: '',
                  results: null,
                })
              }
            >
              <Icon id="i-close" />
            </button>
          )}
        </div>
        {results && this.state.maxReached && (
          <p className="notification notification--error notification--static">
            No lunch slots are available, please contact MIPeventsteam@itv.com
            to check availability
          </p>
        )}
        <div className="modal__content modal__content--wide">
          {results && results.length < 0 && <p className="info">No results</p>}
          {results && results.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Role</th>
                  {(theme.features.users.meetings.defaultLunchLocation &&
                    this.state.defaultLunchLocation &&
                    results.length <=
                      this.state.defaultLunchLocation['total-meals-bookable'] -
                        users.length) ||
                    (!this.state.defaultLunchLocation && (
                      <th className="u-align-center" style={{ minWidth: 75 }}>
                        <button
                          className="text-button"
                          onClick={this.toggleAll}
                        >
                          {this.state.selected ? 'Deselect All' : 'Select All'}
                        </button>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {results.map((u, i) => (
                  <tr key={i}>
                    <td>
                      {u['first-name']} {u['last-name']}
                    </td>
                    <td>{u.company && u.company.name}</td>
                    <td>{u['job-title']}</td>
                    <td className="u-align-center">
                      <Checkbox
                        id={u.id}
                        labeless={true}
                        disabled={
                          this.state.maxReached &&
                          !users.find(
                            e =>
                              (e.type === 'meeting-attendees' &&
                                e.id == u['meeting-attendee-id']) ||
                              e.id === u.id,
                          )
                        }
                        onChange={this.toggleUser(u)}
                        checked={users.find(
                          e =>
                            ((e.type === 'meeting-attendees' &&
                              e.id == u['meeting-attendee-id']) ||
                            (e.id === u.id) && e.status?.toLowerCase() !== 'unregistered')
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('meetingsCV', meetingsClientVariables)
)

export default enhance(MeetingsRegisteredAttendees)
