// React
import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import compose from 'javascript/utils/compose'
import useUsedImageIdState from 'javascript/views/admin/pages/content-blocks/use-used-image-id-state'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'

import Button from 'javascript/components/button'
import Modal from 'javascript/components/modal'
import Icon from 'javascript/components/icon'
import Dropzone from 'react-dropzone'
import Toggle from 'javascript/components/toggle'
import ProgrammePagesFileManager from 'javascript/components/admin/filemanager/programme-pages'
import RelatedResourceFileManager from 'javascript/components/admin/filemanager/related-resource-file-manager'

class FileManager extends Component { // remains a class component as it has a forwarded ref
  constructor(props) {
    super(props)
  }
  render() {
    let StateComponent
    let relatedResourceType
    switch (this.props.type) {
      case 'news': {
        relatedResourceType = 'news-article'
        StateComponent = RelatedResourceFileManager
        break
      }
      case 'customCatalogue': {
        relatedResourceType = 'catalogue'
        StateComponent = RelatedResourceFileManager
        break
      }
      case 'collection': {
        relatedResourceType = 'collection'
        StateComponent = RelatedResourceFileManager
        break
      }
      default: {
        StateComponent = ProgrammePagesFileManager
        break
      }
    }
    return (
      <StateComponent {...this.props}
        renderUI={(injetedProps) => <EnhancedFileManagerUI {...this.props} {...injetedProps} /> }
        relatedResourceType={relatedResourceType}
      />
    )
  }
}

export default withTheme(FileManager)


class FileManagerUI extends Component {
  constructor(props) {
    super(props)
  }

  componentDidUpdate(prevProps) {
    const { images, uploading, isLoading, deleting } = this.props
    if (images !== prevProps.images && !uploading && !isLoading && !deleting) {
      this.unsetConfirmation()
    }
  }

  confirmDeleteFile = (id) => {
    const { id: resourceId, type, selectedImages, usedImageIds } = this.props
    const selected = selectedImages.includes(id)
    const used = usedImageIds({ type, resourceId }).includes(id)
    this.props.setConfirmation(() => {
      const buttonClasses = this.props.deleting ? 'button button--filled button--reversed button--loading' : 'button button--filled button--reversed'
      return (
        <Modal
          ref="confirmation"
          closeEvent={this.unsetConfirmation}
          title="Warning"
          modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
          <div className="cms-modal__content">
            {used && !selected &&
              <div className="cms-form__control u-align-center">
                <p>This image has been used elsewhere, therefore cannot be deleted</p>
              </div>
            }
            {selected &&
              <div className="cms-form__control u-align-center">
                <p>This image is currently selected to be used, therefore cannot be deleted</p>
              </div>
            }
            {!used && !selected &&
              <div>
                <div className="cms-form__control u-align-center">
                  <p>Are you sure you wish to delete this image?</p>
                </div>
                <div class="cms-form__control cms-form__control--actions">
                  <Button type="button" className="button button--reversed" onClick={this.unsetConfirmation}>Cancel</Button>
                  <Button type="button" className={buttonClasses} onClick={() => { this.props.deleteFile(id) }}>Yes, Delete!</Button>
                </div>
              </div>
            }
          </div>
        </Modal>
      )
    })
  }

  unsetConfirmation = () => {
    if (this.refs.confirmation) {
      ReactDOM.findDOMNode(this.refs.confirmation).classList.add('modal--is-hiding')
      setTimeout(() => {
        this.props.setConfirmation(() => {})
      }, 500)
    }
  }

  selectFile = (id) => {
    let update = [...this.props.selectedImages]
    if (this.props.multiple) {
      if (update.includes(id)) {
        update = selectedImages.filter(currId => currId !== id)
      } else {
        update.push(id)
      }
    } else {
      update = this.props.selectedImages.includes(id) ? [] : [id]
    }
    this.props.setSelectedImages(update)
  }

  setSelection = () => {
    const { id: resourceId, forceAddImages, index, images, selectedImages, type, updateUsedImageIds } = this.props
    const imageNames = images.filter(img => selectedImages.includes(img.id)).map(img => img.filename)
    if (forceAddImages) {
      // Images added from NestedBlock cannot use hooks because NestedBlock is only ever an Inherited Class
      // This flag makes a fake block and forces the imageIds into state. (Not ideal, feel free to update)
      updateUsedImageIds({
        type,
        resourceId,
        block: {
          images: [{
            imageIds: selectedImages
          }]
        }
      })
    }
    if (this.props.index > -1) {
      this.props.onConfirm(selectedImages, imageNames, index)
    } else {
      this.props.onConfirm(selectedImages, imageNames)
    }
  }

  render() {
    const dropzoneClass = this.props.uploadError ? 'dropzone dropzone--small dropzone--error' : 'dropzone dropzone--small'
    return (
      <div className="cms-modal cms-modal--large file-manager">
        <div className="cms-modal__wrapper">
          <div className="cms-modal__header">
            <h3 className="cms-heading--two cms-modal__title">Page Image Manager</h3>
          </div>
          <Button className="cms-modal__close" type="button" onClick={this.props.closeEvent}>
            <Icon id="i-close" />
          </Button>
          {this.props.isLoading &&
            <div className="file-manager__wrapper file-manager__wrapper--loading">
              <div className="loader"></div>
            </div>
          }
          {!this.props.isLoading &&
            <div>
              <div className="file-manager__uploader">
                <Dropzone onDropAccepted={this.props.uploadFiles}
                  style={{}}
                  className={dropzoneClass}
                  accept={this.props.theme.features.acceptedFileTypes.gallery}
                  maxSize={524288000}
                  onDropRejected={() => {
                    this.props.setUploadError('Files were rejected, please ensure you are uploading images and they are smaller than 500Mb ')
                  }}
                >
                  {({getRootProps, getInputProps}) => (
                    <div className={dropzoneClass } { ...getRootProps() }>
                      <div className="dropzone__label" >
                        { this.props.uploading ? (
                          <span>{this.props.progress}%</span>
                        ) : (
                            <span>+ Click / Drag images to upload</span>
                        )}
                        {this.props.uploadError &&
                          <p className="dropzone__error">{this.props.uploadError}</p>
                        }
                      </div>
                      <input {...getInputProps()} />
                    </div>
                  )}
                </Dropzone>
                {this.props.images?.length < 1 && !this.props.isLoading &&
                  <p>No images available for this page, please upload some.</p>
                }
              </div>
              {this.props.selectedImages.length > 0 &&
                <div className="file-manager__actions">
                  <Button className="button button--filled" type="button" onClick={this.setSelection}>Use selected {this.props.selectedImages.length === 1 ? 'image' : 'images'}</Button>
                </div>
              }
              <div className="file-manager__wrapper">
                {this.props.images?.map((img, i) => {
                  const selected = this.props.selectedImages.includes(img.id)
                  return (
                    <div className="file-manager__file" key={i}>
                      <img src={img.file?.thumb.url} alt="" />
                      <p className="file-manager__filename">{img.filename}</p>
                      <Button type="button" class="button button--smallest button--error" onClick={() => { this.confirmDeleteFile(img.id) }}>Delete</Button>
                      <Toggle classes={selected && ['active']} onClick={() => { this.selectFile(img.id) }} />
                    </div>
                  )
                })}
              </div>
            </div>
          }
        </div>
        {this.props.confirmation && this.props.confirmation()}
      </div>
    )
  }
}

const enhance = compose(
  withHooks((props) => {
    const usedImageIdState = useUsedImageIdState()
    return {
      usedImageIds: usedImageIdState.usedImageIds,
      updateUsedImageIds: usedImageIdState.updateUsedImageIds,
    }
  })
)

const EnhancedFileManagerUI = enhance(FileManagerUI)