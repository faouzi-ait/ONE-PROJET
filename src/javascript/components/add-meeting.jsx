import React from 'react'
import NavLink from 'javascript/components/nav-link'
import HelperComponent from 'javascript/components/helper'
import withTheme from 'javascript/utils/theme/withTheme'

import 'stylesheets/core/components/add-meeting'

import Icon from 'javascript/components/icon'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'

class AddMeeting extends HelperComponent {
  constructor(props) {
    super(props)
    this.resourceName = 'add-meeting'
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  render() {
    const { variables } = this.props.theme
    return (
      <NavLink className={this.state.classes} {...this.props} to={{
        pathname: `/${variables.SystemPages.account.path}/${variables.SystemPages.meeting.path}/new`,
        state: {
          slot: this.props.slot,
          event: this.props.event
        }
      }}>
        <ClientChoice>
          <ClientSpecific client="default">
            <Icon id="i-add" classes="add-meeting__icon" />
          </ClientSpecific>
          <ClientSpecific client="keshet">
            <Icon width="32" height="32" id="i-add" viewBox="0 0 32 32" classes="add-meeting__icon" />
          </ClientSpecific>
          <ClientSpecific client="amc">
            <Icon width="24" height="24" viewBox="0 0 32 32" id="i-add" className="add-meeting__icon" />
          </ClientSpecific>
        </ClientChoice>
      </NavLink>
    )
  }
}

export default withTheme(AddMeeting)