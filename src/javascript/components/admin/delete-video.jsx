// React
import React from 'react'
import pluralize from 'pluralize'

import withTheme from 'javascript/utils/theme/withTheme'
import ResourceActions from 'javascript/actions/videos'
import Button from 'javascript/components/button'


class DeleteVideo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false
    }
  }

  deleteResource = (resource) => {
    this.setState({ isLoading: true })

    let deleteCallback = () => {}
    ResourceActions.deleteResource(resource)
  }

  renderDeleteForm = () => {
    const { resource, closeEvent, theme } = this.props
    const buttonClasses = ['button', 'filled', 'reversed', this.state.isLoading && 'loading'].join(' button--')

    let deleteConfirmation = (
      <p>Are you sure you want to delete the {pluralize.singular(theme.localisation.video.lower)} <strong>{resource.name}</strong>?</p>
    )
    return (
      <div>
        <div className="cms-form__control">
          {deleteConfirmation}
        </div>
        <div class="cms-form__control cms-form__control--actions">
          <Button type="button" className="button button--reversed" onClick={closeEvent}>Cancel</Button>
          <Button type="button" className={buttonClasses} onClick={() => { this.deleteResource(resource) }}>Delete</Button>
        </div>
      </div>
    )
  }

  render() {
    return (
      <form className="cms-form" onSubmit={this.deleteResource}>
        {this.renderDeleteForm()}
      </form>
    )
  }
}

export default withTheme(DeleteVideo)