import React from 'react'
import ReactDOM from 'react-dom'

import compose from 'javascript/utils/compose'
import useUsedImageIdState from 'javascript/views/admin/pages/content-blocks/use-used-image-id-state'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'

import Button from 'javascript/components/button'
import FileManager from 'javascript/components/admin/filemanager'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'

class VideoBlockForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        background: props.block ? props.block.background : 'light',
        provider: props.block ? props.block.provider : '',
        vidId: props.block ? props.block.vidId : '',
        type: 'video',
        selectedImages: props.block ? props.block.selectedImages : [],
        images: props.block ? props.block.images : [{ imageIds: [] }],
        bgImage: props.block ? props.block.bgImage : {
          id: null,
          name: null
        },
        title: ''
      },
      errors: [],
      validation: ['provider', 'vidId'],
      fileManager: () => {}
    }
  }

  isValid = () => {
    const errors = this.state.validation.filter((input) => !this.state.block[input] || this.state.block[input].length <= 0)
    this.setState({ errors })
    return errors.length <= 0
  }

  updateBlock = (e) => {
    this.setState({
      block: {
        ...this.state.block,
        [e.target.name]: e.target.value
      }
    })
  }

  openFileManager = () => {
    this.setState({
      fileManager: () => (
        <FileManager ref="filemanager"
          selectedImages={ this.state.block.selectedImages }
          id={this.props.id}
          type={this.props.type}
          onConfirm={ this.updateSelectedImages }
          closeEvent={ this.unsetFileManager }
        />
      )
    })
  }

  unsetFileManager = () => {
    ReactDOM.findDOMNode(this.refs.filemanager).classList.add('modal--is-hiding')
      setTimeout(() => {
        this.setState({
          fileManager: () => {}
        })
      }, 500)
  }

  updateSelectedImages = (selection, names) => {
    const { id: resourceId, type, updateUsedImageIds } = this.props
    this.setState({
      block: {
        ...this.state.block,
        images: [{
          imageIds: selection,
          alt: this.state.block.images[0].alt
        }],
        selectedImages: names
      },
      fileManager: () => {}
    }, () => {
      updateUsedImageIds({
        type,
        resourceId,
        block: this.state.block
      })
    })
  }

  saveBlock = (e) => {
    e.preventDefault()

    if(!this.isValid()){
      return false
    }

    this.setState({ isLoading: true })
    if (this.props.index > -1) {
      this.props.onSubmit(this.state.block, this.props.index)
    } else {
      this.props.onSubmit(this.state.block)
    }
  }

  updatebgImage = (selection, names) => {
    const { id: resourceId, type, updateUsedImageIds } = this.props
    this.setState({
      block: {
        ...this.state.block,
        bgImage: {
          id: selection[0],
          name: names[0]
        }
      },
      fileManager: () => {}
    }, () => {
      updateUsedImageIds({
        type,
        resourceId,
        block: this.state.block
      })
    })
  }

  render() {
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    return (
      <form onSubmit={ this.saveBlock } className="cms-form">
        <FormControl label="Background">
            <Select options={[
              {value: 'light', label: 'Plain'},
              {value: 'shade', label: 'Shaded'},
              {value: 'brand', label: 'Branded'},
              {value: 'image', label: 'Image'}
              ]}
              onChange={(value) => { this.updateBlock({ target: { name: 'background', value: value } }) }}
              value={ this.state.block.background }
              clearable={ false }
              simpleValue={ true }/>
          </FormControl>
          {this.state.block.background === 'image' &&
            <FormControl label="Background Image" modifiers={['tall']}>
              <div className="cms-form__image-selection">
                <p>{this.state.block.bgImage.name}</p>
                <Button type="button" className="button button--filled" onClick={() => {
                  this.setState({
                    fileManager: () => (
                      <FileManager ref="filemanager"
                        selectedImages={ [this.state.block.bgImage.id] }
                        id={this.props.id}
                        type={this.props.type}
                        onConfirm={ this.updatebgImage }
                        closeEvent={ this.unsetFileManager }
                      />
                    )
                  })
                }}>
                  Choose Image
                </Button>
              </div>
              {this.state.fileManager()}
            </FormControl>
          }
        <FormControl label="Title" type="text" name="title" value={this.state.block.title} onChange={ this.updateBlock } />
        <FormControl label="Video Provider" error={this.state.errors.includes('provider') && 'Please complete this field'}>
          <Select options={[
            {value: 'youtube', label: 'Youtube'},
            {value: 'vimeo', label: 'Vimeo'},
              ...this.props.theme.features.providers.filter(v => !v['hideBlock'] && v.name !== 'knox').map(p => ({value: p.name ? p.name : p, label: p.name ? p.name.charAt(0).toUpperCase() + p.name.slice(1) : p.charAt(0).toUpperCase() + p.slice(1)}))
            ]}
            onChange={(value) => { this.updateBlock({ target: { name: 'provider', value: value } }) }}
            value={ this.state.block.provider }
            clearable={ false }
            simpleValue={ true }/>
        </FormControl>
        <FormControl error={this.state.errors.includes('vidId') && 'Please complete this field'} label="Video ID" type="text" name="vidId" value={this.state.block.vidId} onChange={ this.updateBlock } />
        <FormControl label="Video Poster" modifiers={['tall']}>
          <div className="cms-form__image-selection">
            <p>{ this.state.block.selectedImages.join(', ') }</p>
            <Button type="button" className="button button--filled" onClick={ this.openFileManager }>Choose Image</Button>
          </div>
          { this.state.fileManager() }
        </FormControl>
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={ buttonClasses }>Save Content Block</Button>
        </div>
      </form>
    )
  }
}

const enhance = compose(
  withTheme,
  withHooks((props) => {
    const usedImageIdState = useUsedImageIdState()
    return {
      updateUsedImageIds: usedImageIdState.updateUsedImageIds,
    }
  })
)

export default enhance(VideoBlockForm)
