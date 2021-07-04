import React from 'react'
import ReactDOM from 'react-dom'

// Stores
import CustomAttributeStore from 'javascript/stores/custom-attributes'

// Actions
import CustomAttributeActions from 'javascript/actions/custom-attributes'

// Components
import Button from 'javascript/components/button'
import Editor from 'javascript/components/wysiwyg'
import FileManager from 'javascript/components/admin/filemanager'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'

class ProductionCompaniesForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      block: Object.assign({}, {
        background: 'light',
        countrySelector: true,
        type: 'production-companies',
        category: null,
        buttonText: ''
      }, props.block || {}),
      errors: [],
      validation: [],
      categories: []
    }
  }

  componentWillMount() {
    CustomAttributeStore.on('change', this.getResources)
  }

  componentWillUnmount() {
    CustomAttributeStore.removeListener('change', this.getResources)
  }

  componentDidMount() {
    CustomAttributeActions.getResources({
      fields: {
        'custom-attributes': 'name,value'
      },
      filter: {
        'related-type': 'ProductionCompany'
      },
      page: {
        size: 200
      }
    })
  }

  getResources = () => {
    this.setState({
      categories: [...new Set(CustomAttributeStore.getResources().filter(v => v.name==='Category').map(v => v.value))]
    })
  }

  updateBlock = (e) => {
    this.setState({
      block: {
        ...this.state.block,
        [e.target.name]: e.target.value
      }
    })
  }

  updateCheck = (e) => {
    this.setState({
      block: {
        ...this.state.block,
        [e.target.name]: !this.state.block[e.target.name]
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


  render() {
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    return (
      <form onSubmit={this.saveBlock} className="cms-form">
        <FormControl label="Background">
          <Select options={[
            { value: 'light', label: 'Plain' },
            { value: 'shade', label: 'Shaded' }
          ]}
            onChange={(value) => { this.updateBlock({ target: { name: 'background', value: value } }) }}
            value={this.state.block.background}
            clearable={false}
            simpleValue={true} />
        </FormControl>

        <FormControl label="Category">
          <Select options={this.state.categories.map(v => ({ value: v, label: v }))}
            onChange={(value) => { this.updateBlock({ target: { name: 'category', value: value } }) }}
            value={this.state.block.category}
            clearable={true}
            simpleValue={true} />
        </FormControl>

        <FormControl>
          <div className="checkbox">
            <input type="checkbox" checked={this.state.block.countrySelector} name="countrySelector" className="checkbox__input" id="countrySelector" onChange={this.updateCheck} />
            <label htmlFor="countrySelector" className="checkbox__label cms-form__label">Country selector</label>
          </div>
        </FormControl>

        <FormControl label="Button Text" type="text" name="buttonText"
          value={this.state.block.buttonText}
          onChange={this.updateBlock}
        />

        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={buttonClasses}>Save Content Block</Button>
        </div>
      </form>
    )
  }
}

export default ProductionCompaniesForm