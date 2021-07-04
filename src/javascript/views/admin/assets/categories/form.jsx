import React from 'react'
import pluralize from 'pluralize'
import NavLink from 'javascript/components/nav-link'

import Button from 'javascript/components/button'
import FormHelper from 'javascript/views/form-helper'
import Store from 'javascript/stores/asset-categories'
import Actions from 'javascript/actions/asset-categories'
import FormControl from 'javascript/components/form-control'
import withTheme from 'javascript/utils/theme/withTheme'


class AssetCategoriesForm extends FormHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = `${props.theme.localisation.asset.upper} Category`
    this.state = {
      resource: props.resource,
      method: props.method
    }
  }

  updateResource = (e) => {
    e.preventDefault()
    const { resource } = this.state
    delete resource['asset-materials-count']
    delete resource['blocked']
    this.setState({ isLoading: true })
    this.actions.updateResource(resource)
  }

  renderDeleteForm = () => {
    const { resource } = this.state
    const { theme } = this.props
    const buttonClasses = ['button', 'filled', 'reversed', this.state.isLoading && 'loading'].join(' button--')
    if (resource['asset-materials-count'] > 0) {
      return (
        <div className="u-align-center">
          <p>This { this.resourceName } has { resource['asset-materials-count'] } { resource['asset-materials-count'] === 1 ? theme.localisation.asset.lower : pluralize(theme.localisation.asset.lower) }. Please delete all <NavLink to={ `/admin/${pluralize(theme.localisation.asset.lower)}/management` }>{ pluralize(theme.localisation.asset.lower) }</NavLink> associated with this { this.resourceName } first.</p>
          <Button type="button" className="button button--reversed" onClick={ this.props.closeEvent }>Cancel</Button>
        </div>
      )
    } else {
      return (
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete the { this.resourceName } <strong>{ resource.name }</strong>?</p>
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

export default withTheme(AssetCategoriesForm)