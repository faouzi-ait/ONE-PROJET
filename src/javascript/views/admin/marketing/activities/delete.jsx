// React
import React from 'react'

// Actions
import MarketingActivitiesActions from 'javascript/actions/marketing-activities'

import Button from 'javascript/components/button'

export default class MarketingActivityDeleteFrom extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }

  deleteActivity = (activity) => {
    this.setState({ loading: true })
    MarketingActivitiesActions.deleteResource(activity)
  }

  renderDeleteForm = () => {
    const { deleteActivity, closeEvent } = this.props
    let buttonClasses = this.state.loading ? 'button button--filled button--reversed button--loading' : 'button button--filled button--reversed'
    if (deleteActivity) {
      return (
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete this Activity?</p>
          </div>
          <div class="cms-form__control cms-form__control--actions">
            <Button type="button" className="button button--reversed" onClick={closeEvent}>Cancel</Button>
            <Button type="button" className={buttonClasses} onClick={() => { this.deleteActivity(deleteActivity) }}>Delete</Button>
          </div>
        </div>
      )
    }
  }

  render() {
    return (
      <form className="cms-form" onSubmit={this.deleteActivity}>
        {this.renderDeleteForm()}
      </form>
    )
  }
}