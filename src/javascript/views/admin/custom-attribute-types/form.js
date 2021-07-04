import React from 'react'
// State
import Store from 'javascript/stores/custom-attribute-types'
import Actions from 'javascript/actions/custom-attribute-types'
// HOC
import withTheme from 'javascript/utils/theme/withTheme'
// Components
import Button from 'javascript/components/button'
import CustomCheckbox from 'javascript/components/custom-checkbox'
import FormControl from 'javascript/components/form-control'
import FormHelper from 'javascript/views/form-helper'
import Select from 'react-select'

class CustomAttributeTypesForm extends FormHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = 'Custom Attribute'
    const resource = {
      'name': props.resource.name || '',
      'attribute-type': props.resource['attribute-type'] || 'String',
      'related-type': props.resource['related-type'] || 'Programme',
      config: {
        displayOnFrontend: props.resource.config.displayOnFrontend || false,
        displayOnApp: props.resource.config.displayOnApp || false,
        filterable: props.resource.config.filterable || false,
        limitValues: props.resource.config.limitValues || false,
        values: props.resource.config.values || [],
        featured: props.resource.config.featured || false
      }
    }
    if (props.resource.id) {
      resource.id = props.resource.id
    }
    this.state = {
      resource,
      method: props.method
    }
  }

  toggleCheckbox = (e) => {
    this.setState({
      resource: {
        ...this.state.resource,
        config: {
          ...this.state.resource.config,
          [e.target.name]: e.target.checked
        }
      }
    })
  }

  addValue = () => {
    this.setState({
      resource: {
        ...this.state.resource,
        config: {
          ...this.state.resource.config,
          values: [...this.state.resource.config.values, '']
        }
      }
    })
  }

  createResource = (e) => {
    e.preventDefault()
    this.setState({
      resource: {
        ...this.state.resource,
        config: {
          ...this.state.resource.config,
          values: [...new Set(this.state.resource.config.values)]
        }
      },
      isLoading: true
    }, () => {
      this.actions.createResource(this.state.resource)
    })
  }

  updateResource = (e) => {
    e.preventDefault()
    this.setState({
      resource: {
        ...this.state.resource,
        config: {
          ...this.state.resource.config,
          values: [...new Set(this.state.resource.config.values)]
        }
      },
      isLoading: true
    }, () => {
      this.actions.updateResource(this.state.resource)
    })
  }

  renderForm = () => {
    const { method, theme } = this.props
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    const { values } = this.state.resource.config
    let productionCompaniesOptions = [{
      label: theme.localisation.programme.upper,
      value: 'Programme'
    }, {
      label: theme.localisation.series.upper,
      value: 'Series'
    }]
    {theme.features.customAttributes.models.includes('ProductionCompany') &&
      productionCompaniesOptions.push({
        label: theme.localisation.productionCompany.upper,
        value: 'Production Company'
      })
    }
    return (
      <div>
        <FormControl type="text" name="name" label="Name" value={this.state.resource.name} required onChange={this.handleInputChange} />
        {method === 'createResource' ? (
          <FormControl label="Type" required>
            <Select options={[{
                        label: 'String',
                        value: 'String'
                      }, {
                        label: 'Integer',
                        value: 'Integer'
                      }, {
                        label: 'Boolean',
                        value: 'Boolean'
                      },
                      {
                        label: 'Date',
                        value: 'Date'
                      }
                    ]}
                    value={this.state.resource['attribute-type']}
                    onChange={(v) => { this.handleInputChange({ target: { name: 'attribute-type', value: v } }) }}
                    simpleValue={true}
                    required
                    clearable={false}
                    searchable={false} />
          </FormControl>
        ) : (
            <FormControl label="Type">
              <input type="text" className="cms-form__input" value={this.state.resource['attribute-type']} readOnly />
            </FormControl>
          )}
        <FormControl label="Relation" required>

          <Select options={productionCompaniesOptions}
            value={this.state.resource['related-type']}
            onChange={(v) => { this.handleInputChange({ target: { name: 'related-type', value: v } }) }}
            simpleValue={true}
            required
            clearable={false}
            searchable={false} />
        </FormControl>
        <h3>Attribute Configuration</h3>
        <FormControl>
          <CustomCheckbox label={`Display on Website`} name="displayOnFrontend" checked={this.state.resource.config.displayOnFrontend} id="displayOnFrontend" onChange={this.toggleCheckbox} />
        </FormControl>
        <FormControl>
          <CustomCheckbox label={`Display in App`} name="displayOnApp" checked={this.state.resource.config.displayOnApp} id="displayOnApp" onChange={this.toggleCheckbox} />
        </FormControl>
        {this.state.resource['related-type'] === 'Programme' &&
          <FormControl>
            <CustomCheckbox label="Enable users to filter by this attribute" name="filterable" checked={this.state.resource.config.filterable} id="filterable" onChange={this.toggleCheckbox} />
          </FormControl>
        }
        { this.state.resource['attribute-type'] !== 'Boolean' &&
          this.state.resource['attribute-type'] !== 'Date' &&
          <FormControl>
            <CustomCheckbox label={`Limit available values`} name="limitValues" checked={this.state.resource.config.limitValues} id="limitValues" onChange={this.toggleCheckbox} />
          </FormControl>
        }
        { this.props.theme.features.customAttributes.featured && this.state.resource['related-type'] === 'Series' &&
          <FormControl>
            <CustomCheckbox label={`Featured`} name="featured" checked={this.state.resource.config.featured} id="featured" onChange={this.toggleCheckbox} />
          </FormControl>
        }

        {this.state.resource.config.limitValues &&
          <div>
            <h3 className="cms-form__title" style={{ marginTop: 20 }}>Available Options</h3>
            <div className="cms-form__table">
              {this.state.resource.config.values.map((v, i) => (
                <div className="cms-form__control" key={i}>
                  <div>
                    <input className="cms-form__input" type={this.state.resource['attribute-type'] === 'Integer' ? 'number' : 'text'} placeholder={this.state.resource['attribute-type'] === 'Integer' ? 'Value (number)' : 'Value'} value={v} key={i} onChange={(e) => {
                      values[i] = this.state.resource['attribute-type'] === 'Integer' ? Number(e.target.value) : e.target.value
                      this.setState({
                        resource: {
                          ...this.state.resource,
                          config: {
                            ...this.state.resource.config,
                            values: values
                          }
                        }
                      })
                    }} />
                  </div>
                  <div>
                    <Button type="button" className="button button--small button--filled button--danger" onClick={() => {
                      this.setState({
                        resource: {
                          ...this.state.resource,
                          config: {
                            ...this.state.resource.config,
                            values: values.filter((v, j) => j !== i)
                          }
                        }
                      })
                    }}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cms-form__actions">
              <Button type="button" className="button button--small" onClick={this.addValue}>Add Value</Button>
            </div>
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

export default withTheme(CustomAttributeTypesForm)