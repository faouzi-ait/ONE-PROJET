import React from 'react'
import pluralize from 'pluralize'
import { compose } from 'redux'

import { fileSizeString } from 'javascript/utils/generic-tools'
import { findAllByModel } from 'javascript/utils/apiMethods'
import useLoadInWave from 'javascript/utils/hooks/use-load-in-wave'
import useProgrammesAutosuggest from 'javascript/utils/hooks/use-programmes-autosuggest'
import withHooks from 'javascript/utils/hoc/with-hooks'

// Actions
import AssetCategoriesActions from 'javascript/actions/asset-categories'
import SeriesActions from 'javascript/actions/series'
import AssetMaterialActions from 'javascript/actions/asset-materials'

// Stores
import AssetCategoriesStore from 'javascript/stores/asset-categories'
import ProgrammesStore from 'javascript/stores/programmes'
import SeriesStore from 'javascript/stores/series'
import AssetMaterialsStore from 'javascript/stores/asset-materials'

// Components
import Asset from 'javascript/components/asset'
import Button from 'javascript/components/button'
import CategoryForm from 'javascript/views/admin/assets/categories/form'
import Icon from 'javascript/components/icon'
import {
  ListNavigator,
  ListNavigatorColumn,
} from 'javascript/components/admin/list-navigator'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import Uploader from 'javascript/components/uploader'

// Global State Memory Hack
import assetMemory from 'javascript/views/admin/assets/asset-memory'

// Types
import {
  SeriesType,
  AssetCategoryType,
  AssetMaterialType,
  ProgrammeSearchResultType,
} from 'javascript/types/ModelTypes'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

type Props = {
  location: {
    state: unknown
  }
  theme: CustomThemeType
} & ReturnType<typeof useLogic>

interface State {
  modal: () => any
  uploader: () => any
  selection: {
    assets?: {}[]
    programme?: ProgrammeSearchResultType
    programmeSuggestions?: ProgrammeSearchResultType[]
    series?: SeriesType
    assetCategory?: AssetCategoryType
  }
  showCategories?: boolean
  series?: SeriesType[]
  assetCategories?: AssetCategoryType[]
  programmes?: ProgrammeSearchResultType[]
  files?: unknown
  progress?: number
  assetMaterialFilter: {
    asset_category_id?: string
    parent_type?: 'Programme' | 'Series'
    parent_id?: string
    search?: string
    updateable?: boolean
  }
  rejectedFiles?: unknown[]
  programmesInputValue: string
}

class AssetManagementIndex extends PageHelper<Props, State> {

  memoryState: any

  constructor(props) {
    super(props)
    ProgrammesStore.unsetResources()
    const initialState: State = {
      selection: {
        programme: null,
        programmeSuggestions: null,
        series: null,
        assetCategory: null,
        assets: [],
      },
      assetMaterialFilter: {},
      series: null,
      assetCategories: null,
      progress: null,
      modal: () => {},
      uploader: () => {},
      programmesInputValue: '',
    }
    this.memoryState = props.location.state?.hasMemory
      ? assetMemory.getMemory()
      : null

    this.state = this.memoryState || initialState
    if (this.memoryState) {
      // @ts-ignore
      this.state.modal = () => {}
      // @ts-ignore
      this.state.uploader = () => {}
      this.state.selection.assets = []
    }
  }

  componentWillMount() {
    AssetCategoriesStore.on('change', this.getResources)
    ProgrammesStore.on('change', this.getResources)
    SeriesStore.on('change', this.getResources)
    AssetMaterialsStore.on('change', this.onAssetChange)
    AssetMaterialsStore.on('delete', this.onAssetChange)
    AssetMaterialsStore.on('progress', this.getProgress)
    AssetMaterialsStore.on('create', this.onAssetChange)
    window.addEventListener('scroll', this.checkPosition)
    SeriesStore.unsetResources()
    AssetCategoriesStore.unsetResources()
  }

  componentWillUnmount() {
    AssetCategoriesStore.removeListener('change', this.getResources)
    ProgrammesStore.removeListener('change', this.getResources)
    SeriesStore.removeListener('change', this.getResources)
    AssetMaterialsStore.removeListener('change', this.onAssetChange)
    AssetMaterialsStore.removeListener('delete', this.onAssetChange)
    AssetMaterialsStore.removeListener('create', this.onAssetChange)
    AssetMaterialsStore.removeListener('progress', this.getProgress)
    window.removeEventListener('scroll', this.checkPosition)
  }

  onAssetChange = () => {
    this.collectAssets()
    this.unsetModal()
    this.closeUploader()
  }

  componentDidMount() {
    if (this.memoryState) {
      this.finishedLoading()
      this.collectAssets()
    } else {
      AssetCategoriesActions.getResources({
        fields: {
          'asset-categories': 'name,asset-materials-count',
        },
      })
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState !== this.state) {
      // mono-repo: global memory hack - read comments in assetMemory
      assetMemory.setMemory(this.state)
    }
    const stringifyIds = (arr) => arr.map((item) => item.id).join(',')
    if (stringifyIds(prevProps.programmeSuggestions) !== stringifyIds(this.props.programmeSuggestions)) {
      //@ts-ignore
      this.setState({
        selection: {
          ...this.state.selection,
          programmeSuggestions: this.props.programmeSuggestions as ProgrammeSearchResultType[]
        }
      })
    }
  }

  checkPosition = () => {
    const container: any = this.refs.stickyContainer
    const elem: any = this.refs.stickyElement
    const height = elem.clientHeight
    const offset = container.offsetTop
    const top =
      typeof window.scrollY === 'undefined'
        ? window.pageYOffset
        : window.scrollY
    if (top > offset) {
      elem.classList.add('sticky')
      container.style['padding-top'] = height + 'px'
    } else {
      container.style['padding-top'] = '0'
      elem.classList.remove('sticky')
    }
  }

  getResources = () => {
    let series
    if (!this.state.series) {
      series = SeriesStore.getResources()
      if (series) {
        series.unshift({
          id: null,
          name: `${this.props.theme.localisation.programme.upper} Level`,
        })
      }
    } else {
      series = this.state.series
    }

    let assetCategories
    if (!this.state.assetCategories) {
      assetCategories = AssetCategoriesStore.getResources()
      if (assetCategories) {
        assetCategories.unshift({
          id: null,
          name: 'All categories',
        })
      }
    } else {
      assetCategories = this.state.assetCategories
    }

    const { selection } = this.state
    selection.assets = []

    this.setState(
      {
        programmes: ProgrammesStore.getResources(),
        series: series,
        assetCategories: assetCategories,
        files: null,
        selection,
      },
      () => {
        if (this.state.programmes) {
          const { selection, series } = this.state
          if (selection.programme) {
            selection.programme = this.state.programmes.find(
              ({ id }) => id === selection.programme.id,
            )
            if (series) {
              series[0]['asset-materials-count'] =
                selection.programme['asset-materials-count']
              this.setState({
                selection,
                series,
              })
            }
          }
        }
        this.unsetModal()
        this.closeUploader()
        this.finishedLoading()
      },
    )
  }

  getProgress = () => {
    this.setState({
      progress: AssetMaterialsStore.getProgress(),
    })
  }

  newAssetCategory = () => {
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={this.unsetModal}
            title={`New ${this.props.theme.localisation.asset.upper} Category`}
            titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}
          >
            <div className="cms-modal__content">
              <CategoryForm resource={{}} method="createResource" />
            </div>
          </Modal>
        )
      },
    })
  }

  selectProgramme = programme => {
    const update = this.state.selection
    update.programme = programme
    update.series = null
    update.assetCategory = null
    update.assets = []
    this.setState({
      series: null,
      selection: update,
      showCategories: false,
    })
    this.props.updateAssetsInCache([])
    AssetCategoriesStore.unsetResources()
    SeriesActions.getResources({
      filter: {
        programme_id: programme.id,
      },
      fields: {
        series: 'name,asset-materials-count',
      },
    })
  }

  selectSeries = series => {
    const update = this.state.selection
    update.series = series
    update.assets = []
    update.assetCategory = null
    this.setState({
      selection: update,
      showCategories: true,
    })
    this.props.updateAssetsInCache([])
  }

  selectAssetCategory = assetCategory => {
    const update = this.state.selection
    update.assetCategory = assetCategory
    this.setState(
      {
        selection: update,
      },
      () => {
        this.collectAssets()
      },
    )
    this.props.updateAssetsInCache([])
  }

  collectAssets = () => {
    const { selection } = this.state
    const update = this.state.assetMaterialFilter
    if (selection.assetCategory?.id) {
      update.asset_category_id = selection.assetCategory.id
    } else {
      delete update.asset_category_id
    }
    if (selection.programme?.id || selection.series?.id) {
      if (selection.series.id === null) {
        update.parent_type = 'Programme'
        update.parent_id = selection.programme.id
      } else {
        update.parent_type = 'Series'
        update.parent_id = selection.series.id
      }
    }
    if(this.props.theme.features.assetsManagement.updateableAssets){
      update.updateable = true
    }
    selection.assets = []
    this.props.updateAssetsInCache([])
    this.setState(
      {
        assetMaterialFilter: update,
        selection: selection,
      },
      () => {
        this.props.searchForAssetMaterials(this.state.assetMaterialFilter)
      },
    )
  }

  filterProgrammes = e => {
    const value = e.target.value
    SeriesStore.unsetResources()
    this.setState({
      selection: {
        programme: null,
        programmeSuggestions: null,
        series: null,
        assetCategory: null,
        assets: [],
      },
      series: null,
      showCategories: false,
      programmesInputValue: value,
    })
    this.props.searchProgrammes(value)
    this.props.updateAssetsInCache(null)
  }

  addFiles = (files, rejectedFiles) => {
    this.setState({
      files,
      rejectedFiles,
    })
  }

  uploadFiles = ({ gallery, restricted, publicAsset, externalUrl }) => {
    const { selection, files } = this.state
    const material = {
      name: 'New File',
      'asset-category': selection.assetCategory,
      parent: selection.series.id ? selection.series : selection.programme,
      gallery,
      restricted,
      'public-asset': publicAsset,
      externalUrl
    }
    AssetMaterialActions.createResource(material, files)
  }

  newAsset = () => {
    this.setState({
      uploader: () => {
        return (
          <Uploader
            ref="uploader"
            onDrop={this.addFiles}
            files={this.state.files}
            rejectedFiles={this.state.rejectedFiles}
            onSubmit={this.uploadFiles}
            onClose={this.closeUploader}
            progress={this.state.progress}
            type="assets"
            max={524288000}
          />
        )
      },
    })
  }

  closeUploader = (cancel?: boolean) => {
    this.setState({
      files: null,
    })
    this.setState({
      uploader: () => {},
      progress: null,
    })
  }

  toggleAsset = asset => {
    const { selection } = this.state
    if (selection.assets.includes(asset.id)) {
      selection.assets = selection.assets.filter(id => id !== asset.id)
    } else {
      selection.assets.push(asset.id)
    }
    this.setState({
      selection,
    })
  }

  selectAll = asset => {
    const { selection } = this.state
    const { assetMaterials } = this.props

    selection.assets = assetMaterials.map(asset => asset.id)

    this.setState({
      selection,
    })
  }

  unSelectAll = () => {
    const { selection } = this.state
    selection.assets = []
    this.setState({
      selection,
    })
  }

  renderSelectionText() {
    const { selection } = this.state
    const { theme } = this.props
    if (selection.assetCategory) {
      if (selection.assets.length > 0) {
        return (
          <span className="list-controls__count">
            {selection.assets.length}{' '}
            {selection.assets.length === 1
              ? theme.localisation.asset.upper
              : pluralize(theme.localisation.asset.upper)}{' '}
            selected
          </span>
        )
      } else {
        return (
          <span className="list-controls__count">Select or upload {pluralize(theme.localisation.asset.lower)}</span>
        )
      }
    } else if (selection.series) {
      return <span className="list-controls__count">Select an {theme.localisation.asset.upper} Type</span>
    } else if (selection.programme) {
      return <span className="list-controls__count">Select a {theme.localisation.series.upper}</span>
    } else {
      return <span className="list-controls__count">Select a {theme.localisation.programme.upper}</span>
    }
  }

  confirmDeletion = () => {
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
                  Are you sure you wish to delete the selected{' '}
                  {this.state.selection.assets.length === 1
                    ? this.props.theme.localisation.asset.lower
                    : pluralize(this.props.theme.localisation.asset.lower)}
                  ?
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
                  onClick={this.deleteMaterials}
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

  deleteMaterials = () => {
    AssetMaterialActions.deleteResources(this.state.selection.assets)
  }

  filesTimer: any

  filterFiles = (e) => {
    clearTimeout(this.filesTimer)
    const update = this.state.assetMaterialFilter
    if (e.target.value === '') {
      delete update.search
    } else {
      update.search = e.target.value
    }
    this.setState({
      assetMaterialFilter: update,
    }, () => {
      this.filesTimer = setTimeout(() => {
        this.collectAssets()
      }, 300)
    })
  }

  render() {
    const { selection } = this.state
    const { assetMaterials, theme } = this.props
    const assetsRendered = assetMaterials && assetMaterials.length > 0
    const actionName = selection.assetCategory
      ? selection.assetCategory.name
      : ''

    const programmes = selection.programmeSuggestions

    return (
      <Meta
        title={`${theme.localisation.client} :: ${pluralize(
          theme.localisation.asset.upper,
        )}`}
        meta={{
          description: `Manage your ${pluralize(theme.localisation.asset.lower)}`,
        }}
      >
        <PageLoader {...this.state}>
          <main>
            <PageHeader
              title={`Manage ${pluralize(theme.localisation.asset.upper)}`}
              subtitle={`To upload new ${pluralize(
                theme.localisation.asset.lower,
              )}, first select a ${theme.localisation.programme.lower}, ${
                theme.localisation.series.lower
              } and ${theme.localisation.asset.lower} type...`}
            >
              <Button className="button" onClick={this.newAssetCategory}>
                <Icon
                  width="14"
                  height="14"
                  id="i-admin-add"
                  classes="button__icon"
                />
                New {theme.localisation.asset.upper} Category
              </Button>
            </PageHeader>

            <div className="container">
              <div ref="stickyContainer" className="sticky-container">
                <div ref="stickyElement">
                  <div className="list-controls">
                    <div>
                      <div className="list-controls__list">
                        {this.renderSelectionText()}
                        {selection.assetCategory &&
                          assetMaterials &&
                          assetMaterials.length > 0 && <span>|</span>}
                        {selection.assetCategory &&
                          assetMaterials &&
                          assetMaterials.length > 0 && (
                            <Button
                              className="text-button"
                              onClick={
                                selection.assets.length >=
                                assetMaterials.length
                                  ? this.unSelectAll
                                  : this.selectAll
                              }
                            >
                              {selection.assets.length >=
                                assetMaterials.length && 'Un-'}
                              Select All
                            </Button>
                          )}
                      </div>
                    </div>
                    <div>
                      <div className="list-controls__list">
                        {selection.assets.length > 0 && (
                          <Button
                            className="button button--small button--error"
                            onClick={this.confirmDeletion}
                          >
                            Delete Selected{' '}
                            {selection.assets.length === 1
                              ? theme.localisation.asset.upper
                              : pluralize(theme.localisation.asset.upper)}
                          </Button>
                        )}
                        {selection.assets.length === 1 && (
                          <NavLink
                            className="button button--filled button--small"
                            to={{
                              pathname: `/admin/${theme.localisation.asset.path}/management/${selection.assets[0]}/edit`,
                              state: { hasMemory: true },
                            }}
                          >
                            Edit
                          </NavLink>
                        )}
                        {selection.assets.length > 0 && (
                          <Button
                            className="button button--small button--null"
                            onClick={this.unSelectAll}
                          >
                            Exit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="container">
              <ListNavigator>
                <ListNavigatorColumn
                  loading={this.props.programmesAreLoading}
                  modifiers={[]}
                  selected={selection.programme}
                  title={theme.localisation.programme.upper}
                  items={programmes}
                  onClick={this.selectProgramme}
                  nameIdentifier="title-with-genre"
                  display={true}
                  onSearch={this.filterProgrammes}
                  value={this.state.programmesInputValue}
                  placeholder={`Search for a ${theme.localisation.programme.lower}...`}
                >
                  {this.state.programmesInputValue &&
                    programmes &&
                    programmes.length < 1 && (
                      <p className="cms-list-navigator__no-results">
                        No {pluralize(theme.localisation.programme.lower)} found
                      </p>
                    )}
                </ListNavigatorColumn>

                <ListNavigatorColumn
                  modifiers={['small']}
                  selected={selection.series}
                  title={theme.localisation.series.upper}
                  items={this.state.series}
                  onClick={this.selectSeries}
                  nameIdentifier="name"
                  display={true}
                />

                <ListNavigatorColumn
                  modifiers={['small']}
                  selected={selection.assetCategory}
                  title={`${theme.localisation.asset.upper} Category`}
                  items={this.state.assetCategories}
                  display={this.state.showCategories}
                  onClick={this.selectAssetCategory}
                  nameIdentifier="name"
                />

                <ListNavigatorColumn
                  loading={this.props.areAssetMaterialsLoading}
                  modifiers={['large']}
                  title="Files"
                  onSearch={this.filterFiles}
                  value={this.state.assetMaterialFilter.search}
                  placeholder="Search for a filename..."
                  items={assetsRendered}
                  display={true}
                  hideSearch={!selection.assetCategory}
                  action={
                    selection.assetCategory &&
                    selection.assetCategory.id && {
                      name: `Upload ${actionName}`,
                      onClick: this.newAsset,
                    }
                  }
                >
                  {assetMaterials &&
                    assetMaterials.map((asset, i) => {
                      const isSelected = selection.assets.includes(asset.id)
                      let fileSize = 0
                      asset['asset-items'].map(file => {
                        fileSize += file['file-size']
                      })
                      return (
                        <Asset
                          key={i}
                          asset={asset}
                          size={fileSizeString(fileSize)}
                          classes={isSelected && ['is-active']}
                          selected={isSelected}
                          onClick={() => {
                            this.toggleAsset(asset)
                          }}
                        />
                      )
                    })}
                  {selection.assetCategory &&
                    assetMaterials &&
                    assetMaterials.length < 1 && (
                      <p className="cms-list-navigator__no-results">
                        No {pluralize(theme.localisation.asset.lower)} found
                      </p>
                    )}
                </ListNavigatorColumn>
              </ListNavigator>
            </div>
            {this.state.modal()}
            {this.state.uploader()}
          </main>
        </PageLoader>
      </Meta>
    )
  }
}

const useLogic = (props) => {

  const { programmeSuggestions, searchProgrammes, isLoading } = useProgrammesAutosuggest({
    buildParams: value => {
      const filter = {
        keywords: encodeURIComponent(value)
      }
      if(props.theme.features.assetsManagement.updateableProgrammes){
        filter['updateable'] = true
      }
      return ({
        filter
      })
    }
  })

  const { fetchQuery, updateCache, status, data } = useLoadInWave<
    (filter: State['assetMaterialFilter']) => Promise<AssetMaterialType[]>
  >({
    query: ({ page, pageSize }, filter) =>
      findAllByModel('asset-materials', {
        fields: ['name', 'asset-category', 'asset-items', 'gallery', 'restricted', 'public-asset'],
        include: ['asset-items', 'asset-category'],
        includeFields: {
          'asset-categories': ['name'],
          'asset-items': ['file-type', 'file-size', 'file', 'file-identifier'],
        },
        filter,
        page: {
          size: pageSize,
          number: page,
        },
      }),
    pageSize: 7,
  })

  const areAssetMaterialsLoading = status === 'loading'

  return {
    programmeSuggestions,
    searchProgrammes,
    areAssetMaterialsLoading,
    searchForAssetMaterials: fetchQuery,
    assetMaterials: data,
    updateAssetsInCache: updateCache,
    programmesAreLoading: isLoading,
  }
}

export default compose(withHooks(useLogic))(AssetManagementIndex)
