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
import { Localisation, Features } from 'javascript/config/features' // not one-lite

class ContactPersonBlockForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      block: Object.assign({}, {
        title: '',
        name: '',
        jobTitle: '',
        phone: '',
        email: '',
        images: [{
          alt: '',
          imageIds: []
        }],
        selectedImages: [],
        background: 'light',
        type: 'contact-person'
      }, props.block || {}),
      errors: [],
      fileManager: () => {},
      validation: ['name','phone','email']
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
        images: [{
          imageIds: this.state.block.images[0].imageIds,
          alt: e.target.value
        }]
      }
    })
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

  isValid = () => {
    const errors = this.state.validation.filter((input) => !this.state.block[input] || this.state.block[input].length <= 0)
    this.setState({ errors })
    return errors.length <= 0
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

  openFileManager = () => {
    this.setState({
      fileManager: () => (
        <FileManager ref="filemanager" s
          electedImages={ this.state.block.selectedImages }
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

  render() {
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    return (
      <form onSubmit={ this.saveBlock } className="cms-form">
        <FormControl label="Background">
          <Select options={[
            {value: 'light', label: 'Plain'},
            {value: 'shade', label: 'Shaded'}
            ]}
            onChange={(value) => { this.updateBlock({ target: { name: 'background', value: value } }) }}
            value={ this.state.block.background }
            clearable={ false }
            simpleValue={ true }/>
        </FormControl>
        <FormControl
          error={
            this.state.errors.includes('title') && 'Please complete this field'
          }
          type="text"
          label="Title"
          name="title"
          value={this.state.block.title}
          onChange={this.updateBlock}
        />

        <FormControl error={this.state.errors.includes('name') && 'Please complete this field'} type="text" label="Name" name="name" value={ this.state.block.name } onChange={ this.updateBlock } />
        <FormControl type="text" label="Job title" name="jobTitle" value={ this.state.block.jobTitle } onChange={ this.updateBlock } />
        <FormControl error={this.state.errors.includes('phone') && 'Please complete this field'} type="text" label="Phone number" name="phone" value={ this.state.block.phone } onChange={ this.updateBlock } />
        <FormControl error={this.state.errors.includes('email') && 'Please complete this field'} type="email" label="Email address" name="email" value={ this.state.block.email } onChange={ this.updateBlock } />

        <div>
          <FormControl label="Image" modifiers={['tall']}>
            <div className="cms-form__image-selection">
              <p>{ this.state.block.selectedImages.join(', ') }</p>
              <Button type="button" className="button button--filled" onClick={ this.openFileManager }>Choose Image</Button>
            </div>
            { this.state.fileManager() }
          </FormControl>
          <FormControl label="Image Alt Text" type="text" value={this.state.block.images[0].alt} name="imageAlt" onChange={ this.updateImageAlt } />
        </div>

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

export default enhance(ContactPersonBlockForm)