import React from 'react'
import FormHelper from 'javascript/views/form-helper'
import Store from 'javascript/stores/qualities'
import Actions from 'javascript/actions/qualities'
import FormControl from 'javascript/components/form-control'

export default class QualitiesForm extends FormHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = 'Quality'
    this.state = {
      resource: props.resource,
      method: props.method
    }
  }

}