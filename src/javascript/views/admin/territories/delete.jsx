// React
import React from 'react'
import { withRouter } from 'react-router-dom'

import Button from 'javascript/components/button'
import NavLink from 'javascript/components/nav-link'
// Actions
import ResourceActions from 'javascript/actions/territory'

class TerritoryDeleteFrom extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }

  deleteTerritory = () => {
    this.setState({ loading: true })
    const { territory } = this.props
    ResourceActions.deleteResource(territory)
  }

  redirectToUsers = () => {
    this.props.closeEvent()
    this.props.history.push({
      pathname: `/admin/users`,
      state: {
        filterState: { 'filter[territories]': this.props.territory.id }
      }
    })
  }

  renderDeleteForm = () => {
    const { territory, closeEvent } = this.props
    let buttonClasses = this.state.loading ? 'button button--filled button--reversed button--loading' : 'button button--filled button--reversed'
    if(territory['users-count'] > 0) {
      return (
        <div className="u-align-center">
          <p>This territory is assigned to { territory['users-count'] } user(s). Please unassign all <a onClick={this.redirectToUsers}>users</a> first.</p>
          <Button type="button" className="button button--reversed" onClick={ closeEvent }>Cancel</Button>
        </div>
      )
    } else {
      return (
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete the territory <strong>{ territory.name }</strong>?</p>
          </div>
          <div class="cms-form__control cms-form__control--actions">
            <Button type="button" className="button button--reversed" onClick={ closeEvent }>Cancel</Button>
            <Button type="button" className={ buttonClasses } onClick={this.deleteTerritory}>Delete</Button>
          </div>
        </div>
      )
    }
  }

  render() {
    return (
      <form className="cms-form" onSubmit={ this.deleteTerritory }>
        { this.props.territory && this.renderDeleteForm() }
      </form>
    )
  }
}

export default withRouter(TerritoryDeleteFrom)