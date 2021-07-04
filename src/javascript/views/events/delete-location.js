import React from 'react'
import pluralize from 'pluralize'
import { NavLink } from 'react-router-dom'

import Actions from 'javascript/actions/calendar-event-locations'
import withTheme from 'javascript/utils/theme/withTheme'

class EventDeleteLocation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
    this.resourceName = 'location'
  }

  deleteResource = () => {
    this.setState({
      loading: true
    })
    if (this.props.resource.id) {
      Actions.deleteResource(this.props.resource)
    }
    this.props.complete(this.props.index)
  }

  render() {
    let classes = ['button', 'filled', 'reversed', this.state.loading && 'loading'].join(' button--')
    const { localisation, variables } = this.props.theme
    const locationMeetings = this.props.meetings.filter(m => m['calendar-event-location-id'] === parseInt(this.props.resource.id)).length
    if (locationMeetings > 0) {
      return (
        <div className="u-align-center">
          <p>
            This location has { locationMeetings } { locationMeetings === 1 ? localisation.meeting.lower : pluralize(localisation.meeting.lower) }.
            Please delete all <NavLink to={`/${variables.SystemPages.account.path}/${variables.SystemPages.meeting.path}`}>{ pluralize(localisation.meeting.lower) }</NavLink>
            associated with this { this.resourceName } first.
          </p>
          <button type="button" className="button button--reversed" onClick={ this.props.closeEvent }>Cancel</button>
        </div>
      )
    }
    return (
      <form className="form" onSubmit={ this.deleteResource }>
        <div>
          <div className="form__control">
            <p>Are you sure you want to delete the location <strong>{this.props.resource.name}</strong>?</p>
          </div>
          <div class="form__control form__control--actions">
            <button type="button" className="button button--reversed" onClick={ this.props.closeEvent }>Cancel</button>
            <button type="button" className={ classes } onClick={ this.deleteResource }>Delete</button>
          </div>
        </div>
      </form>
    )
  }
}

export default withTheme(EventDeleteLocation)