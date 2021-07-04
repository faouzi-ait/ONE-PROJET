import React from 'react'

import Actions from 'javascript/actions/meetings'

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
      <form className="form">
        <div>
          <div className="form__control">
            <p>Are you sure you wish to cancel the meeting <strong>{this.props.resource.title}</strong>?</p>
          </div>
          <div class="form__control form__control--actions">
            <button type="button" className="button button--reversed" onClick={ this.props.closeEvent }>Back</button>
            <button type="button" className={ classes } onClick={ this.deleteResource }>Cancel Meeting</button>
          </div>
        </div>
      </form>
    )
  }
}