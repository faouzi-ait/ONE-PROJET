import React from 'react'
import pluralize from 'pluralize'
// State
import Store from 'javascript/stores/episodes'
import Actions from 'javascript/actions/episodes'
// Hoc
import withTheme from 'javascript/utils/theme/withTheme'
// Components
import Button from 'javascript/components/button'
import Editor from 'javascript/components/wysiwyg'
import FormControl from 'javascript/components/form-control'
import FormHelper from 'javascript/views/form-helper'
import NavLink from 'javascript/components/nav-link'


class EpisodeForm extends FormHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = 'Episode'
    this.state = {
      resource: props.resource,
      method: props.method
    }
  }

  updateResource = (e) => {
    e.preventDefault()
    const { resource } = this.state
    this.setState({ isLoading: true })
    delete resource['videos-count']
    delete resource['videos']
    this.actions.updateResource(resource)
  }

  renderDeleteForm = () => {
    const { resource } = this.state
    const { theme } = this.props
    const buttonClasses = ['button', 'filled', 'reversed', this.state.isLoading && 'loading'].join(' button--')
    if (resource['videos-count'] > 0) {
      return (
        <div className="u-align-center">
          <p>This episode has {resource['videos-count']} video(s). Please delete all <NavLink to={`/admin/${theme.localisation.programme.path}/${this.props.params.programme}/${theme.localisation.series.path}/${resource.series.id}/episodes/${resource.id}/${theme.localisation.video.path}`}>videos</NavLink> first.</p>
          <Button type="button" className="button button--reversed" onClick={this.props.closeEvent}>Cancel</Button>
        </div>
      )
    } else {
      return (
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete the episode <strong>{resource.name}</strong>?</p>
          </div>
          <div class="cms-form__control cms-form__control--actions">
            <Button type="button" className="button button--reversed" onClick={this.props.closeEvent}>Cancel</Button>
            <Button type="submit" className={buttonClasses}>Delete</Button>
          </div>
        </div>
      )
    }
  }

  renderForm = () => {
    const { method, theme } = this.props
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    const easytrack =
      theme.features.rightsManagement &&
      theme.features.rightsManagement.includes('easytrack')
    return (
      <div>
        <FormControl type="text" name="name" label="Name" value={this.state.resource.name} required onChange={this.handleInputChange} />
        {this.state.resource.id &&
          <FormControl
            key="external_id"
            type="text"
            label={easytrack ? 'EasyTrack ID' : 'External ID'}
            name="external-id"
            readonly
            value={this.state.resource['external-id'] || ''}
          />
        }
        {theme.features.programmeOverview.episodes &&
          <FormControl label="Description">
          <Editor
            value={this.state.resource.description || ''}
            onChange={(value) => { this.handleInputChange({ target: { name: 'description', value: value } }) }}
          />
          </FormControl>
        }
        {this.renderErrors()}
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={buttonClasses}>Save {this.resourceName}</Button>
        </div>
      </div>
    )
  }

}

export default withTheme(EpisodeForm)