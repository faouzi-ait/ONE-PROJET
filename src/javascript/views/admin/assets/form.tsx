import React from 'react'
import ReactDOM from 'react-dom'
import NavLink from 'javascript/components/nav-link'
import Dropzone from 'react-dropzone'
import styled from 'styled-components'
import withTheme from 'javascript/utils/theme/withTheme'

// Store
import AssetMaterialStore from 'javascript/stores/asset-materials'
import SeriesStore from 'javascript/stores/series'

// Actions
import AssetMaterialActions from 'javascript/actions/asset-materials'
import SeriesActions from 'javascript/actions/series'
import AssetItemsService from 'javascript/services/asset-items'

// Components
import AsyncSearchProgrammes from 'javascript/components/async-search-programmes'
import Button from 'javascript/components/button'
import CustomCheckbox from 'javascript/components/custom-checkbox'
import Icon from 'javascript/components/icon'
import FormControl from 'javascript/components/form-control'
import Modal from 'javascript/components/modal'
import Select from 'react-select'

// Types
import {
  AssetMaterialType,
  LanguageType,
  SeriesType,
  AssetCategoryType,
  AssetItemType,
} from 'javascript/types/ModelTypes'

import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'


interface Props {
  resource: AssetMaterialType
  categories: AssetCategoryType[]
  languages: LanguageType[]
  selection: any
  theme: CustomThemeType
}

interface State {
  resource: AssetMaterialType
  externalFileAsset: AssetItemType | undefined
  loading: boolean
  rejectedFiles: boolean | number
  selectedProgramme: any
  selectedLanguages: LanguageType[]
  modal: () => any
  uploading?: boolean
  uploadProgress?: number
  errors?: {}
  series?: (SeriesType | { id: null; name: 'Programme Level' })[]
  currentSeries?: SeriesType | null
}

class AssetManagementForm extends React.Component<Props, State> {
  assetManager: AssetItemsService

  constructor(props) {
    super(props)
    this.state = {
      resource: props.resource,
      externalFileAsset: this.findExternalFileAsset(),
      loading: false,
      rejectedFiles: false,
      selectedProgramme:
        props.resource.parent.type === 'programmes'
          ? props.resource.parent
          : null,
      selectedLanguages: props.resource.languages || [],
      modal: () => {},
    }

    this.assetManager = new AssetItemsService({
      onUpload: () => {
        props.refresh()
        this.setState({
          uploading: false,
          uploadProgress: 0,
        })
      },
      onProgress: uploadProgress => {
        this.setState({
          uploadProgress,
        })
      },
      onError: errors => {
        this.setState({
          errors,
          uploading: false,
          uploadProgress: 0,
        })
      },
    })
  }

  componentWillMount() {
    AssetMaterialStore.on('error', this.retrieveErrors)
    SeriesStore.on('change', this.getSeries)
    if (this.props.resource.parent.type === 'programmes') {
      SeriesActions.getResources({
        page: { size: 200 },
        filter: { programme_id: this.state.resource.parent.id },
        fields: { series: 'name,id' },
      })
    } else {
      SeriesActions.getResource(this.state.resource.parent.id, {
        fields: {
          series: 'name,id,programme-title-with-genre,programme-id',
        },
      })
    }
  }

  componentWillUnmount() {
    AssetMaterialStore.removeListener('error', this.retrieveErrors)
    SeriesStore.removeListener('change', this.getSeries)
    AssetMaterialStore.unsetResource()
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      resource: nextProps.resource,
      externalFileAsset: this.findExternalFileAsset()
    })
    this.unsetModal()
  }

  findExternalFileAsset = () => {
    return this.props.resource['asset-items'].find((item) => item['external-file-url']?.length > 0)
  }

  getSeries = () => {
    this.setState(
      {
        series: SeriesStore.getResources(),
        currentSeries: SeriesStore.getResource(),
      },
      () => {
        if (this.state.currentSeries) {
          const programmeId = this.state.currentSeries['programme-id']
          SeriesStore.unsetResource()
          this.setState(
            {
              currentSeries: null,
              selectedProgramme: {
                id: programmeId,
                'title-with-genre': this.state.currentSeries['programme-title-with-genre']
              },
            },
            () => {
              SeriesActions.getResources({
                page: { size: 200 },
                filter: { programme_id: programmeId },
                fields: { series: 'name,id' },
              })
            },
          )
        }
      },
    )
  }

  retrieveErrors = () => {
    this.setState({
      errors: AssetMaterialStore.getErrors(),
      loading: false,
    })
  }

  renderErrors = () => {
    if (this.state.errors) {
      return (
        <ul className="cms-form__errors">
          {Object.keys(this.state.errors).map((key, i) => {
            const error = this.state.errors[key]
            return <li key={i}>{error}</li>
          })}
        </ul>
      )
    }
  }

  handleInputChange = e => {
    const resource = this.state.resource
    resource[e.target.name] = e.target.value
    this.setState({
      resource,
    })
  }

  updateProgramme = value => {
    const { resource } = this.state
    resource.parent = value
    this.setState(
      {
        resource,
        selectedProgramme: value,
      },
      () => {
        SeriesActions.getResources({
          page: { size: 200 },
          filter: { programme_id: this.state.resource.parent.id },
          fields: { series: 'name,id' },
        })
      },
    )
  }

  updateSeries = value => {
    const { resource, selectedProgramme } = this.state
    if (value.id) {
      resource.parent = value
      this.setState({
        resource,
      })
    } else {
      resource.parent = selectedProgramme
      this.setState({
        resource,
      })
    }
  }

  updateLanguages = selectedLanguages => {
    const { resource } = this.state
    resource['languages'] = selectedLanguages
    this.setState({
      selectedLanguages,
      resource,
    })
  }

  updateCategory = value => {
    const { resource } = this.state
    resource['asset-category'] = value
    this.setState({
      resource,
    })
  }

  unsetModal = () => {
    if (this.refs.modal) {
      ReactDOM.findDOMNode(this.refs.modal).classList.add('modal--is-hiding')
      setTimeout(() => {
        this.setState({
          modal: () => {},
        })
      }, 500)
    }
  }

  confirmAssetDeletion = item => {
    this.setState({
      modal: () => {
        return (
          <Modal
            closeEvent={this.unsetModal}
            title="Warning"
            modifiers={['warning']}
            titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}
            ref="modal"
          >
            <div className="cms-modal__content">
              <div className="cms-form__control u-align-center">
                <p>
                  Are you sure you wish to delete the file{' '}
                  {item['file-identifier']}?
                </p>
              </div>
              <div className="cms-form__control cms-form__control--actions">
                <Button
                  type="button"
                  className="button button--reversed"
                  onClick={this.unsetModal}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="button button--filled button--reversed"
                  onClick={() => {
                    this.deleteItem(item)
                  }}
                >
                  Yes, Delete!
                </Button>
              </div>
            </div>
          </Modal>
        )
      },
    })
  }

  uploadFiles = (uploadedFiles, rejectedFiles) => {
    const files = uploadedFiles.map((file) => {
      const newFile: Blob & {
        name?: string
        lastModifiedDate?: Date
        lastModified?: number
      } = new Blob([file], { type: file.type })
      newFile.name = file.name.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '')
      const now = Date.now()
      newFile.lastModifiedDate = new Date(now)
      newFile.lastModified = now
      return file = newFile
    })

    if (files.length) {
      this.setState({
        uploading: true,
      })
      this.assetManager.uploadAssets(files, this.state.resource.id)
    }
    if (rejectedFiles.length) {
      this.setState({
        rejectedFiles: rejectedFiles.length
      }, () => {
        setTimeout(() => {
          this.setState({
            rejectedFiles: false
          })
        }, 3000)
      })
    }
  }

  deleteItem = item => {
    this.assetManager.deleteItem(item.id)
  }

  saveResource = (e) => {
    e.preventDefault()
    this.setState({ loading: true })
    const resource = Object.assign({}, this.state.resource)
    if (resource.hasOwnProperty('programme-name')) delete resource['programme-name']
    if (resource.hasOwnProperty('programme-id')) delete resource['programme-id']
    if (resource.hasOwnProperty('series-name')) delete resource['series-name']
    if (resource.hasOwnProperty('updatable')) delete resource['updatable']
    AssetMaterialActions.saveResource(resource, this.state.externalFileAsset)
    if (this.findExternalFileAsset()['external-file-url'] !== this.state.externalFileAsset['external-file-url']) {
    }
  }

  render() {
    const { resource, loading, series, selectedProgramme } = this.state
    const { theme } = this.props
    const buttonClasses = loading
      ? 'button button--filled button--loading'
      : 'button button--filled'
    const selectedSeries =
      resource.parent.type === 'programmes'
        ? { name: 'Programme Level', id: null }
        : resource.parent
    if (
      series &&
      ((series[0] && series[0].id !== null) || series === undefined)
    ) {
      series.unshift({
        name: 'Programme Level',
        id: null,
      })
    }
    return (
      <div className="container">
        <form className="cms-form cms-form--large" onSubmit={this.saveResource}>
          <h3 className="cms-form__title">{theme.localisation.asset.upper} Details</h3>
          <FormControl
            type="text"
            label={`${theme.localisation.asset.upper} name`}
            name="name"
            value={resource.name}
            onChange={this.handleInputChange}
          />
          <FormControl label={`${theme.localisation.programme.upper}`}>
            <AsyncSearchProgrammes
              value={selectedProgramme}
              onChange={this.updateProgramme}
            ></AsyncSearchProgrammes>
          </FormControl>
          <FormControl label={`${theme.localisation.series.upper}`}>
            <Select
              labelKey="name"
              valueKey="id"
              options={series}
              multi={false}
              clearable={false}
              value={selectedSeries}
              onChange={this.updateSeries}
            />
          </FormControl>
          <FormControl label={`${theme.localisation.asset.upper} type`}>
            <Select
              labelKey="name"
              valueKey="id"
              options={this.props.categories}
              value={resource['asset-category']}
              multi={false}
              clearable={false}
              onChange={this.updateCategory}
            />
          </FormControl>
          { this.state.externalFileAsset &&
            <FormControl
              type="text"
              label={`External File Url`}
              name="external-file-url"
              value={this.state.externalFileAsset['external-file-url']}
              onChange={({target}) => this.setState({
                externalFileAsset: {
                  ...this.state.externalFileAsset,
                  'external-file-url': target.value
                }
              })}
            />
          }
          {theme.features.assetLanguages && (
            <FormControl label="Languages">
              <Select
                options={this.props.languages}
                value={this.state.selectedLanguages}
                multi={true}
                valueKey="id"
                labelKey="name"
                onChange={this.updateLanguages}
              />
            </FormControl>
          )}
          {resource.gallery && (
            <div>
              <h3 className="cms-form__title">Gallery Images</h3>
              <div className="grid">
                {resource['asset-items'].map((item, i) => (
                  <div className="grid__item" key={i}>
                    <img src={item.file.thumb.url} alt="" />
                    <Button
                      type="button"
                      className="grid__delete"
                      onClick={() => {
                        this.confirmAssetDeletion(item)
                      }}
                    >
                      <Icon id="i-close" />
                    </Button>
                  </div>
                ))}
              </div>
              <Dropzone
                onDrop={this.uploadFiles}
                accept={theme.features.acceptedFileTypes.gallery}
                maxSize={524288000}
              >
                {({ getRootProps, getInputProps }) => (
                  <div className="dropzone" {...getRootProps()}>
                    {this.state.uploading ? (
                      <span>{this.state.uploadProgress}%</span>
                    ) : (
                      <span>+ Click / Drag files to upload</span>
                    )}
                    { this.state.rejectedFiles && (
                      <DropzoneWarning>{this.state.rejectedFiles} {`${this.state.rejectedFiles === 1 ? 'file has' : 'files have'}`} been rejected</DropzoneWarning>
                    )}
                    <input {...getInputProps()} />
                  </div>
                )}
              </Dropzone>
            </div>
          )}
          <FormControl label="Asset Restriction">
            <CustomCheckbox
              label="Restricted"
              name="restricted"
              checked={resource.restricted}
              id="restricted"
              onChange={(e)=>{
                this.setState({
                  resource: {
                    ...this.state.resource,
                    'restricted': e.target.checked,
                    'public-asset': false
                  },
                })
              }}
            />
            <CustomCheckbox
              label="Public"
              name="public-asset"
              checked={resource['public-asset']}
              id="public-asset"
              onChange={(e)=>{
                this.setState({
                  resource: {
                    ...this.state.resource,
                    'public-asset': e.target.checked,
                    'restricted': false
                  },
                })
              }}
            />
          </FormControl>
          <div className="cms-form__control cms-form__control--actions">
            {this.renderErrors()}
            <NavLink
              className="button"
              to={{
                pathname: `/admin/${theme.localisation.asset.path}/management`,
                state: this.props.selection,
              }}
            >
              Cancel
            </NavLink>
            <Button type="submit" className={buttonClasses}>
              Save {theme.localisation.asset.upper}
            </Button>
          </div>
        </form>
        {this.state.modal()}
      </div>
    )
  }
}

const DropzoneWarning = styled.div`
  position: relative;
  top: 25px;
  font-weight: bold;
`

export default withTheme(AssetManagementForm)