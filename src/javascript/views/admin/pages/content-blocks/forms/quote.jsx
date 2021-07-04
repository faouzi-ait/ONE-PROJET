import React from 'react'
import ReactDOM from 'react-dom'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import useUsedImageIdState from 'javascript/views/admin/pages/content-blocks/use-used-image-id-state'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'
import FileManager from 'javascript/components/admin/filemanager'

class QuoteBlockForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      block: Object.assign({}, {
        background: 'light',
        quote: '',
        citation: '',
        bgImage: {
          id: null,
          name: null
        },
        type: 'quote',
        /* #region  demo | discovery */
        selectedImages: [],
        images: [{
          alt: '',
          imageIds: []
        }],
        mainImage: {id: '', alt: ''},
        citationImage: {id: '', alt: ''}
        /* #endregion */

      }, props.block),
      errors: [],
      validation: ['quote', 'citation'],
      fileManager: () => { }
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

    if (!this.isValid()) {
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
      fileManager: () => { }
    }, () => {
      updateUsedImageIds({
        type,
        resourceId,
        block: this.state.block
      })
    })
  }
  /* #region  demo | discovery */
  unsetFileManager = () => {
    ReactDOM.findDOMNode(this.refs.filemanager).classList.add('modal--is-hiding')
    setTimeout(() => {
      this.setState({
        fileManager: () => { }
      })
    }, 500)
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

  updateMainImage = (selection, names) => {
    const { id: resourceId, type, updateUsedImageIds } = this.props
    this.setState({
      block: {
        ...this.state.block,
        images: [{
          imageIds: selection,
          alt: this.state.block.images[0].alt
        }],
        selectedImages: names,
        mainImage: {
          id: selection[0],
          alt: this.state.block.mainImage ? this.state.block.mainImage.alt : '',
          filename: names[0]}
      },
      fileManager: () => { }
    }, () => {
      updateUsedImageIds({
        type,
        resourceId,
        block: this.state.block
      })
    })
  }

  updateMainImageAlt = (e) => {
    this.setState({
      block: {
        ...this.state.block,
        images: [{
          imageIds: this.state.block.images[0].imageIds,
          alt: e.target.value
        }],
        mainImage: Object.assign({},this.state.block.mainImage,{alt: e.target.value})
      }
    })
  }

  updateCitationImage = (selection, names) => {
    const { id: resourceId, type, updateUsedImageIds } = this.props
    this.setState({
      block: {
        ...this.state.block,
        images: [{
          imageIds: selection,
          alt: this.state.block.images[0].alt
        }],
        selectedImages: names,
        citationImage: {
          id: selection[0],
          alt: this.state.block.citationImage ? this.state.block.citationImage.alt : '',
          filename: names[0]}
      },
      fileManager: () => { }
    }, () => {
      updateUsedImageIds({
        type,
        resourceId,
        block: this.state.block
      })
    })
  }

  updateCitationImageAlt = (e) => {
    this.setState({
      block: {
        ...this.state.block,
        images: [{
          imageIds: this.state.block.images[0].imageIds,
          alt: e.target.value
        }],
        citationImage: Object.assign({},this.state.block.citationImage,{alt: e.target.value})
      }
    })
  }
  /* #endregion */

  render() {
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    const backgroundOptions = [
      { value: 'light', label: 'Plain' },
      { value: 'shade', label: 'Shaded' },
      { value: 'brand', label: 'Branded' },
      { value: 'image', label: 'Image' },
    ]
    if(this.props.theme.variables.KidsVersion){
      backgroundOptions.push({ value: 'kids', label: 'Kids' },)
    }
    return (
      <form onSubmit={this.saveBlock} className="cms-form">
        <FormControl label="Background">
          <Select options={backgroundOptions}
            onChange={(value) => { this.updateBlock({ target: { name: 'background', value: value } }) }}
            value={this.state.block.background}
            clearable={false}
            simpleValue={true} />
        </FormControl>
        {this.state.block.background === 'image' &&
          <FormControl label="Background Image" modifiers={['tall']}>
            <div className="cms-form__image-selection">
              <p>{this.state.block.bgImage.name}</p>
              <Button type="button" className="button button--filled" onClick={() => {
                this.setState({
                  fileManager: () => (
                    <FileManager ref="filemanager" id={this.props.id} type={this.props.type}
                      selectedImages={[this.state.block.bgImage.id]}
                      onConfirm={this.updatebgImage}
                      closeEvent={this.unsetFileManager}
                    />
                  )
                })
              }}>Choose Image</Button>
            </div>
            {this.state.fileManager()}
          </FormControl>
        }

        /* #region  demo | discovery */
        <div>
          <FormControl label="Main Image" modifiers={['tall']}>
            <div className="cms-form__image-selection">
              <p>{this.state.block.mainImage.filename}</p>
              <Button type="button" className="button button--filled" onClick={ () => {
                  this.setState({
                    fileManager: () => (
                      <FileManager ref="filemanager" id={this.props.id} type={this.props.type}
                        selectedImages={this.state.block.selectedImages}
                        onConfirm={this.updateMainImage}
                        closeEvent={this.unsetFileManager}
                      />
                    )
                  })
                }}>Choose Image</Button>
            </div>
            {this.state.fileManager()}
          </FormControl>
          <FormControl label="Image Alt Text" type="text" name="mainImageAlt"
            value={this.state.block.mainImage.alt}
            onChange={this.updateMainImageAlt}
          />
        </div>
        /* #endregion */

        <FormControl type="textarea" name="quote" label="Quote"
          error={this.state.errors.includes('quote') && 'Please complete this field'}
          onChange={this.updateBlock}
          value={this.state.block.quote}
        />

        /* #region  demo | discovery */
        <div>
          <FormControl label="Citation Image" modifiers={['tall']}>
            <div className="cms-form__image-selection">
              <p>{this.state.block.citationImage.filename}</p>
              <Button type="button" className="button button--filled" onClick={() => {
                  this.setState({
                    fileManager: () => (
                      <FileManager ref="filemanager" id={this.props.id} type={this.props.type}
                        selectedImages={this.state.block.selectedImages}
                        onConfirm={this.updateCitationImage}
                        closeEvent={this.unsetFileManager}
                      />
                    )
                  })
                }}>Choose Image</Button>
            </div>
            {this.state.fileManager()}
          </FormControl>
          <FormControl label="Image Alt Text" type="text" name="citationImageAlt"
            value={this.state.block.citationImage.alt}
            onChange={this.updateCitationImageAlt}
          />
        </div>
        /* #endregion */

        <FormControl type="text" name="citation" label="Citation"
          error={this.state.errors.includes('citation') && 'Please complete this field'}
          onChange={this.updateBlock}
          value={this.state.block.citation}
        />

        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={buttonClasses}>Save Content Block</Button>
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


export default enhance(QuoteBlockForm)