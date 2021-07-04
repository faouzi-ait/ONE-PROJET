import React from 'react'

import { capitalize } from 'javascript/utils/generic-tools'
import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

import { isAdmin } from 'javascript/services/user-permissions'

// Components
import Button from 'javascript/components/button'
import ContentBlocks from 'javascript/views/admin/pages/content-blocks'
import FormControl from 'javascript/components/form-control'
import NavLink from 'javascript/components/nav-link'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import { withRouter } from 'react-router-dom'
import withTheme from 'javascript/utils/theme/withTheme'

export class PassportContentsForm extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      content: {
        'active': false,
        'content-blocks': [],
        'description': '',
        'name': '',
        'market': {
          'id': props.marketId
        }
      },
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.resource !== prevProps.resource) {
      if (!this.props.resource || !Object.keys(this.props.resource).length) return
      this.setState({
        content: {
          ...this.props.resource,
          'market': {
            'id': this.props.marketId
          }
        }
      })
    }
  }

  handleInputChange = (e) => {
    let update = Object.assign({}, this.state.content)
    update[e.target.name] = e.target.value
    this.setState({
      content: update
    })
  }

  handleCheckboxChange = ({ target }) => {
    let update = Object.assign({}, this.state.content)
    update[target.name] = target.checked
    this.setState({
      content: update
    })
  }

  saveContent = (e) => {
    e.preventDefault()
    this.props.resetMutation()
    const update = Object.assign({}, this.state.content)
    if (this.props.isEditing) { // Update Existing User
      delete update['market']
      this.props.apiUpdateContent(update)
    } else { // Create New User
      this.props.apiCreateContent(update)
    }
  }

  renderErrors = () => {
    if (!this.props.apiErrors) return null
    return (
      <ul className="cms-form__errors">
        {Object.keys(this.props.apiErrors).map((key, i) => {
          const error = this.props.apiErrors[key]
          return (
            <li key={i}>{capitalize(key)} {error}</li>
          )
        })}
      </ul>
    )
  }

  updateContentBlockResource = (resource) => {
    if (this.props.isEditing) { // Update Existing
      this.props.apiUpdateContent(resource)
    } else { // Create New
      this.props.apiCreateContent(resource)
    }
  }

  render() {
    const { marketId, theme } = this.props
    const { content } = this.state

    const { isLoading, isEditing } = this.props
    const buttonText = isEditing ? `Save ${theme.localisation.passport.content.upper}` : `Create ${theme.localisation.passport.content.upper}`
    const buttonClasses = isLoading ? 'button button--filled button--loading' : 'button button--filled'

    return (
      <div className="container">
        <form className="cms-form cms-form--large" onSubmit={this.saveContent}>
          <FormControl type="text" label="Name" name="name" value={content.name} onChange={this.handleInputChange} required />
          <FormControl type="text" label="Description" name="description" value={content.description} onChange={this.handleInputChange} />
          <FormControl type="checkbox" label='Active' checkboxLabeless={true}
            id='active'
            name='active'
            onChange={this.handleCheckboxChange}
            checked={content['active']}
          />
          <div className="cms-form__control cms-form__control--actions">
            { this.renderErrors() }
            <NavLink to={`/admin/${theme.localisation.passport.market.path}/${marketId}/edit`} className="button">Cancel</NavLink>
            <Button type="submit" className={buttonClasses}>{buttonText}</Button>
          </div>
        </form>

        { this.props.contentId && (
          <ContentBlocks
            blockLocation={'passport'}
            isPageHeader={false}
            pages={null}
            resource={this.state.content}
            updateResource={this.updateContentBlockResource}
          />
        )}
      </div>
    )
  }
}

const enhance = compose(
  withRouter,
  withModalRenderer,
  withTheme,
  withHooks(props => {
    const { marketId, contentId } = props.match.params
    const relation = {
      'name': 'passport-market',
      'id': marketId
    }
    const contentsReduxResource = nameSpaced('passport', useReduxResource('passport-content', 'passport/contents', relation))

    useWatchForTruthy(contentsReduxResource.mutationState.succeeded, () => {
      if (!contentId) { // createContent - new content created - re-direct to edit content
        const newContentId = contentsReduxResource.mutationState.lastResource.id
        props.history.push(`/admin/${props.theme.localisation.passport.market.path}/${marketId}/content/${newContentId}/edit`)
      } else { // Content just saved
        props.modalState.hideModal()
      }
    })

    return {
      ...props,
      marketId,
      contentId,
      apiCreateContent: contentsReduxResource.createResource,
      apiUpdateContent: contentsReduxResource.updateResource,
      apiErrors: contentsReduxResource.mutationState.errors,
      isLoading: contentsReduxResource.mutationState.isLoading,
      resetMutation: contentsReduxResource.resetMutation,
    }
  })
)

export default enhance(PassportContentsForm)

