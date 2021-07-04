import React from 'react'

import Actions from 'javascript/actions/events'

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
    Actions.deleteResource(this.props.resource)
  }

  render() {
    let classes = ['button', 'filled', 'reversed', this.state.loading && 'loading'].join(' button--')
    return (
      <form className="form" onSubmit={ this.deleteResource }>
        <div>
          <div className="form__control">
            <p>Are you sure you want to delete <strong>{this.props.resource.title}</strong>?</p>
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