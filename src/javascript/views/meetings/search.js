import React from 'react'
import moment from 'moment'

import meetingsClientVariables from 'javascript/views/meetings/variables'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'

import Icon from 'javascript/components/icon'
import Tabs from 'javascript/components/tabs'
import Service from 'javascript/services/meetings'


class MeetingsSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      term: '',
      results: null
    }
  }
  componentDidMount() {
    this.refs.input.focus()
  }
  search = e => {
    clearTimeout(this.timer)
    this.setState({
      term: e.target.value,
      loading: true
    }, () => {
      if (!this.state.term.length) {
        this.setState({ results: null, loading: false })
      } else {
        this.timer = setTimeout(() => {
          Service.search({
            include: 'calendar-event-location,owner',
            fields: {
              meetings: 'calendar-event-location,owner,title,start-time,end-time,is-event-meeting,location',
              users: 'first-name,last-name',
              'calendar-event-locations': 'name,nickname'
            },
            page: { size: 200 },
            filter: { meeting_attendees_by_name: this.state.term }
          }, this.setResults)
        }, 300)
      }
    })
  }
  setResults = results => {
    this.setState({
      results,
      loading: false
    })
  }
  render() {
    const { results, term } = this.state
    const { theme, meetingsCV } = this.props
    return (
      <div className={meetingsCV.modalClasses}>
        <div className="modal__header">
          <h3 className="heading--two modal__title">Search Meetings by Attendee</h3>
        </div>
        <button className="modal__close" type="button" onClick={ this.props.closeEvent }>
          <Icon id="i-close" />
          Close
        </button>
        <div className={`modal__search ${this.state.loading && 'modal__search--loading'}`}>
          <input type="text" ref="input" onChange={this.search} value={term} placeholder="Search for an attendee" />
          {results &&
            <p>Displaying {results.length} {results.length === 1 ? 'result':'results'}</p>
          }
          {results &&
            <button className="modal__close" onClick={e => this.setState({
              term: '',
              results: null
            })}>
              <Icon id="i-close" />
            </button>
          }
        </div>
        <div className="modal__content modal__content--wide">
          {results && results.length < 0 &&
            <p className="info">No results</p>
          }
          {results && results.length > 0 &&
            <Tabs>
              <div title="Upcoming">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Meeting Title</th>
                      <th className="u-align-center">Start Time</th>
                      <th className="u-align-center">End Time</th>
                      <th>Host</th>
                      <th>Location</th>
                      {theme?.features?.users?.meetings?.events && (
                        <th className="u-align-center">Event</th>
                      )}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.filter(m => moment() < moment.utc(m['end-time'])).map(m => (
                      <tr key={m.id}>
                        <td>{moment.utc(m['start-time']).format(theme.features.formats.shortDate)}</td>
                        <td>{m.title}</td>
                        <td className="u-align-center">{moment.utc(m['start-time']).format('HH:mm')}</td>
                        <td className="u-align-center">{moment.utc(m['end-time']).format('HH:mm')}</td>
                        <td>{m.owner['first-name']} {m.owner['last-name']}</td>
                        <td>{m['calendar-event-location'] ? (
                          <span>{m['calendar-event-location'].name} {m['calendar-event-location'].nickname && `: ${m['calendar-event-location'].nickname}`}</span>
                          ):(
                          <span>{m.location}</span>
                        )}</td>
                        {theme?.features?.users?.meetings?.events && (
                          <td className="u-align-center">{m['is-event-meeting'] ? 'Yes':'No'}</td>
                        )}
                        <td><button className="text-button" onClick={this.props.viewMeeting(m)}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div title="Completed">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Meeting Title</th>
                      <th className="u-align-center">Start Time</th>
                      <th className="u-align-center">End Time</th>
                      <th>Host</th>
                      <th>Location</th>
                      {theme?.features?.users?.meetings?.events && (
                        <th className="u-align-center">Event</th>
                      )}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.filter(m => moment() > moment.utc(m['end-time'])).map(m => (
                      <tr key={m.id}>
                        <td>{moment.utc(m['start-time']).format(theme.features.formats.shortDate)}</td>
                        <td>{m.title}</td>
                        <td className="u-align-center">{moment.utc(m['start-time']).format('HH:mm')}</td>
                        <td className="u-align-center">{moment.utc(m['end-time']).format('HH:mm')}</td>
                        <td>{m.owner['first-name']} {m.owner['last-name']}</td>
                        <td>{m['calendar-event-location'] ? (
                          <span>{m['calendar-event-location'].name} {m['calendar-event-location'].nickname && `: ${m['calendar-event-location'].nickname}`}</span>
                          ):(
                          <span>{m.location}</span>
                        )}</td>
                        {theme?.features?.users?.meetings?.events && (
                          <td className="u-align-center">{m['is-event-meeting'] ? 'Yes':'No'}</td>
                        )}
                        <td><button className="text-button" onClick={this.props.viewMeeting(m)}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tabs>
          }
        </div>
      </div>
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('meetingsCV', meetingsClientVariables)
)

export default enhance(MeetingsSearch)