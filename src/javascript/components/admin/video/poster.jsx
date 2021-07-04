import React from 'react'
import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'

// Stores
import ImagesStore from 'javascript/stores/video-images'
import VideoStore from 'javascript/stores/videos'
// Actions
import VideoActions from 'javascript/actions/videos'
import ImageActions from 'javascript/actions/video-images'

import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import Span from 'javascript/components/span'

class VideoPoster extends React.Component {
  state = {
    resource: {
      ...this.props.resource,
      path: 'No file chosen'
    }
  }

  componentWillMount() {
    ImagesStore.on('imagesUploaded', this.props.closeEvent)
    VideoStore.on('change', this.updateImage)
  }

  componentWillUnmount() {
    ImagesStore.removeListener('imagesUploaded', this.props.closeEvent)
    VideoStore.removeListener('change', this.updateImage)
  }

  handleFileChange = (e) => {
    const input = this.input
    if (input.files && input.files[0]) {
      const reader = new FileReader()

      const file = new Blob([input.files[0]], {type: input.files[0].type});
      file.name = input.files[0].name.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '');
      const now = Date.now();
      file.lastModifiedDate = new Date(now);
      file.lastModified = now

      reader.onload = (e) => {
        this.setState({
          resource: {
            ...this.state.resource,
            preview: e.target.result,
            file,
            path: file.name
          }
        })
      }
      reader.readAsDataURL(input.files[0])
    }
  }

  uploadImage = (e) => {
    e.preventDefault()
    if (!this.state.resource.file) {
      this.props.closeEvent()
    } else {
      this.setState({ loading: true })
      ImageActions.uploadImages(this.state.resource, this.state.resource.id)
    }
  }

  removeImage = (confirmNeeded = false) => {
    if (confirmNeeded) {
      const confirmed = window.confirm('This action is irreversible. Do you wish to remove this image?')
      if (!confirmed) return
    }
    const update = {
      id: this.state.resource.id,
      'remove-poster': true
    }

    this.setState({ loading: true })
    VideoActions.updateResource(update)
  }

  updateImage = () => {
    const {resource} = this.props
    resource['poster'] = null
    resource['preview'] = null
    resource['path'] = 'No file chosen'
    this.setState({
      loading: false,
      resource
    })
  }

  render() {
    const { resource } = this.state
    const classes = ['button', 'filled', this.state.loading && 'loading'].join(' button--')
    return (
      <form className="cms-form cms-form--large" onSubmit={ this.uploadImage }>
        <div className="file-input">
          {(resource.preview || this.state.resource.poster?.admin_preview?.url) &&
            <Button type="button" className="file-input__remove" onClick={this.removeImage}>
              <Icon id="i-close" />
            </Button>
          }
          <div className="file-input__preview">
            <img src={resource.preview || this.state.resource.poster?.admin_preview?.url} />
          </div>
        </div>
        <p>560 x 320px</p>
        {this.props.videoProviders.brightcove && this.state.resource['brightcove-id'] &&
          <p>Deleting this Brightcove image will cause a new image to be regenerated from Brightcove</p>
        }
        <div className="file-input">
          <input type="file"
            ref={input => this.input = input}
            accept={this.props.theme.features.acceptedFileTypes.gallery}
            className="file-input__input"
            onChange={this.handleFileChange}
          />
          <Span className="button button--filled button--small" classesToPrefix={['button']}>
            Select an Image
          </Span>
          <p className="file-input__path">{resource.path}</p>
        </div>
        <div className="cms-form__control cms-form__control--actions">
          <Button type="button" onClick={this.props.closeEvent} className="button">Cancel</Button>
          <Button type="submit" className={classes}>Upload Image</Button>
        </div>
      </form>
    )
  }
}

const enhance = compose(
  withTheme,
  withVideoProviders
)

export default enhance(VideoPoster)