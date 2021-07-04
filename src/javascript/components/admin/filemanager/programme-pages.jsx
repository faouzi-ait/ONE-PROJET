import React, { Component } from 'react'

// Actions
import PageActions from 'javascript/actions/pages'
import ProgrammeActions from 'javascript/actions/programmes'
import PageImagesActions from 'javascript/actions/page-images'
import ProgrammePageImagesActions from 'javascript/actions/programme-page-images'

// Stores
import PageStore from 'javascript/stores/pages'
import ProgrammeStore from 'javascript/stores/programmes'
import PageImagesStore from 'javascript/stores/page-images'
import ProgrammePageImagesStore from 'javascript/stores/programme-page-images'

class ProgrammePagesFileManager extends Component {
  constructor(props) {
    super(props)
    this.state = {
      confirmation: () => {},
      deleting: false,
      images: [],
      isLoading: true,
      progress: 0,
      selectedImages: props.selectedImages || [],
      uploadError: null,
      uploading: false,
    }

    // Sorry
    this.actions = {
      'programme': ProgrammePageImagesActions,
      'page': PageImagesActions,
    }[props.type || 'page']
    this.store = {
      'programme': ProgrammePageImagesStore,
      'page': PageImagesStore,
    }[props.type || 'page']
    this.resourceAction = {
      'programme': ProgrammeActions,
      'page': PageActions,
    }[props.type || 'page']
    this.resourceStore = {
      'programme': ProgrammeStore,
      'page': PageStore,
    }[props.type || 'page']
  }

  componentWillMount = () => {
    this.store.on('change', this.refreshImages)
    this.store.on('progress', this.getProgress)
    this.resourceStore.on('recievedFiles', this.getImages)
  }

  componentWillUnmount = () => {
    this.store.removeListener('change', this.refreshImages)
    this.store.removeListener('progress', this.getProgress)
    this.resourceStore.removeListener('recievedFiles', this.getImages)
  }

  componentDidMount() {
    this.refreshImages()
  }

  refreshImages = () => {
    this.resourceAction.getResourceFiles(this.props.id, {
      include: 'page-images',
      fields: {
        pages: 'page-images',
        programmes: 'page-images',
        'page-images': 'file,filename'
      }
    })
  }

  getImages = () => {
    this.setState({
      images: this.resourceStore.getResourceFiles(),
      uploading: false,
      isLoading: false,
      deleting: false
    })
  }

  getProgress = () => {
    this.setState({
      progress: this.store.getProgress()
    })
  }

  uploadFiles = (files) => {
    this.setState({
      uploading: true,
      uploadError: null
    })
    this.actions.uploadImages(files, this.props.id)
  }

  setConfirmation = (confirmation) => {
    this.setState({
      confirmation
    })
  }

  setSelectedImages = (selectedImages) => {
    this.setState({
      selectedImages
    })
  }

  setUploadError = (uploadError) => {
    this.setState({
      uploadError
    })
  }

  deleteFile = (id) => {
    this.setState({
      selectedImages: this.state.selectedImages.filter(img => img !== id),
      deleting: true
    })
    this.actions.deleteImage(id)
  }

  render() {
    const injectedProps = {
      ...this.state,
      uploadFiles: this.uploadFiles,
      setConfirmation: this.setConfirmation,
      deleteFile: this.deleteFile,
      setSelectedImages: this.setSelectedImages,
      setUploadError: this.setUploadError,
    }
    return this.props.renderUI(injectedProps)
  }
}

export default ProgrammePagesFileManager
