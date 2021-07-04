import React from 'react'

// Store
import Store from 'javascript/stores/talents'

//Actions
import Actions from 'javascript/actions/talents'

// Components
import Button from 'javascript/components/button'
import FormHelper from 'javascript/views/form-helper'
import FormControl from 'javascript/components/form-control'

export default class TalentsForm extends FormHelper {

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

  renderForm = () => {
    const {isLoading, resource, types} = this.state
    const buttonClasses = ['button', 'filled', isLoading && 'loading'].join(' button--')

    return (
      <div>
        <FormControl type="text" label="First Name" name="firstname" value={resource['firstname']} onChange={this.handleInputChange} />
        <FormControl type="text" label="Last Name" name="surname" value={resource['surname']} onChange={this.handleInputChange} />

        {this.renderErrors()}
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={ buttonClasses }>Save { this.resourceName }</Button>
        </div>
      </div>
    )
  }
}