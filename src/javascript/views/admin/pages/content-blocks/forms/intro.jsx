import React from 'react'
import ReactDOM from 'react-dom'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import FileManager from 'javascript/components/admin/filemanager'
import Editor from 'javascript/components/wysiwyg'
import Select from 'react-select'
import { Localisation, Features } from 'javascript/config/features' // itv only

export default class TextBlockForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      block: Object.assign({}, {
        background: 'light',
        title: '',
        content: '',
        type: 'intro'
      }, props.block || {}),
      errors: [],
      validation: ['content']
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
        <FormControl type="text" label="Title" name="title" error={this.state.errors.includes('title') && 'Please complete this field'} draggable={true} value={ this.state.block.title } onChange={ this.updateBlock }  />
        <FormControl label="Content" modifiers={['tall']} error={this.state.errors.includes('content') && 'Please complete this field'}>
          <Editor
            value={ this.state.block.content }
            onChange={(value) => { this.updateBlock({ target: { name: 'content', value: value } }) }}
          />
        </FormControl>
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={ buttonClasses }>Save Content Block</Button>
        </div>
      </form>
    )
  }
}

