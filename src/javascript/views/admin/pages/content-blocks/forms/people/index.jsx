import React from 'react'

import allClientVariables from './variables'

import CreatableSelect from 'react-select-v3/creatable'
import FormControl from 'javascript/components/form-control'
import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'

import withTheme from 'javascript/utils/theme/withTheme'
import territories from 'javascript/models/schema/territories'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import { findAllByModel } from 'javascript/utils/apiMethods'

class PeopleBlockForm extends NestedBlock {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        background: props.block ? props.block.background : 'light',
        title: props.block ? props.block.title : '',
        people: props.block ? props.block.people.map((obj) => Object.assign({}, obj)) : [],
        bgImage: props.block ? props.block.bgImage : {
          id: null,
          name: null
        },
        type: 'people'
      },
      fileManager: () => { },
      errors: [],
      resourceErrors: [],
      tagOptions: []
    }
    this.resourceName = 'person'
    this.model = {
      name: '',
      job: '',
      bio: '',
      email: '',
      telephone: '',
      linkedin: '',
      tags: [],
      imageIds: []
    }
    this.formOrder = [
      'name',
      'job',
      'bio',
      'email',
      'telephone',
      'linkedin',
      'customFormControl',
      'imageIds'
    ]
    this.theme = props.theme
  }

  componentDidMount() {
    const fetchTagOptions = {
      'territories': this.getTerritoryTagOptions
    }
    this.props.peopleCV.preloadedTagOptions.forEach((type) => fetchTagOptions[type]())
  }

  getTerritoryTagOptions = () => {
    if (this.props.theme.features.territories.enabled) {
      findAllByModel('territories', {
        fields: ['name']
      }).then(this.applyTagOptions)
    }
  }

  applyTagOptions = (resources) => {
    const update = [...this.state.tagOptions]
    resources.forEach((r) => {
      update.push({
        value: r.name,
        label: r.name
      })
    })
    this.setState({
      tagOptions: update
    })
  }

  setValidation = () => ['people']
  setResourceValidation = () => ['name', 'imageIds']


  renderCustomFormControl = (formOrderIndex, resource, onChange) => {
    return ({
      '6': (
        <FormControl
          key={formOrderIndex}
          label="Tags"
        >
          <div className="cms-form__inner">
            <CreatableSelect
              className="cms-SelectV3"
              classNamePrefix="Select"
              isClearable
              isMulti
              value={resource.tags}
              placeholder={this.state.tagOptions.length ? 'Select or create...' : ''}
              noOptionsMessage={() => 'Type to create'}
              onChange={(values) => onChange('tags', values)}
              options={this.state.tagOptions}
            />
          </div>
        </FormControl>
      )
    })[formOrderIndex]
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('peopleCV', allClientVariables)

)

export default enhance(PeopleBlockForm)