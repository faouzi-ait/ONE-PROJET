import React from 'react'

import Button from 'javascript/components/button'
import FormHelper from 'javascript/views/form-helper'
import NavLink from 'javascript/components/nav-link'
import Store from 'javascript/stores/marketing-categories'
import Actions from 'javascript/actions/marketing-categories'


export default class MarketingCategoriesForm extends FormHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = 'Marketing Category'
    this.state = {
      resource: props.resource,
      method: props.method
    }
  }

  updateResource = (e) => {
    e.preventDefault()
    this.setState({ isLoading: true })
    const { resource } = this.state
    delete resource['marketing-activities-count']
    this.actions.updateResource(resource)
  }

  renderDeleteForm = () => {
    const { resource } = this.state
    const buttonClasses = ['button', 'filled', 'reversed', this.state.isLoading && 'loading'].join(' button--')
    if (resource['marketing-activities-count'] > 0) {
      return (
        <div className="u-align-center">
          <p>This {this.resourceName} has {resource['marketing-activities-count']} {resource['marketing-activities-count'] === 1 ? 'activity' : 'activities'}. Please delete all <NavLink to={`/admin/marketing/activities`}>activities</NavLink> associated with this {this.resourceName} first.</p>
          <Button type="button" className="button button--reversed" onClick={this.props.closeEvent}>Cancel</Button>
        </div>
      )
    } else {
      return (
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete the {this.resourceName} <strong>{resource.name}</strong>?</p>
          </div>
          <div class="cms-form__control cms-form__control--actions">
            <Button type="button" className="button button--reversed" onClick={this.props.closeEvent}>Cancel</Button>
            <Button type="submit" className={buttonClasses}>Delete</Button>
          </div>
        </div>
      )
    }
  }

}