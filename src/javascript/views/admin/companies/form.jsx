import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'

import Button from 'javascript/components/button'
import FormHelper from 'javascript/views/form-helper'
import Store from 'javascript/stores/companies'
import Actions from 'javascript/actions/companies'
import FormControl from 'javascript/components/form-control'

class CompaniesForm extends FormHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = 'Company'
    this.state = {
      resource: props.resource,
      method: props.method
    }
  }

  updateResource = (e) => {
    e.preventDefault()
    this.setState({ isLoading: true })
    const { resource } = this.state
    delete resource[ 'users-count' ]
    this.actions.updateResource(resource)
  }

  /* #region  banijaygroup */
  renderForm = () => {
    const { method } = this.props
    const buttonClasses = [ 'button', 'filled', this.state.isLoading && 'loading' ].join(' button--')
    return (
      <div>
        <FormControl type="text" name="name" label="Name" value={this.state.resource.name} required onChange={this.handleInputChange} />
        <FormControl type="text" name="company-type" label="Company Type" value={this.state.resource[ 'company-type' ]} required onChange={this.handleInputChange} />
        {this.renderErrors()}
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={buttonClasses}>Save {this.resourceName}</Button>
        </div>
      </div>
    )
  }
  /* #endregion */

  renderDeleteForm = () => {
    const { resource } = this.state
    const buttonClasses = [ 'button', 'filled', 'reversed', this.state.isLoading && 'loading' ].join(' button--')
    if (resource[ 'users-count' ] > 0) {
      return (
        <div className="u-align-center">
          <p>This company has {resource[ 'users-count' ]} user(s). Please delete all <NavLink to={{ pathname: '/admin/users/', query: { 'filter[company]': resource.id } }}>users</NavLink> first.</p>
          <Button type="button" className="button button--reversed" onClick={this.props.closeEvent}>Cancel</Button>
        </div>
      )
    } else {
      return (
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete the company <strong>{resource.name}</strong>?</p>
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

export default CompaniesForm

/*
*  CompaniesForm is rendered in CMS by an index page
*  IndexHelper inheritance :( handles change events to unsetModal etc..
*  This UseCompanyForm provides a wrapper to inject onChange event handlers to replace
*  inheritance functionality.. This is required so this form can be used by Approvals
*/

export const UseCompanyForm = (props) => {
  const onChange = () => {
    const resources = Store.getResources()
    const lastResource = resources.length ? resources[0] : null
    props.onChange(lastResource)
  }
  useEffect(() => {
    Store.on('change', onChange)
    return () => {
      Store.removeListener('change', onChange)
    }
  }, [])

  return (
    <CompaniesForm {...props} />
  )
}