import React from 'react'
import ReactDOM from 'react-dom'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import useUsedImageIdState from 'javascript/views/admin/pages/content-blocks/use-used-image-id-state'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import FileManager from 'javascript/components/admin/filemanager'
import Editor from 'javascript/components/wysiwyg'
import Select from 'react-select'

class PromoBlockForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      block: Object.assign({}, {
        title: '',
        content: '',
        backgroundImage: [{
          alt: '',
          imageIds: []
        }],
        selectedbackgroundImage: [],
        image: [{
          alt: '',
          imageIds: []
        }],
        selectedimage: [],
        buttonText: '',
        buttonLink: '',
        fullWidth: true,
        type: 'promo',
        showLogo: true
      }, props.block || {}),
      fileManager: () => {}
    }
  }

  updateBlock = (e) => {
    this.setState({
      block: {
        ...this.state.block,
        [e.target.name]: e.target.value
      }
    })
  }

  updateImageAlt = (e) => {
    this.setState({
      block: {
        ...this.state.block,
        image: [{
          imageIds: this.state.block.image[0].imageIds,
          alt: e.target.value
        }]
      }
    })
  }

  updateSelectedImages = (selection, names, index) => {
    const { id: resourceId, type, updateUsedImageIds } = this.props
    this.setState({
      block: {
        ...this.state.block,
        [index]: [{
          imageIds: selection,
          alt: this.state.block[index][0].alt
        }],
        [`selected${index}`]: names
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
    this.setState({ isLoading: true })
    if (this.props.index > -1) {
      this.props.onSubmit(this.state.block, this.props.index)
    } else {
      this.props.onSubmit(this.state.block)
    }
  }

  openFileManager = (index) => () => {
    this.setState({
      fileManager: () => (
        <FileManager ref="filemanager"
          selectedImages={ this.state.block[`selected${index}`] }
          id={this.props.id}
          type={this.props.type}
          onConfirm={(ids, names) => { this.updateSelectedImages(ids, names, index) } }
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

  updateCheck = (e) => {
    this.setState({
      block: {
        ...this.state.block,
        [e.target.name]: !this.state.block[e.target.name]
      }
    })
  }

  render() {
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    return (
      <form onSubmit={ this.saveBlock } className="cms-form">
        <FormControl type="text" label="Title" name="title" value={ this.state.block.title } onChange={ this.updateBlock } />
        <FormControl type="textarea" label="Content" name="content" modifiers={['tall']} onChange={ this.updateBlock } value={ this.state.block.content } />
        <FormControl type="text" label="Button Text" name="buttonText" value={ this.state.block.buttonText } onChange={ this.updateBlock } />
        <FormControl label="Button Link">
          <input type="text" name="buttonLink" value={this.state.block.buttonLink} onChange={this.updateBlock} placeholder="/catalogue" className="cms-form__input" />
        </FormControl>
        <div>
          <FormControl label="Background Image" modifiers={['tall']}>
            <div className="cms-form__image-selection">
              <p>{ this.state.block.selectedbackgroundImage.join(', ') }</p>
              <Button type="button" className="button button--filled" onClick={ this.openFileManager('backgroundImage') }>Choose Image</Button>
            </div>
            { this.state.fileManager() }
          </FormControl>
        </div>
        <div>
          <FormControl label="Image (Minimum width 1140px)" modifiers={['tall']}>
            <div className="cms-form__image-selection">
              <p>{ this.state.block.selectedimage.join(', ') }</p>
              <Button type="button" className="button button--filled" onClick={ this.openFileManager('image') }>Choose Image</Button>
            </div>
          </FormControl>
          <FormControl label="Image Alt Text" type="text" value={this.state.block.image[0].alt} name="imageAlt" onChange={ this.updateImageAlt } />
        </div>
        <FormControl>
          <div className="checkbox">
            <input type="checkbox" checked={this.state.block.showLogo} name="showLogo" className="checkbox__input" id="showLogo" onChange={this.updateCheck} />
            <label htmlFor="showLogo" className="checkbox__label cms-form__label">Show Logo</label>
          </div>
        </FormControl>
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={ buttonClasses }>Save Content Block</Button>
        </div>
      </form>
    )
  }
}

const enhance = compose(
  withHooks((props) => {
    const usedImageIdState = useUsedImageIdState()
    return {
      updateUsedImageIds: usedImageIdState.updateUsedImageIds,
    }
  })
)

export default enhance(PromoBlockForm)