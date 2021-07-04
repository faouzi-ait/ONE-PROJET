import React from 'react'
import pluralize from 'pluralize'

import Store from 'javascript/stores/languages'
import Actions from 'javascript/actions/languages'
import withTheme from 'javascript/utils/theme/withTheme'

import Button from 'javascript/components/button'
import FormHelper from 'javascript/views/form-helper'
import FormControl from 'javascript/components/form-control'
import NavLink from 'javascript/components/nav-link'

class LanguagesForm extends FormHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = 'Language'
    this.state = {
      resource: props.resource,
      method: props.method
    }
  }

  updateResource = (e) => {
    e.preventDefault()
    const { resource } = this.state
    this.setState({ isLoading: true })
    this.actions.updateResource({
      id: resource.id,
      name: resource.name
    })
  }

  renderDeleteForm = () => {
    const { resource } = this.state
    const { theme } = this.props
    const buttonClasses = ['button', 'filled', 'reversed', this.state.isLoading && 'loading'].join(' button--')
    if (resource['programmes-count'] > 0) {
      return (
        <div className="u-align-center">
          <p>There { resource['programmes-count'] === 1 ? 'is' : 'are' } { resource['programmes-count'] } { resource['programmes-count'] === 1 ? theme.localisation.programme.lower : pluralize(theme.localisation.programme.lower) } with this language tag. Please remove this tag from all <NavLink to={ { pathname: `/admin/${theme.localisation.programme.path}/`} }>{ pluralize(theme.localisation.programme.lower) }</NavLink> first.</p>
          <Button type="button" className="button button--reversed" onClick={ this.props.closeEvent }>Cancel</Button>
        </div>
      )
    } else if (resource['videos-count'] > 0) {
      return (
        <div className="u-align-center">
          <p>There { resource['videos-count'] === 1 ? 'is' : 'are' } { resource['videos-count'] } { resource['videos-count'] === 1 ? theme.localisation.video.lower : pluralize(theme.localisation.video.lower) } with this language tag. Please remove this tag from all <NavLink to={ { pathname: `/admin/${theme.localisation.video.path}/`} }>{ pluralize(theme.localisation.video.lower) }</NavLink> first.</p>
          <Button type="button" className="button button--reversed" onClick={ this.props.closeEvent }>Cancel</Button>
        </div>
      )
    } else {
      return (
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete the language <strong>{ resource.name }</strong>?</p>
          </div>
          <div class="cms-form__control cms-form__control--actions">
            <Button type="button" className="button button--reversed" onClick={ this.props.closeEvent }>Cancel</Button>
            <Button type="submit" className={ buttonClasses }>Delete</Button>
          </div>
        </div>
      )
    }
  }

}

export default withTheme(LanguagesForm)