import React from 'react'
import { Features } from 'javascript/config/features'
import pluralize from 'pluralize'

// Actions
import TeamRegionsActions from 'javascript/actions/team-regions'
import TeamDepartmentsActions from 'javascript/actions/team-departments'

// Stores
import TeamRegionsStore from 'javascript/stores/team-regions'
import TeamDepartmentsStore from 'javascript/stores/team-departments'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'

export default class TeamBlockForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        background: props.block ? props.block.background : 'light',
        title: props.block ? props.block.title : '',
        region: props.block ? props.block.region : '',
        department: props.block ? props.block.department : '',
        type: 'team-members'
      },
      errors: [],
      validation: []
    }
    this.resourceName = 'team-member'
    this.model = {
      resource: null
    }
  }

  componentWillMount() {
    TeamRegionsStore.on('change', this.getRegions)
    TeamDepartmentsStore.on('change', this.getDepartments)
  }

  componentWillUnmount() {
    TeamRegionsStore.removeListener('change', this.getRegions)
    TeamDepartmentsStore.removeListener('change', this.getDepartments)
  }

  componentDidMount() {
    TeamRegionsActions.getResources({
      page: {
        size: 200
      },
      fields: {
        'team-regions': 'name'
      }
    })

    TeamDepartmentsActions.getResources({
      page: {
        size: 200
      },
      fields: {
        'team-departments': 'name'
      }
    })
  }

  getRegions = () => {
    this.setState({
      regions: TeamRegionsStore.getResources()
    })
  }

  getDepartments = () => {
    this.setState({
      departments: TeamDepartmentsStore.getResources()
    })
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

    this.setState({ isLoading: true })
    if (this.props.index > -1) {
      this.props.onSubmit(this.state.block, this.props.index)
    } else {
      this.props.onSubmit(this.state.block)
    }
  }

  render() {
    const resources = this.state.block[pluralize(this.resourceName)]
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
        <FormControl error={this.state.errors.includes('title') && 'Please complete this field'} type="text" label="Title" name="title" value={ this.state.block.title } onChange={ this.updateBlock } />

        { this.state.regions &&
          <FormControl label="Region">
            <Select
              options={ this.state.regions }
              onChange={(value) => { this.updateBlock({ target: { name: 'region', value: value } }) }}
              labelKey="name"
              valueKey="id"
              value={ this.state.block.region }/>
          </FormControl>
        }

        { this.state.departments &&
          <FormControl label="Department">
            <Select
              options={ this.state.departments }
              onChange={(value) => { this.updateBlock({ target: { name: 'department', value: value } }) }}
              labelKey="name"
              valueKey="id"
              value={ this.state.block.department }/>
          </FormControl>
        }

        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={ buttonClasses }>Save Content Block</Button>
        </div>
      </form>
    )
  }
}