import React from 'react'

import Actions from 'javascript/actions/calendar-event-meal-slots'

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
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
    return (
      <form className="form" onSubmit={ this.deleteResource }>
        <div>
          <div className="form__control">
            <p>Are you sure you want to delete this meal slot <strong>{this.props.resource['start-hour-and-minute']} - {this.props.resource['end-hour-and-minute']}</strong>?</p>
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