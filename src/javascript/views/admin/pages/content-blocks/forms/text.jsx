import React from 'react'
import ReactDOM from 'react-dom'
import FormControl from 'javascript/components/form-control'
import FileManager from 'javascript/components/admin/filemanager'
import Editor from 'javascript/components/wysiwyg'
import Select from 'react-select'
import { ProgrammesAutosuggest } from 'javascript/utils/hooks/use-programmes-autosuggest'
import AsyncSelect from 'javascript/components/async-select'
import Button from 'javascript/components/button'

/* #region  amc */
import CustomCheckbox from 'javascript/components/custom-checkbox'
/* #endregion */
import withTheme from 'javascript/utils/theme/withTheme'
import allClientVariables from '../variables'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withHooks from 'javascript/utils/hoc/with-hooks'
import useUsedImageIdState from '../use-used-image-id-state'

class TextBlockForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      block: Object.assign({}, {

        /* #region  amc */
        fullWidth: false,
        /* #endregion */

        media: '',
        mediaPos: 'left',
        images: [{
          alt: '',
          imageIds: []
        }],
        selectedImages: [],
        provider: '',
        vidId: '',
        programmeId: '',
        background: 'light',
        content: '',
        type: 'text',
        bgImage: props.block ? props.block.bgImage : {
          id: null,
          name: null
        },
      }, props.block || {}),
      errors: [],
      fileManager: () => { },
      programmes: [],
      validation: ['content']
    }
    this.imagesAllowed = !Boolean(props.noImages)
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
      fileManager: () => { }
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

  openFileManager = () => {
    this.setState({
      fileManager: () => (
        <FileManager ref="filemanager"
          selectedImages={this.state.block.selectedImages}
          id={this.props.id}
          type={this.props.type}
          onConfirm={this.updateSelectedImages}
          closeEvent={this.unsetFileManager}
        />
      )
    })
  }

  unsetFileManager = () => {
    ReactDOM.findDOMNode(this.refs.filemanager).classList.add('modal--is-hiding')
    setTimeout(() => {
      this.setState({
        fileManager: () => { }
      })
    }, 500)
  }

  updateProgramme = (value) => {
    this.setState({
      block: {
        ...this.state.block,
        programme: value,
        programmeId: value?.id || null
      }
    })
  }


  render() {
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    const { theme, contentBlocksCV } = this.props
    const backgroundOptions = [
      { value: 'light', label: 'Plain' },
      { value: 'shade', label: 'Shaded' },
      { value: 'brand', label: 'Branded' },
    ]
    if(theme.variables.KidsVersion){
      backgroundOptions.push({ value: 'kids', label: 'Kids' },)
    }
    if (this.imagesAllowed) {
      backgroundOptions.push({ value: 'image', label: 'Image' })
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
          <FormControl label={`Background Image (${contentBlocksCV.backgroundSize})`} modifiers={['tall']}>
            <div className="cms-form__image-selection">
              <p>{this.state.block.bgImage.name}</p>
              <Button type="button" className="button button--filled" onClick={() => {
                this.setState({
                  fileManager: () => (
                    <FileManager ref="filemanager"
                      selectedImages={[this.state.block.bgImage.id]}
                      id={this.props.id}
                      type={this.props.type}
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

        /* #region  amc */
        <FormControl label="Full Width">
          <CustomCheckbox label="Display block full width?" id="fullWidth" name="fullWidth" onChange={(e) => { this.updateBlock({ target: { name: 'fullWidth', value: e.target.checked } }) }} checked={ this.state.block.fullWidth } />
        </FormControl>
        /* #endregion */

        { this.imagesAllowed && (
            <FormControl label="Media">
              <Select options={[
                { value: 'image', label: 'Image' },
                { value: 'video', label: 'Video' },
                { value: 'programme', label: `${theme.localisation.programme.upper} Card` }
              ]}
                onChange={(value) => { this.updateBlock({ target: { name: 'media', value: value } }) }}
                value={this.state.block.media}
                simpleValue={true} />
            </FormControl>
          )
        }
        {this.state.block.media &&
          <FormControl label="Media Position">
            <Select options={[
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' }
            ]}
              onChange={(value) => { this.updateBlock({ target: { name: 'mediaPos', value: value } }) }}
              value={this.state.block.mediaPos}
              clearable={false}
              simpleValue={true} />
          </FormControl>
        }
        {this.state.block.media === 'image' &&
          <div>
            /* #region  ae | all3 | amc | banijaygroup | demo | discovery | endeavor | fremantle | drg | itv | keshet | rtv | storylab | wildbrain */
            <FormControl label="Image" modifiers={['tall']}>
            /* #endregion */
            /* #region  cineflix */
            <FormControl label="Image (Minimum width 725px)" modifiers={['tall']}>
            /* #endregion */</FormControl>
              <div className="cms-form__image-selection">
                <p>{this.state.block.selectedImages.join(', ')}</p>
                <Button type="button" className="button button--filled" onClick={this.openFileManager}>Choose Image</Button>
              </div>
              {this.state.fileManager()}
            </FormControl>
            <FormControl label="Image Alt Text" type="text" value={this.state.block.images[0].alt} name="imageAlt" onChange={this.updateImageAlt} />
          </div>
        }
        {this.state.block.media === 'video' &&
          <div>
            <FormControl label="Video Provider">
              <Select options={[
                { value: 'youtube', label: 'Youtube' },
                { value: 'vimeo', label: 'Vimeo' },
                ...theme.features.providers.filter(v => !v['hideBlock'] && v.name !== 'knox').map(p => ({ value: p.name ? p.name : p, label: p.name ? p.name.charAt(0).toUpperCase() + p.name.slice(1) : p.charAt(0).toUpperCase() + p.slice(1) }))
              ]}
                onChange={(value) => { this.updateBlock({ target: { name: 'provider', value: value } }) }}
                value={this.state.block.provider}
                clearable={false}
                simpleValue={true} />
            </FormControl>
            <FormControl label="Video ID" type="text" name="vidId" value={this.state.block.vidId} onChange={this.updateBlock} />
            <FormControl label="Video Poster" modifiers={['tall']}>
              <div className="cms-form__image-selection">
                <p>{this.state.block.selectedImages.join(', ')}</p>
                <Button type="button" className="button button--filled" onClick={this.openFileManager}>Choose Image</Button>
              </div>
              {this.state.fileManager()}
            </FormControl>
          </div>
        }
        {this.state.block.media === 'programme' &&
          <div>
            <FormControl label={`${theme.localisation.programme.upper}`}>
              <ProgrammesAutosuggest
                  buildParams={keywords => ({
                    filter: { keywords: encodeURIComponent(keywords) },
                  })}
                  onLoad={(options, callback) => callback({ options })}
                >
                {({ programmeSuggestions, searchProgrammes }) => (
                  <AsyncSelect
                    onChange={this.updateProgramme}
                    value={this.state.block.programme}
                    placeholder="Type to search"
                    loadOptions={searchProgrammes}
                    options={programmeSuggestions}
                    labelKey="title-with-genre"
                    valueKey="id"
                    />
                )}
              </ProgrammesAutosuggest>
            </FormControl>
          </div>
        }
        <FormControl label="Content" modifiers={['tall']} error={this.state.errors.includes('content') && 'Please complete this field'}>
          <Editor
            value={this.state.block.content}
            onChange={(value) => { this.updateBlock({ target: { name: 'content', value: value } }) }}
          />
        </FormControl>
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={buttonClasses}>Save Content Block</Button>
        </div>
      </form>
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('contentBlocksCV', allClientVariables),
  withHooks((props) => {
    const usedImageIdState = useUsedImageIdState()
    return {
      updateUsedImageIds: usedImageIdState.updateUsedImageIds,
    }
  })
)

export default enhance(TextBlockForm)