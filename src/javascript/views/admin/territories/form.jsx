import React from 'react'
import FormHelper from 'javascript/views/form-helper'
import Store from 'javascript/stores/territory'
import Actions from 'javascript/actions/territory'

export default class TerritoryForm extends FormHelper {
  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = 'Territory'
    this.state = {
      resource: props.resource,
      method: props.method
    }
  }

  updateResource = (e) => {
    e.preventDefault()
    this.setState({ isLoading: true })
    // users relationship is empty here (because there is no need to fetch users)
    // so to avoid incorrect update it is better to be explicit
    const {id, name} = this.state.resource
    this.actions.updateResource({ id, name })
  }
}
