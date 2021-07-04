import React from 'react'

import Actions from 'javascript/actions/events'
import moment from 'moment'

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }

  sendInvites = () => {
    this.setState({
      loading: true
    })
    Actions.sendInvites({
      id: this.props.resource.id,
      calendar: {id: 1},
      'invites-sent-at': moment.utc().format()
    })
  }

  render() {
    let classes = ['button', 'filled', this.state.loading && 'loading'].join(' button--')
    return (
      <form className="form" onSubmit={ this.sendInvites }>
        <div>
          <div className="form__control">
            <p>Are you sure you want to send invites for the event <strong>{this.props.resource.title}</strong>?</p>
          </div>
          <div class="form__control form__control--actions">
            <button type="button" className="button" onClick={ this.props.closeEvent }>Cancel</button>
            <button type="button" className={ classes } onClick={ this.sendInvites }>Send Invites</button>
          </div>
        </div>
      </form>
    )
  }
}