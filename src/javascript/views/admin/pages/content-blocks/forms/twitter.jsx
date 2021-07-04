import React from 'react'
import ReactDOM from 'react-dom'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import useUsedImageIdState from 'javascript/views/admin/pages/content-blocks/use-used-image-id-state'

import FormControl from 'javascript/components/form-control'
import Select from 'react-select'
import FileManager from 'javascript/components/admin/filemanager'
import Button from 'javascript/components/button'

class TwitterBlockForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        title: props.block ? props.block.title : '',
        background: props.block ? props.block.background : 'light',
        account: props.block ? props.block.account : '',
        bgImage: props. block ? props.block.bgImage : {
          id: null,
          name: null
        },
        type: 'twitter'
      },
      errors: [],
      validation: ['account'],
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

  saveBlock = (e) => {
    e.preventDefault()

    if(!this.isValid()){
      return false
    }
    const update = {
      ...this.state.block,
      account: this.state.block.account.toLowerCase()
    }

    this.setState({ isLoading: true })
    if (this.props.index > -1) {
      this.props.onSubmit(update, this.props.index)
    } else {
      this.props.onSubmit(update)
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
              }}>Choose Image</Button>
            </div>
            {this.state.fileManager()}
          </FormControl>
        }
        <FormControl type="text" label="Title" name="title" value={ this.state.block.title } onChange={ this.updateBlock } />
        <FormControl error={this.state.errors.includes('account') && 'Please complete this field'} type="text" name="account" onChange={ this.updateBlock } label="Twitter Account" value={ this.state.block.account } />
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

export default enhance(TwitterBlockForm)
