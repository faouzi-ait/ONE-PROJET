// React
import React from 'react'
import { withRouter } from 'react-router-dom'

import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'

import Button from 'javascript/components/button'
import NavLink from 'javascript/components/nav-link'

class RegionDeleteFrom extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }

  deleteRegion = () => {
    this.setState({ loading: true })
    this.props.deleteResource(this.props.region)
  }

  redirectToUsers = () => {
    this.props.closeEvent()
    this.props.history.push({
      pathname: `/admin/users`,
      state: {
        filterState: { 'filter[regions]': this.props.region.id }
      }
    })
  }

  renderDeleteForm = () => {
    const { region, closeEvent, theme } = this.props
    let buttonClasses = this.state.loading ? 'button button--filled button--reversed button--loading' : 'button button--filled button--reversed'
    if (region['users-count'] > 0) {

      return (
        <div className="u-align-center">
          <p>
            This {theme.localisation.region.lower} is assigned to { region['users-count'] } user(s). Please unassign all <a onClick={this.redirectToUsers}>users</a> first.
          </p>
          <Button type="button" className="button button--reversed" onClick={ closeEvent }>Cancel</Button>
        </div>
      )
    } else {
      return (
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete the {theme.localisation.region.lower} <strong>{ region.name }</strong>?</p>
          </div>
          <div class="cms-form__control cms-form__control--actions">
            <Button type="button" className="button button--reversed" onClick={ closeEvent }>Cancel</Button>
            <Button type="button" className={ buttonClasses } onClick={this.deleteRegion}>Delete</Button>
          </div>
        </div>
      )
    }
  }

  render() {
    return (
      <form className="cms-form" onSubmit={ this.deleteRegion }>
        { this.props.region && this.renderDeleteForm() }
      </form>
    )
  }
}

const enhance = compose(
  withTheme,
  withRouter
)
export default enhance(RegionDeleteFrom)