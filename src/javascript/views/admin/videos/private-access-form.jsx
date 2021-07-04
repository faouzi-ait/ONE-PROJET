import React from 'react'
import moment from 'moment'

import withTheme from 'javascript/utils/theme/withTheme'

import PrivateVideoActions from 'javascript/actions/private-video-access'
import PrivateVideoStore from 'javascript/stores/private-video-access'

import Button from 'javascript/components/button'
import DatePicker from 'javascript/components/datepicker'
import FormControl from 'javascript/components/form-control'
import FormHelper from 'javascript/views/form-helper'

class PrivateVideoAccessFormIndex extends FormHelper {

  constructor(props) {
    super(props)
    this.actions = PrivateVideoActions
    this.resourceName = 'Private Video Access'
    this.edit = props.resource.slug
    this.state = {
      resource: props.resource
    }
  }

  componentWillMount() {
    PrivateVideoStore.on('save', this.getAccessCode)
  }

  componentWillUnmount() {
    PrivateVideoStore.removeListener('save', this.getAccessCode)
  }

  getAccessCode = () => {
    const [savedResource] = PrivateVideoStore.getResources()
    this.setState({
      savedResource,
      isLoading: false
    })
  }

  handleDateChange = (value) => {
    const {resource} = this.state
    this.setState({
      resource: {
        ...resource,
        'expiry-date': moment(value).toDate().toString()
      }
    })
  }

  renderForm = () => {
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    const {resource, savedResource} = this.state

    if (savedResource) {
      const url = `${window.location.origin}/video/${savedResource.slug}`
      return (
        <div>
          <FormControl type="text" name="slug" label="Slug" value={ savedResource.slug } readonly />
          <FormControl type="text" name="password" label="Password" value={ savedResource.password } readonly />
          <FormControl type="text" name="url" label="URL" value={ url } readonly />
          <div className="cms-form__control cms-form__control--actions">
            <Button type="button" className={ buttonClasses } onClick={ this.props.closeEvent }>Done</Button>
          </div>
        </div>
       )
    }
    return (
      <div>
        <FormControl label="Expiry Date">
          <DatePicker onChange={ this.handleDateChange }
            selected={ resource['expiry-date'] }
            dateFormat={this.props.theme.features.formats.longDate}
          />
        </FormControl>
        { this.renderErrors() }
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={ buttonClasses }>{this.edit ? 'Save' : 'Generate'} {this.resourceName }</Button>
        </div>
      </div>
    )
  }
}

export default withTheme(PrivateVideoAccessFormIndex)