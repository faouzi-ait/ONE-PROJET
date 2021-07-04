import React from 'react'

// Store
import Store from 'javascript/stores/talent-types'

//Actions
import Actions from 'javascript/actions/talent-types'

// Components
import FormHelper from 'javascript/views/form-helper'

export default class TalentTypeForm extends FormHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = props.type
    this.state = {
      resource: props.resource,
      method: props.method
    }
  }
  
}