import React from 'react'
import ReactDOM from 'react-dom'
import Select from 'react-select'

import CustomAttributeActions from 'javascript/actions/custom-attributes'
import Actions from 'javascript/actions/production-companies'
import Store from 'javascript/stores/production-companies'

import withTheme from 'javascript/utils/theme/withTheme'
// Components
import Button from 'javascript/components/button'
import FileManager from 'javascript/components/admin/filemanager'
import FormControl from 'javascript/components/form-control'
import FormHelper from 'javascript/views/form-helper'
import NavLink from 'javascript/components/nav-link'
import Span from 'javascript/components/span'

class ProductionCompaniesForm extends FormHelper {
  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = 'Company'
    this.state = {
      resource: {
        id: props.resource.id,
        name: props.resource.name || '',
        intro: props.resource.intro || '',
        'external-id' : props.resource['external-id'] || '',
        'country': props.resource.country || '',
        'external-url': props.resource['external-url'] || '',
        'logo': props.resource.logo,
        'background-image': props.resource['background-image']
      },
      'background-image': {},
      logo: {},
      imageNames: [],
      method: props.method,
      fileManager: () => { },
      'custom-attributes': props.resource['custom-attributes'] || []
    }
  }

  openFileManager = () => {
    this.setState({
      fileManager: () => (
        <FileManager ref="filemanager"
          selectedImages={this.state.imageNames}
          id={this.props.resource.id}
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

  createResource = (e) => {
    e.preventDefault()
    this.setState({ isLoading: true })
    this.actions.createResource(this.state.resource, this.state['custom-attributes'])
  }

  updateResource = (e) => {
    e.preventDefault()
    this.setState({ isLoading: true })
    this.actions.updateResource(this.state.resource, this.state['custom-attributes'])
  }

  renderErrors = () => {
    if (this.state.apiErrors) {
      return (
        <ul className="cms-form__errors cms-form__errors--light">
          {Object.keys(this.state.apiErrors).map((key, i) => {
            const error = this.state.apiErrors[key]
            return (
              <li key={i}>{error}</li>
            )
          })}
        </ul>
      )
    }
  }

  renderDeleteForm = () => {
    const { resource } = this.state
    const { theme } = this.props
    const buttonClasses = ['button', 'filled', 'reversed', this.state.isLoading && 'loading'].join(' button--')
    if (resource['programmes-count'] > 0) {
      return (
        <div className="u-align-center">
          <p>There is {resource['programmes-count']} programme(s) associated to this ${theme.localisation.productionCompany.lower}. Please remove this company from all <NavLink to={{ pathname: '/admin/programmes/', query: { 'filter[production_company]': resource.id } }}>programmes</NavLink> first.</p>
          <Button type="button" className="button button--reversed" onClick={this.props.closeEvent}>Cancel</Button>
        </div>
      )
    } else {
      return (
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete the {theme.localisation.productionCompany.lower} <strong>{resource.name}</strong>?</p>
          </div>
          {this.renderErrors()}
          <div class="cms-form__control cms-form__control--actions">
            <Button type="button" className="button button--reversed" onClick={this.props.closeEvent}>Cancel</Button>
            <Button type="submit" className={buttonClasses}>Delete</Button>
          </div>
        </div>
      )
    }
  }

  handleFileChange = (e) => {
    const target = e.target.name
    const input = e.target
    if (input.files?.[0]) {
      const reader = new FileReader()

      const file = new Blob([input.files[0]], { type: input.files[0].type })
      file.name = input.files[0].name.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '')
      const now = Date.now()
      file.lastModifiedDate = new Date(now)
      file.lastModified = now

      reader.onload = (e) => {
        this.setState({
          [target]: {
            preview: e.target.result,
            file: file,
            path: file.name
          },
          resource: {
            ...this.state.resource,
            [target]: e.target.result
          }
        })
      }
      reader.readAsDataURL(input.files[0])
    }
  }

  addAttribute = () => {
    this.setState({
      'custom-attributes': [...this.state['custom-attributes'], {
        'custom-attribute-type': {
          'id': null
        },
        'value': '',
        'related': {
          'id': this.state.resource.id,
          'type': 'production-companies'
        }
      }]
    })
  }

  renderForm = () => {
    const { theme } = this.props
    const {resource} = this.state
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    const attrs = this.state['custom-attributes']
    const easytrack =
      theme.features.rightsManagement &&
      theme.features.rightsManagement.includes('easytrack')
    return (
      <div>
        {resource.id &&
          <FormControl
            key="external_id"
            type="text"
            label={easytrack ? 'EasyTrack ID' : 'External ID'}
            name="external-id"
            readonly={easytrack}
            value={resource['external-id'] || ''}
            onChange={this.handleInputChange}
          />
        }
        <FormControl type="text" name="name" label="Name" value={this.state.resource.name} required onChange={this.handleInputChange} />

        {theme.features.customAttributes.models.includes('ProductionCompany') &&
          <div>            
            <FormControl type="text" name="intro" label="Intro" value={this.state.resource.intro} onChange={this.handleInputChange} />
            <FormControl type="text" name="country" label="Country" value={this.state.resource.country} onChange={this.handleInputChange} />
            <FormControl type="text" name="external-url" label="URL" value={this.state.resource['external-url']} onChange={this.handleInputChange} />

            <h3 className="cms-form__title">Thumbnail Image (760px x 392px)</h3>
            <div className="file-input">
              <div className="file-input__preview">
                <img src={typeof this.state.resource.logo === 'string' ? this.state.resource.logo : this.props.resource?.['logo']?.admin_preview?.url} />
              </div>
              <input type="file" name="logo" defaultValue="" onChange={this.handleFileChange} className="file-input__input" />
              <span>
                <Span className="button button--filled button--small" classesToPrefix={['button']}>
                  Select an Image
                </Span>
                <br />
                <span className="file-input__path">{this.state.logo.path}</span>
              </span>
            </div>

            <h3 className="cms-form__title">Background Image (1600px x 800px)</h3>
            <div className="file-input">
              <div className="file-input__preview">
                <img src={typeof this.state.resource['background-image'] === 'string' ? this.state.resource.['background-image'] : this.props.resource?.['background-image']?.admin_preview?.url} />
              </div>
              <input type="file" name="background-image" defaultValue="" onChange={this.handleFileChange} className="file-input__input" />
              <span>
                <Span className="button button--filled button--small" classesToPrefix={['button']}>
                  Select an Image
                </Span>
                <br />
                <span className="file-input__path">{this.state['background-image'].path}</span>
              </span>
            </div>

            <h3 className="cms-form__title">Custom Attributes</h3>
            <div>
              {this.state['custom-attributes'].sort((a, b) => a.position - b.position).map((a, i) => {
                const type = this.props.types.find(t => t.id === a['custom-attribute-type'].id)
                return (
                  <div className="cms-form__group" key={i}>
                    <div className="cms-form__control">
                      <Select
                        options={this.props.types.map(t => ({ ...t, label: t.name, value: t.id }))}
                        value={a['custom-attribute-type'].id} clearable={false} simpleValue={true}
                        onChange={(v) => {
                          attrs[i]['custom-attribute-type'].id = v
                          attrs[i].value = ''

                          this.setState(() => ({ 'custom-attributes': attrs }))
                        }} required />
                    </div>

                    {type && type['attribute-type'] === 'Boolean' ? (
                      <div className="cms-form__control cms-form__control--padding">
                        <input
                          type="checkbox"
                          className="checkbox__input"
                          id={`boolean-attribute${i}`}
                          value={a.value}
                          checked={a.value}
                          onChange={({ target }) => {
                            attrs[i].value = (!a.value) ? 1 : 0
                            this.setState(() => ({ 'custom-attributes': attrs }))
                          }} />
                        <label htmlFor={`boolean-attribute${i}`} className="checkbox__label cms-form__label"></label>
                      </div>
                    ) : (
                        <div className="cms-form__control">
                          {(type && type.config.limitValues) ? (
                            <Select
                              options={type.config.values.filter(v => {
                                const match = this.state['custom-attributes'].find(a => a['custom-attribute-type'].id === type.id && a.value === v)
                                if (match && match.value !== a.value) {
                                  return false
                                } else {
                                  return v
                                }
                              }).map(v => ({ label: v, value: v }))}
                              value={a.value} clearable={false} simpleValue={true}
                              onChange={(v) => {
                                attrs[i].value = v
                                this.setState(() => ({ 'custom-attributes': attrs }))
                              }} required />
                          ) : (
                              <input type={type && type['attribute-type'] === 'Integer' ? 'number' : 'text'} value={a.value} placeholder={type && type['attribute-type'] === 'Integer' ? 'Attribute value (number)' : 'Attribute value'} className="cms-form__input" onChange={({ target }) => {
                                attrs[i].value = type['attribute-type'] === 'Integer' ? Number(target.value) : target.value
                                this.setState(() => ({ 'custom-attributes': attrs }))
                              }} required />
                            )}
                        </div>
                      )}

                    <div className="cms-form__control">
                      <Button type="button" className="button button--small button--filled button--danger" onClick={() => {
                        if (a.id) {
                          CustomAttributeActions.deleteResource({ id: a.id })
                        }
                        this.setState(() => ({
                          'custom-attributes': attrs.filter((item, index) => i !== index)
                        }))
                      }}>Delete</Button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="cms-form__actions">
              <Button className="button button--small" onClick={this.addAttribute} type="button">Add A New Attribute</Button>
            </div>

            {this.state.fileManager()}
          </div>
        }
        {this.renderErrors()}
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={buttonClasses}>Save {this.resourceName}</Button>
        </div>
      </div>
    )
  }

}

export default withTheme(ProductionCompaniesForm)