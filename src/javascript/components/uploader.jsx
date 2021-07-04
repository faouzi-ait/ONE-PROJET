import React from 'react'
import SlideToggle from 'javascript/components/slide-toggle'
import Dropzone from 'react-dropzone'
import 'stylesheets/core/components/uploader'

import AssetMaterialStore from 'javascript/stores/asset-materials'

import Button from 'javascript/components/button'
import CustomCheckbox from 'javascript/components/custom-checkbox'
import withTheme from 'javascript/utils/theme/withTheme'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'

class Uploader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gallery: false,
      restricted: props.theme.features.assetsRestricted,
      publicAsset: false,
      externalUrl: '',
      urlError: '',
      videoProvider: { value: props.videoProviders?.[0]?.name, label: props.videoProviders?.[0]?.name }
    }
  }

  componentWillMount() {
    AssetMaterialStore.on('error', this.recievedUrlError)
  }

  componentWillUnmount() {
    AssetMaterialStore.removeListener('error', this.recievedUrlError)
  }

  recievedUrlError = (d) => {
    const errors = AssetMaterialStore.getErrors()
    this.setState({
      urlError: `External url: ${errors['external-file-url'] || errors['file-type'] || 'invalid url'}`
    })
  }

  updateGallery = (e) => {
    const gallery = e.target.checked
    const { theme: { features: { acceptedFileTypes }}, files, rejectedFiles } = this.props
    const fileTypes = gallery ? acceptedFileTypes.gallery : acceptedFileTypes[this.props.type]

    const fileExtensionRegex = /[^\\]*\.(\w+)$/;

    const filesToCheck = (files || []).concat((rejectedFiles || []))

    const newlyAcceptedFiles = filesToCheck.filter(f => {
      const matches = (f.name || '').match(fileExtensionRegex)
      if (matches.length !== 2) {
        return false
      }
      return fileTypes.includes(matches[1])
    })

    const newlyRejectedFiles = filesToCheck.filter(f => {
      const matches = (f.name || '').match(fileExtensionRegex)
      if (matches.length !== 2) {
        return true
      }
      return !fileTypes.includes(matches[1])
    })

    this.handleOnDrop(
      newlyAcceptedFiles.length > 0 ? newlyAcceptedFiles : null,
      (newlyRejectedFiles.length > 0 || newlyAcceptedFiles.length > 0) ? newlyRejectedFiles : null,
    )
    this.setState({
      gallery,
    })
  }

  handleOnDrop = (...restArgs) => {
    if (this.state.externalUrl.length === 0) {
      this.props.onDrop(...restArgs)
    }
  }

  handleOnSubmit = (params) => {
    this.setState({
      urlError: ''
    })

    this.props.onSubmit({
      ...params,
      provider: this.state.videoProvider.value
    })
  }

  render() {
    const { files, onDrop, onClose, rejectedFiles, progress, type, max, videoProviders = [] } = this.props
    const { acceptedFileTypes } = this.props.theme.features
    const { urlError } = this.state
    const classes = ['uploader', progress !== null && 'is-uploading'].join(' uploader--')
    const fileTypes = this.state.gallery ? acceptedFileTypes.gallery : acceptedFileTypes[this.props.type]
    return (
      <div className={ classes } onClick={ ({ target }) => {
        if (target.className === 'uploader__dropzone') return
        // only close if click was not within circle (uploader__dropzone)
        for (let parentNode = target.parentNode; parentNode; parentNode = parentNode.parentNode) {
          if (parentNode.className === 'uploader__dropzone') {
            return;
          }
        }
        onClose(true)
      }}>
        <Dropzone onDrop={this.handleOnDrop} style={{}} accept={ fileTypes } maxSize={ max }>
          {({getRootProps, getInputProps}) => (
            <div className="uploader__dropzone" { ...getRootProps() } >
              <p className="uploader__title">Drag &amp; drop files</p>
              { type === 'assets' &&
                <p className="uploader__copy">or input an external url below.</p>
              }
              { type !== 'video' &&
                <p className="uploader__copy">You can add multiple JPEGs, PNGs, or GIFs.</p>
              }
              {max &&
                <p>Files must be less than {parseInt(max / 1000000)}mb</p>
              }
              <input {...getInputProps({
                onClick: (e) => {
                  if (this.state.externalUrl.length) {
                    e.stopPropagation()
                    e.preventDefault()
                  }
                }
              })}  />
              <>
                { urlError && (
                  <p className="uploader__files">
                    <strong>{urlError}</strong>
                  </p>
                )}
                { !urlError && (files || rejectedFiles) &&
                  <p className="uploader__files">
                    <strong>{ (files || []).length } { (files || []).length === 1 ? 'file' : 'files' } ready for upload</strong><br/>
                    { (rejectedFiles || []).length > 0 &&
                      <strong>{ (rejectedFiles || []).length } { (rejectedFiles || []).length === 1 ? 'file' : 'files' } { (rejectedFiles || []).length === 1 ? 'was' : 'were' } rejected</strong>
                    }
                  </p>
                }
              </>
            </div>
          )}
        </Dropzone>

        <div className="uploader__actions" onClick={e => e.stopPropagation()}>

          { type === 'assets' &&
            <FormControl
              type="text" label="External url"
              name={'external-url'}
              placeholder={''}
              value={this.state.externalUrl}
              disabled={true}
              onChange={(e) => {
                this.setState({
                  externalUrl: e.target.value,
                  gallery: false
                }, () => {
                  if (this.state.externalUrl.length > 0 && (files?.length || rejectedFiles?.length)) {
                    onDrop(null, null)
                  }
                })
              }}
            />
          }

          { type == 'video' && videoProviders.length > 1 &&
            <FormControl label={'Video provider'}>
              <Select
                clearable={false}
                options={videoProviders?.map(p => ({ value: p?.name, label: p?.name }))}
                value={this.state.videoProvider}
                onChange={e =>
                  this.setState({
                    videoProvider: e
                  })
                }
              />
            </FormControl>
          }

          { type !== 'video' &&
            <div style={{minHeight: '44px'}}>
              <SlideToggle
                on="Image Gallery" off="Multiple Assets"
                identifier="gallery"
                onChange={ this.updateGallery }
                classes={['reversed']}
                disabled={this.state.externalUrl.length > 0}
                checked={this.state.gallery}
              />
            </div>
          }
          { type !== 'video' &&
            <>
          <CustomCheckbox label="Restricted" name="restricted" checked={this.state.restricted} id="restricted" onChange={(e)=>
            this.setState({
              restricted: e.target.checked,
              publicAsset: false
            })}/>
              <CustomCheckbox label="Public" name="publicAsset" checked={this.state.publicAsset} id="publicAsset" onChange={(e)=>
            this.setState({
              publicAsset: e.target.checked,
              restricted: false
            })}/>
            </>
          }
          <Button className="button button--reversed" onClick={ () => { onClose(true) } }>Cancel</Button>
          { (files || this.state.externalUrl) &&
            <Button className="button button--reversed button--filled"
              onClick={() => {
                this.state.gallery
                this.handleOnSubmit({
                  gallery: this.state.gallery,
                  restricted: this.state.restricted,
                  publicAsset: this.state.publicAsset,
                  externalUrl: this.state.externalUrl
                })
              }}
            >
              {files?.length ? 'Upload Files' : 'Submit URL'}
            </Button>
          }
        </div>
        { progress !== null &&
          <div className="uploader__progress">
            <div className="uploader__progress-bar" style={{ height: `${ progress }%` }}>
              <div className="uploader__progress-display">{ progress }%</div>
            </div>
            <div className="uploader__progress-display">{ progress }%</div>
          </div>
        }
      </div>
    )
  }
}

export default withTheme(Uploader)