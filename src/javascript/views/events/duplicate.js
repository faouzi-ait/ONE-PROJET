import React from 'react'

import Actions from 'javascript/actions/events'

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }

  duplicateEvent = () => {
    this.setState({
      loading: true
    })
    Actions.duplicate(this.props.resource.id)
  }

  render() {
    let classes = ['button', 'filled', this.state.loading && 'loading'].join(' button--')
    return (
      <form className="form" onSubmit={ this.duplicateEvent }>
        <div>
          <div className="form__control">
            <p>Are you sure you want to send invites for the event <strong>{this.props.resource.title}</strong>?</p>
          </div>
          <div class="form__control form__control--actions">
            <button type="button" className="button" onClick={ this.props.closeEvent }>Cancel</button>
            <button type="button" className={ classes } onClick={ this.duplicateEvent }>Duplicate Event</button>
          </div>
        </div>
      </form>
    )
  }
}