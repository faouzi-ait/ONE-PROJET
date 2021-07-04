import React from 'react'

import Actions from 'javascript/actions/collections'
import Store from 'javascript/stores/collections'

import withTheme from 'javascript/utils/theme/withTheme'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import compose from 'javascript/utils/compose'
import collectionClientVariables from 'javascript/views/pages/collection/variables'

import Button from 'javascript/components/button'
import CustomCheckbox from 'javascript/components/custom-checkbox'
import FormControl from 'javascript/components/form-control'
import FormHelper from 'javascript/views/form-helper'
import Select from 'react-select'

class CollectionsForm extends FormHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = 'Collection'
    this.state = {
      resource: props.resource,
      method: props.method
    }
  }

  updateBool = (e) => {
    this.setState({
      resource: {
        ...this.state.resource,
        [e.target.name]: !this.state.resource[e.target.name]
      }
    })
  }

  handleTitleChange = (e) => {
    const update = this.state.resource
    update[e.target.name] = e.target.value
    update.slug = e.target.value.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')
    this.setState({
      resource: update
    })
  }

  handleSlugChange = (e) => {
    const update = this.state.resource
    update.slug = e.target.value.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')
    this.setState({
      resource: update
    })
  }

  handleBannerChange = (e) => {
    this.setState({
      resource: {
        ...this.state.resource,
        'banner-text-color': e.target.value
      }
    })
  }

  updateResource = (e) => {
    e.preventDefault()
    const resource = this.state.resource
    delete resource['pages-count']
    delete resource['pages']
    this.setState({ isLoading: true })
    this.actions.updateResource(resource)
  }

  renderForm = () => {
    const { method, theme, collectionCV } = this.props
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    return (
      <div>
        <FormControl type="text" name="title" label="Title" value={ this.state.resource.title } required onChange={ this.handleTitleChange } />
        <FormControl type="text" name="slug" label="Slug" value={ this.state.resource.slug } required onChange={ this.handleSlugChange } />
        <FormControl type="text" name="banner-text-color" label="Banner Text Color" value={ this.state.resource['banner-text-color'] } onChange={ this.handleBannerChange } />
        <FormControl type="textarea" name="introduction" label="Introduction" value={ this.state.resource.introduction } maxLength="255" onChange={ this.handleInputChange } />
        <FormControl label="Default Sort Order">
          <Select options={collectionCV.defaultOrder}
            value={this.state.resource['default-order'] || 0}
            multi={false}
            clearable={false}
            searchable={false}
            simpleValue={true}
            onChange={(value) => {
              this.handleInputChange({
                target: {
                  name: 'default-order',
                  value
                }
              })
            }}
          />
        </FormControl>
        <FormControl>
          <div className="cms-form__collection">
            <CustomCheckbox label="Enable Sharing" id="shareable" name="shareable" onChange={ this.updateBool } checked={ this.state.resource.shareable } />
          </div>
        </FormControl>
        <FormControl>
          <div class="cms-form__collection">
          <CustomCheckbox label="Enable Sorting" id="sortable" name="sortable" onChange={ this.updateBool } checked={ this.state.resource.sortable } />
          </div>
        </FormControl>
        <FormControl>
          <div className="cms-form__collection">
            <CustomCheckbox label="Published" id="published" name="published" onChange={ this.updateBool } checked={ this.state.resource.published } />
          </div>
        </FormControl>
        <FormControl>
          <div className="cms-form__collection">
            <CustomCheckbox label="Display in Main Navigation" id="show-in-nav" name="show-in-nav" onChange={ this.updateBool } checked={ this.state.resource['show-in-nav'] } />
          </div>
        </FormControl>
        {theme.features.navigation.centeredNav &&
          <FormControl>
            <div className="cms-form__collection">
              <CustomCheckbox label="Display in Featured Navigation" id="show-in-featured-nav" name="show-in-featured-nav" onChange={ this.updateBool } checked={ this.state.resource['show-in-featured-nav'] } />
            </div>
          </FormControl>
        }
        {theme.features.navigation.megaNav &&
          <FormControl>
            <div className="cms-form__collection">
              <CustomCheckbox label="Display in Mega Navigation" id="show-in-mega-nav" name="show-in-mega-nav" onChange={ this.updateBool } checked={ this.state.resource['show-in-mega-nav'] } />
            </div>
          </FormControl>
        }
        <FormControl>
          <div className="cms-form__collection">
            <CustomCheckbox label="Display in Footer Navigation" id="show-in-footer" name="show-in-footer" onChange={ this.updateBool } checked={ this.state.resource['show-in-footer'] } />
          </div>
        </FormControl>
        { this.renderErrors() }
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={ buttonClasses }>Save Collection</Button>
        </div>
      </div>
    )
  }

  renderDeleteForm = () => {
    const { resource } = this.state
    const buttonClasses = ['button', 'filled', 'reversed', this.state.isLoading && 'loading'].join(' button--')
    if (resource['pages-count'] > 0) {
      return (
        <div>
          <div className="cms-form__control">
            <p>There { resource['pages-count'] === 1 ? 'is' : 'are' } { resource['pages-count'] } { resource['pages-count'] === 1 ? 'page' : 'pages' } belonging to this collection. Please remove all child pages first.</p>
          </div>
          <div class="cms-form__control cms-form__control--actions">
            <Button type="button" className="button button--reversed" onClick={ this.props.closeEvent }>Cancel</Button>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete the { this.resourceName } <strong>{ resource.title }</strong>?</p>
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


const enhance = compose(
  withTheme,
  withClientVariables('collectionCV', collectionClientVariables)
  )

  export default enhance(CollectionsForm)