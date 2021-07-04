import React from 'react'
import pluralize from 'pluralize'

import Button from 'javascript/components/button'
import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'
import { ProgrammesAutosuggest } from 'javascript/utils/hooks/use-programmes-autosuggest'
import AsyncSelect from 'javascript/components/async-select'

import withTheme from 'javascript/utils/theme/withTheme'
class RelatedPagesForm extends NestedBlock {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        columns: props.block ? props.block.columns : 'three',
        programmes: props.block ? props.block.programmes.map((obj) => Object.assign({}, obj)) : [],
        fullWidth: true,
        type: 'programme-grid'
      },
      programmes: props.programmes ? props.programmes : [],
      errors: [],
      resourceErrors: []
    }
    this.resourceName = 'programme'
    this.model = {
      resource: null
    }
    this.theme = props.theme
  }

  setResourceValidation = () => ['resource']

  updateBlock = (e) => {
    this.setState({
      block: {
        ...this.state.block,
        [e.target.name]: e.target.value
      }
    })
  }

  render() {
    const resources = this.state.block[pluralize(this.resourceName)]
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    return (
      <form onSubmit={ this.saveBlock } className="cms-form">
        <FormControl label="Columns">
            <Select options={[
              {value: 'two', label: '2 Columns'},
              {value: 'three', label: '3 Columns'}
              ]}
              onChange={(value) => { this.updateBlock({ target: { name: 'columns', value: value } }) }}
              value={ this.state.block.columns }
              clearable={ false }
              simpleValue={ true }/>
          </FormControl>
          { resources.map((resource, i) => {
            const classes = i === this.state.dragged ? 'cms-form__group cms-form__group--hidden' : 'cms-form__group'
            return (
              <div className={ classes } key={ i }
                    draggable="true"
                    onDragStart={(e) => { this.dragStart(e, i)}}
                    onDragEnd={(e) => { this.dragEnd(e, i)}}
                    onDragOver={(e) => { this.dragOver(e, i)}}
                    onDrop={(e) => { this.drop(e, i)}}>
                <div className="cms-form__group-actions">
                  <Button type="button" className="button button--smallest button--filled" style={{ cursor: 'move' }}>Move</Button>
                  <Button type="button" className="button button--smallest button--error" onClick={() => { this.removeResource(i) }}>Remove</Button>
                </div>
                <FormControl error={ this.state.resourceErrors[i] && this.state.resourceErrors[i].includes('resource') && 'Please complete this field'} label={`${this.props.theme.localisation.programme.upper}`}>
                  <ProgrammesAutosuggest
                    buildParams={keywords => ({
                      filter: { keywords: encodeURIComponent(keywords) },
                    })}
                    onLoad={(options, callback) => callback({ options })}
                  >
                  {({ programmeSuggestions, searchProgrammes }) => (
                    <AsyncSelect
                      onChange={value => {
                        resources[i].resource = value
                        this.setState(() => ({ resources }))
                      }}
                      value={ this.state.block.programmes[i].resource }
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
            )
          })}
          <div className="cms-form__actions">
            <Button className="button button--small" onClick={ this.addResource } type="button">Add { this.resourceName }</Button>
          </div>
          <div className="cms-form__control cms-form__control--actions">
            <Button type="submit" className={ buttonClasses }>Save Content Block</Button>
          </div>
      </form>
    )
  }
}

export default withTheme(RelatedPagesForm)