import React from 'react'

import Button from 'javascript/components/button'
import withTheme from 'javascript/utils/theme/withTheme'
// Actions
import ResourceActions from 'javascript/actions/videos'
// Store
import ResourceStore from 'javascript/stores/videos'

class DeleteVideoForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false
    }
  }

  componentWillMount() {
    ResourceStore.on('change', this.onChange)
  }

  componentWillUnmount() {
    ResourceStore.removeListener('change', this.onChange)
  }

  onChange = () => {
    this.props.closeEvent()
    this.props.onSave()
  }

  deleteResource = (resource) => {
    this.setState({ isLoading: true })
    ResourceActions.deleteResource(resource, (response) => {
      this.setState({
        notification: response.message,
        loading: false
      })
    })
  }

  renderDeleteForm = () => {
    const { resource, closeEvent, theme } = this.props
    const buttonClasses = ['button', 'filled', 'reversed', this.state.isLoading && 'loading'].join(' button--')
    const videoTxt = theme.localisation.video
    return (
      <div>
        <div className="cms-form__control">
          {this.state.notification ? (
            <p>{this.state.notification}</p>
          ) : (
              <div>
                <p>{`Are you sure you want to delete the ${videoTxt.lower}`} <strong>{resource.name}</strong>?</p>
                {resource['promo-video-programmes-count'] > 0 &&
                  <p>{`This ${videoTxt.lower} is being used as a promo ${theme.localisation.video.lower}. If you delete it, it will be removed from the ${theme.localisation.programme.lower}.`}</p>
                }
                {resource['video-banner-programmes-count'] > 0 &&
                  <p>{`This ${videoTxt.lower} is being used as a ${theme.localisation.video.lower} banner. If you delete it, it will be removed from the banner.`}</p>
                }
              </div>
            )
          }
        </div>
        <div class="cms-form__control cms-form__control--actions">
          {this.state.notification ? (
            <Button type="button" className="button button--reversed" onClick={() => { ResourceActions.resourceDeleted(resource) }}>Ok</Button>
          ) : (
              <Button type="button" className="button button--reversed" onClick={closeEvent}>Cancel</Button>
            )}
          {!this.state.notification &&
            <Button type="button" className={buttonClasses} onClick={() => { this.deleteResource(resource) }}>Delete</Button>
          }
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

export default withTheme(DeleteVideoForm)