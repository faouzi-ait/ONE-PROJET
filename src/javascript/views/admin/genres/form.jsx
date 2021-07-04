/** http://0.0.0.0:8080/admin/genres */
import React from 'react'
import pluralize from 'pluralize'
import Select from 'react-select'
import NavLink from 'javascript/components/nav-link'

import { isLiteClient } from 'javascript/utils/theme/liteClientName'
import AsyncSearchProgrammes from 'javascript/components/async-search-programmes'
import withTheme from 'javascript/utils/theme/withTheme'

import Button from 'javascript/components/button'
import FileUploader from 'javascript/components/file-uploader'
import FormControl from 'javascript/components/form-control'
import FormHelper from 'javascript/views/form-helper'

// Services
import Actions from 'javascript/actions/genres'
import Store from 'javascript/stores/genres'
import ProgrammesService from 'javascript/services/programmes'

const noParentOption = {
  id: 0,
  noParentOption: true,
  name: 'No parent genre',
}

class GenreForm extends FormHelper {
  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = props.theme.localisation.genre.upper
    this.state = {
      resource: props.resource,
      method: props.method,
      selectedProgramme: props.resource['featured-programme'],
      image: {},
    }
    if (props.resource['parent-id'] && props.genres) {
      const selectedParent = props.genres.find(
        genre => genre.id == props.resource['parent-id'],
      )
      this.state.selectedParent = selectedParent
      delete this.state.resource['sub-genres']
    } else if (props.resource.id) {
      this.state.selectedParent = noParentOption
    }
  }

  searchForProgramme = (input, callback) => {
    ProgrammesService.search(
      {
        fields: {
          programmes: 'id,title',
        },
        page: {
          size: 200,
        },
        filter: {
          search: input,
          genre: this.state.resource.id,
        },
      },
      programmes => {
        this.setState(
          {
            programmes,
          },
          () => {
            callback(null, {
              options: this.state.programmes,
            })
          },
        )
      },
    )
  }

  updateResource = e => {
    e.preventDefault()
    const { resource } = this.state
    delete resource['active-programmes-count']
    delete resource['programmes-count']
    delete resource['sub-genres-with-programmes-for-user']
    this.setState({ isLoading: true })
    this.actions.updateResource(resource)
  }

  handleInputChange = e => {
    const update = this.state.resource
    update[e.target.name] = e.target.value
    this.setState({
      resource: update,
    })
  }

  handleCheckboxChange = ({ target }) => {
    let update = {...this.state.resource}
    update[target.name] = target.checked
    this.setState({
      resource: update,
    })
  }

  handleSelectedParent = selected => {
    const update = this.state.resource
    update['parent'] = selected
    update['parent-id'] = selected.id

    if (selected.noParentOption) {
      delete update['parent']
      update['parent-id'] = null
    }

    this.setState({
      selectedParent: selected,
      resource: update,
    })
  }

  handleSelectedProgramme = selectedProgramme => {
    const update = this.state.resource
    update['featured-programme'] = selectedProgramme
      ? { id: selectedProgramme.id }
      : null
    this.setState({
      selectedProgramme,
      resource: update,
    })
  }

  renderGenres = () => {
    const { genres, theme } = this.props
    const options = [...genres]
    options.unshift(noParentOption)
    return (
      <FormControl label={`Parent ${theme.localisation.genre.lower}`}>
        <Select
          valueKey="id"
          labelKey="name"
          options={options}
          value={this.state.selectedParent}
          onChange={this.handleSelectedParent}
          clearable={false}
        />
      </FormControl>
    )
  }

  handleFileChange = e => {
    const target = e.target.name
    const input = this.refs[target]
    if (input.files && input.files[0]) {
      const reader = new FileReader()
      const file = new Blob([input.files[0]], { type: input.files[0].type })
      file.name = input.files[0].name.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '')
      const now = Date.now()
      file.lastModifiedDate = new Date(now)
      file.lastModified = now

      reader.onload = e => {
        this.setState({
          [target]: {
            preview: e.target.result,
            file: file,
            path: file.name,
          },
          resource: {
            ...this.state.resource,
            [target]: e.target.result,
          },
        })
      }
      reader.readAsDataURL(input.files[0])
    }
  }

  renderFeaturedProgramme = () => {
    if (this.state.resource['parent-id']) return
    return (
      <FormControl label={`${this.props.theme.localisation.programme.upper}`}>
        <AsyncSearchProgrammes
          value={this.state.selectedProgramme || false}
          onChange={this.handleSelectedProgramme}
        />
      </FormControl>
    )
  }

  renderImageUpload = () => {
    if (this.state.resource['parent-id']) return
    const imageSrc = this.state.image.preview || this.state.resource['image']?.admin_preview.url
    return (
      <FileUploader title={'Genre Image'}
        name={'image'}
        fileType={'Image'}
        fileSrc={imageSrc}
        filePath={this.state.image && this.state.image.path}
        onRemoveFile={() => {
          this.setState({
            resource: {
              ...this.state.resource,
              image: null,
              'remove-image': true
            },
            image: {}
          })
        }}
        onChange={(targetName, baseStr, file) => {
          this.setState({
            [targetName]: {
              preview: baseStr,
              file: file,
              path: file.name
            },
            resource: {
              ...this.state.resource,
              [targetName]: baseStr
            }
          })
        }}
      />
    )
  }

  renderForm = () => {
    const buttonClasses = [
      'button',
      'filled',
      this.state.isLoading && 'loading',
    ].join(' button--')
    return (
      <div>
        {this.renderGenres()}
        <FormControl
          type="text"
          name="name"
          label="Name"
          value={this.state.resource.name}
          required
          onChange={this.handleInputChange}
        />
        <FormControl type="checkbox" label="Available as user preference"
          checkboxLabeless={true}
          id="show-in-registration"
          name="show-in-registration"
          onChange={this.handleCheckboxChange}
          checked={this.state.resource['show-in-registration']}
        />
        {this.props.theme.features.dashboard.admin && this.renderFeaturedProgramme()}
        {!isLiteClient() && this.renderImageUpload()}
        {this.renderErrors()}
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={buttonClasses}>
            Save {this.resourceName}
          </Button>
        </div>
      </div>
    )
  }

  renderDeleteForm = () => {
    const { resource } = this.state
    const { theme } = this.props
    const buttonClasses = [
      'button',
      'filled',
      'reversed',
      this.state.isLoading && 'loading',
    ].join(' button--')
    const dependantsWarning =
      `There ${resource['active-programmes-count'] === 1 ? 'is' : 'are'} ` +
      `${resource['active-programmes-count']} ` +
      `${
        resource['active-programmes-count'] === 1
          ? theme.localisation.programme.lower
          : pluralize(theme.localisation.programme.lower)
      } ` +
      `with this ${
        theme.localisation.genre.lower
      } tag. Please remove this tag from all `

    if (resource['active-programmes-count'] > 0) {
      return (
        <div className="u-align-center">
          <p>
            {dependantsWarning}
            <NavLink
              to={{
                pathname: `/admin/${theme.localisation.programme.path}/`,
                query: { 'filter[genre]': resource.id },
              }}
            >
              {pluralize(theme.localisation.programme.lower)}
            </NavLink>{' '}
            first.
          </p>
          <Button
            type="button"
            className="button button--reversed"
            onClick={this.props.closeEvent}
          >
            Cancel
          </Button>
        </div>
      )
    } else {
      const type = resource['parent-id'] ? 'Sub Genre' : 'Genre'
      return (
        <div>
          <div className="cms-form__control">
            <p>
              Are you sure you want to delete the {type}{' '}
              <strong>{resource.name}</strong>?
            </p>
          </div>
          <div class="cms-form__control cms-form__control--actions">
            <Button
              type="button"
              className="button button--reversed"
              onClick={this.props.closeEvent}
            >
              Cancel
            </Button>
            <Button type="submit" className={buttonClasses}>
              Delete
            </Button>
          </div>
        </div>
      )
    }
  }
}

export default withTheme(GenreForm)
