import React from 'react'

// Packages
import pluralize from 'pluralize'

// Components
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'
import withTheme from 'javascript/utils/theme/withTheme'

class TextBlockForm extends NestedBlock {
  constructor(props) {
    super(props)
    this.state = {
      block: Object.assign({}, {
        images: [],
        type: 'logos'
      }, props.block || {}),
      errors: [],
      resourceErrors: [],
      fileManager: () => {}
    }
    this.resourceName = 'image'
    this.model = {
      imageIds: []
    }
    this.theme = props.theme
  }

  setResourceValidation = () => ['imageIds']

  render() {
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    const resources = this.state.block[pluralize(this.resourceName)]
    return (
      <form onSubmit={ this.saveBlock } className="cms-form">
        { this.state.block.media === 'image' &&
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
        }

        {resources.map((resource, i) => {
          const classes = i === this.state.dragged ? 'cms-form__group cms-form__group--hidden' : 'cms-form__group'
          return (
            <div className={ classes } key={ i }
                draggable="true"
                onDragStart={(e) => { this.dragStart(e, i)}}
                onDragEnd={(e) => { this.dragEnd(e, i)}}
                onDragOver={(e) => { this.dragOver(e, i)}}
                onDrop={(e) => { this.drop(e, i)}}
                ref={ `${this.resourceName}-${i}`} >
              <div className="cms-form__group-actions">
                <Button type="button" className="button button--smallest button--filled" style={{ cursor: 'move' }}>Move</Button>
                <Button type="button" className="button button--smallest button--error" onClick={() => { this.removeResource(i) }}>Remove</Button>
              </div>
              <div className="cms-form__control">
                <p class="cms-form__images">{ resource.imageNames }</p>
                <Button type="button" className="button button--filled button--small" onClick={() => { this.openFileManager(i) }}>Choose Image</Button>
                { this.state.resourceErrors[i] && this.state.resourceErrors[i].includes('imageIds') &&
                  <p className="cms-form__error">Please complete this field</p>
                }
              </div>
            </div>
          )
        })}

        <div className="cms-form__actions">
          <Button className="button button--small" onClick={ this.addResource } type="button">Add { this.resourceName }</Button>
        </div>

        { this.state.fileManager() }

        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={ buttonClasses }>Save Content Block</Button>
        </div>
      </form>
    )
  }
}

export default withTheme(TextBlockForm)