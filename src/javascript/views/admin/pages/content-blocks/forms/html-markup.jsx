import React from 'react'
import ReactDOM from 'react-dom'
import Select from 'react-select'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import {UnControlled as CodeMirror} from 'react-codemirror2'

import 'codemirror/mode/htmlmixed/htmlmixed'

export default class HTMLMarkupBlockForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        background: props.block ? props.block.background : 'light',
        html: props.block ? props.block.html : '',
        type: 'html-markup'
      },
      errors: [],
      validation: ['html']
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

  updateHtml = (editor, data, value) => {
    this.setState({
      block: {
        ...this.state.block,
        html: value
      }
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
        <FormControl error={this.state.errors.includes('html') && 'Please complete this field'} label="HTML">
          <CodeMirror value={this.state.block.html} options={{ mode: 'htmlmixed', lineNumbers: true }} onChange={this.updateHtml} />
        </FormControl>
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={ buttonClasses }>Save Content Block</Button>
        </div>
      </form>
    )
  }
}