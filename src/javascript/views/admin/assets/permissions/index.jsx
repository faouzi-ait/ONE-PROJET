/** http://0.0.0.0:8080/admin/assets/permissions */
import React, { useState, useEffect } from 'react'
import pluralize from 'pluralize'
import deepmerge from 'deepmerge-concat'

// Stores
import AssetCategoriesStore from 'javascript/stores/asset-categories'
import AssetMaterialStore from 'javascript/stores/asset-materials'

// Actions
import AssetCategoriesActions from 'javascript/actions/asset-categories'
import AssetMaterialActions from 'javascript/actions/asset-materials'

// Components
import ProgrammeSearchSuggestions from 'javascript/components/programme-search-suggestions'
import Button from 'javascript/components/button'
import Select from 'react-select'
import Meta from 'react-document-meta'
import PageLoader from 'javascript/components/page-loader'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Toggle from 'javascript/components/toggle'
import Modal from 'javascript/components/modal'
import AssetPermissionsForm from 'javascript/views/admin/assets/permissions/form'
import Card from 'javascript/components/admin/card'
import Notification from 'javascript/components/notification'
import Carousel from 'javascript/components/carousel'
import FormControl from 'javascript/components/form-control'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withPageHelper from 'javascript/components/hoc/with-page-helper'
import useApi from 'javascript/utils/hooks/use-api'

const makeSeriesOptions = (theme, programme, series) =>
  [
    {
      value: 'programme',
      type: 'programmes',
      id: programme.id,
      label: `${theme.localisation.programme.upper} Level`,
    },
  ].concat(
    (series || []).map(s => ({
      value: s.id + '-series',
      type: 'series',
      id: s.id,
      label: s.name,
    })),
  )

class AssetPermissionsIndex extends React.Component {
  state = {
    loading: false,
    categories: [],
    programmeResources: [],
    resources: [],
    selectedCategories: [],
    selectedResources: [],
    selectedSeries: [],
  }

  componentWillMount() {
    AssetCategoriesStore.on('change', this.setCategories)
    AssetMaterialStore.on('change', this.setResources)
  }

  componentWillUnmount() {
    AssetCategoriesStore.removeListener('change', this.setCategories)
    AssetMaterialStore.removeListener('change', this.setResources)
  }

  componentDidMount() {
    this.getCategories()
  }

  updateSelectedProgramme = selectedProgramme => {
    const { setSelectedProgramme } = this.props
    setSelectedProgramme(selectedProgramme)
    this.setState({
      resources: [],
      selectedSeries: [],
      selectedResources: [],
    })
  }

  updateSelectedCategories = selectedCategories => {
    this.setState(
      {
        selectedCategories,
      },
      () => {
        clearTimeout(this.requestTimer)
        this.requestTimer = setTimeout(this.getResources, 500)
      },
    )
  }

  updateSelectedSeries = selectedSeries => {
    this.setState(
      state => ({
        selectedSeries,
        resources: state.resources.filter(r => {
          return !!selectedSeries.find(
            s => s.type === r.parent.type && s.id === r.parent.id,
          )
        }),
      }),
      this.getResources,
    )
  }

  setCategories = () => {
    this.setState({
        categories: AssetCategoriesStore.getResources().map(c => ({
          value: c.id,
          label: c.name,
        })),
      },
      () => this.props.pageIsLoading(false)
    )
  }

  setResources = () => {
    const resources = AssetMaterialStore.getResources()
    const id = AssetMaterialStore.getId()
    if (id === 'programmes') {
      this.setState({
        programmeResources: resources,
      })
    } else {
      this.setState(
        {
          resources: resources,
          loading: false,
        },
        this.resetSelected,
      )
    }
  }

  resetSelected = () => {
    this.setState(state => ({
      selectedResources: state.selectedResources.filter(s => {
        return !!state.resources.find(r => r.id === s)
      }),
    }))
  }

  getCategories = () => {
    AssetCategoriesActions.getResources({
      fields: {
        'asset-categories': 'name',
      },
    })
  }

  getResources = () => {
    const { selectedProgramme, theme } = this.props
    if (!selectedProgramme) {
      return
    }

    let query = {
      include: 'asset-items,parent,restricted-users,restricted-companies,restricted-groups',
      fields: {
        'asset-materials': 'name,gallery,asset-items,parent,restricted-users,restricted-companies,restricted-groups',
        'asset-items': 'file,file-size,file-type,file-identifier',
        companies: 'name',
        groups: 'name',
        users: 'first-name,last-name,company-name',
        programmes: 'title',
        series: 'name',
      },
    }

    if (theme.features.restrictions.expiring) {
      query = deepmerge.concat(query, {
        include: 'restricted-asset-material-users',
        fields: {
          'asset-materials': 'restricted-asset-material-users',
          'restricted-asset-material-users': 'expires-after,restricted-user',
        }
      })
    }

    this.setState({
      programmeResources: [],
      resources: [],
      loading: true,
    })

    AssetMaterialActions.getResources(
      Object.assign({}, query, {
        filter: {
          asset_category_id: this.state.selectedCategories
            .map(c => c.value)
            .join(','),
          parent_id: this.state.selectedSeries.map(s => s.id).join(','),
          parent_type: 'series',
        },
      }),
      'series',
    )
    AssetMaterialActions.getResources(
      Object.assign({}, query, {
        filter: {
          asset_category_id: this.state.selectedCategories
            .map(c => c.value)
            .join(','),
          parent_id: selectedProgramme.id,
          parent_type: 'programme',
        },
      }),
      'programmes',
    )
  }

  selectResource = id => () => {
    this.setState(({ selectedResources }) => {
      const resources = [...selectedResources]
      if (resources.includes(id)) {
        resources.splice(resources.indexOf(id), 1)
      } else {
        resources.push(id)
      }
      return { selectedResources: resources }
    })
  }

  selectAll = (resource, alias) => () => {
    this.setState(
      state => ({
        [alias]: state[alias].length >= resource.length ? [] : resource,
      }),
      this.getResources,
    )
    return false
  }

  selectAllAssets = assets => () => {
    let { selectedResources } = this.state
    const idAssets = assets.map(i => i.id)
    const selected = !idAssets.some(a => !selectedResources.includes(a))
    if (selected) {
      selectedResources = selectedResources.filter(a => !idAssets.includes(a))
    } else {
      selectedResources = selectedResources.concat(idAssets)
    }
    this.setState({ selectedResources })
  }

  updateResources = state => {
    this.setState(
      ({ resources, selectedResources, programmeResources }) => {
        const reduceResources = (resource) => {
          if (selectedResources.includes(resource.id)) {
            const users = state.restrictedUsers.reduce((obj, user) => {
              return {
                ...obj,
                [user.id]: user,
              }
            }, {})

            const companies = state.restrictedCompanies.reduce((obj, company) => {
              return {
                ...obj,
                [company.id]: company,
              }
            }, {})

            const groups = state.restrictedGroups.reduce((obj, group) => {
              return {
                ...obj,
                [group.id]: group,
              }
            }, {})

            return {
              ...resource,
              'restricted-users': Object.values(users),
              'restricted-companies': Object.values(companies),
              'restricted-groups': Object.values(groups),
            }
          }
          return resource
        }
        return ({
          resources: resources.map(reduceResources),
          programmeResources: programmeResources.map(reduceResources),
          complete: true,
        })
      },
      this.props.modalState.hideModal()
    )
  }

  permissionsOverlay = () => {
    const { selectedProgramme, theme } = this.props
    const modalModifiers = []
    if (theme.features.restrictions.expiring) {
      modalModifiers.push('large')
    }
    this.setState({
        complete: false,
      }, () => {
      this.props.modalState.showModal(({ hideModal }) => (
        <Modal delay={500}
          modifiers={modalModifiers}
          closeEvent={hideModal}
        >
          <div className="cms-modal__content">
            <AssetPermissionsForm
              closeEvent={hideModal}
              update={this.updateResources}
              programme={selectedProgramme}
              resources={this.state.resources
                .concat(this.state.programmeResources)
                .filter(d => this.state.selectedResources.includes(d.id))}
            />
          </div>
        </Modal>
      ))
    })
  }

  renderAsset = (asset, key) => {
    const total = asset['asset-items'].length >= 4 ? 4 : 1
    const selected = this.state.selectedResources.includes(asset.id)
    return (
      <Card
        key={asset.id}
        classes={[selected && 'active', 'small']}
        images={asset['asset-items'].slice(0, total).map(f => f.file.thumb.url)}
        title={asset.name}
      >
        <Toggle
          classes={[selected && 'active']}
          onClick={this.selectResource(asset.id)}
        />
        {asset.gallery && <p className="card__copy">Gallery</p>}
        {asset['asset-items'][0] && (
          <p className="admin-card__copy card__copy--file">
            {asset['asset-items'][0]['file-identifier']}
          </p>
        )}
      </Card>
    )
  }

  render() {
    const { series, selectedProgramme, theme } = this.props
    const { categories, selectedCategories } = this.state
    const allSeriesSelected =
      this.state.selectedSeries.length === series.length && series.length > 0
    const allCategoriesSelected =
      selectedCategories.length === categories.length

    return (
      <Meta
        title={`${theme.localisation.client} :: ${
          theme.localisation.asset.upper
        } Permissions`}
        meta={{
          description: `Manage ${theme.localisation.asset.lower} permissions`,
        }}
      >
        <main>
          {this.state.complete && (
            <Notification complete={true}>Permissions Saved</Notification>
          )}

          <PageHeader
            title={`${pluralize(theme.localisation.asset.upper)} Permissions`}
          >
            <div className="page-header__actions">
              <FormControl label={theme.localisation.programme.upper}>
                <ProgrammeSearchSuggestions
                  clearQuery={true}
                  onSubmit={(value) => {
                    if (value['filter[keywords]'] === '') {
                      this.updateSelectedProgramme(null)
                    }
                  }}
                  onSuggestionSelected={(e, p) => {
                    this.updateSelectedProgramme(p.suggestion.programme)
                  }}
                  allProgrammes={true}
                />
              </FormControl>
            </div>
          </PageHeader>

          {selectedProgramme && (
            <div className="container">
              <div className="page-actions">
                <div className="cms-form__control">
                  <div className="checkbox">
                    <input
                      type="checkbox"
                      className="checkbox__input"
                      id="all-series"
                      checked={allSeriesSelected}
                      onChange={this.selectAll(series, 'selectedSeries')}
                    />
                    <label
                      htmlFor="all-series"
                      className="checkbox__label cms-form__label"
                    >
                      {allSeriesSelected && 'Un-'}Select all{' '}
                      {theme.localisation.series.upper}
                    </label>
                  </div>
                  <Select
                    options={series}
                    placeholder={`Select ${theme.localisation.series.upper}`}
                    onChange={this.updateSelectedSeries}
                    value={this.state.selectedSeries}
                    multi={true}
                  />
                </div>
                <div className="cms-form__control">
                  <div className="checkbox">
                    <input
                      type="checkbox"
                      className="checkbox__input"
                      id="all-categories"
                      checked={allCategoriesSelected}
                      onChange={this.selectAll(
                        categories,
                        'selectedCategories',
                      )}
                    />
                    <label
                      htmlFor="all-categories"
                      className="checkbox__label cms-form__label"
                    >
                      {allCategoriesSelected && 'Un-'}Select all Categories
                    </label>
                  </div>
                  <Select
                    options={categories}
                    placeholder="Select Categories..."
                    onChange={this.updateSelectedCategories}
                    value={this.state.selectedCategories}
                    multi={true}
                  />
                </div>
              </div>
            </div>
          )}

          {this.state.loading && <div className="loader" />}
          {!this.state.loading &&
            this.state.selectedCategories.length > 0 &&
            this.state.selectedSeries
              .filter(series => series.type === 'programmes')
              .map((series, key) => {
                const programmeAssets = this.state.programmeResources.filter(
                  ({ parent }) => parent.id === series.id,
                )
                const allSelected = programmeAssets.filter(a =>
                  this.state.selectedResources.includes(a.id),
                )
                const selected =
                  programmeAssets.every(a =>
                    this.state.selectedResources.includes(a.id),
                  ) && programmeAssets.length > 0
                return (
                  <div key={`programme-${key}`}>
                    {programmeAssets.length > 0 ? (
                      <div>
                        <div className="container">
                          <div className="checkbox">
                            <input
                              type="checkbox"
                              className="checkbox__input"
                              id={`programme-${key}`}
                              checked={selected}
                              onChange={this.selectAllAssets(programmeAssets)}
                            />
                            <label
                              htmlFor={`programme-${key}`}
                              className="checkbox__label cms-form__label"
                            >
                              {series.label} ({allSelected.length} /{' '}
                              {programmeAssets.length} Selected)
                            </label>
                          </div>
                        </div>
                        <Carousel
                          options={{
                            pager: true,
                            slidesToShow: 5,
                            slidesToScroll: 5,
                          }}
                        >
                          {programmeAssets.map(this.renderAsset)}
                        </Carousel>
                      </div>
                    ) : (
                      <div className="container">
                        <label className="cms-form__label">{series.label}</label>
                        <p>
                          No assets available for this{' '}
                          {theme.localisation.series.lower}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
          {!this.state.loading &&
            this.state.selectedCategories.length > 0 &&
            this.state.selectedSeries
              .filter(series => series.type === 'series')
              .map((series, key) => {
                const assets = this.state.resources.filter(
                  ({ parent }) => parent.id === series.id,
                )
                const allSelected = assets.filter(a =>
                  this.state.selectedResources.includes(a.id),
                )
                const selected =
                  assets.every(a =>
                    this.state.selectedResources.includes(a.id),
                  ) && assets.length > 0
                return (
                  <div key={key}>
                    {assets.length > 0 ? (
                      <div>
                        <div className="container">
                          <div className="checkbox">
                            <input
                              type="checkbox"
                              className="checkbox__input"
                              id={`series-${key}`}
                              checked={selected}
                              onChange={this.selectAllAssets(assets)}
                            />
                            <label
                              htmlFor={`series-${key}`}
                              className="checkbox__label cms-form__label"
                            >
                              {series.label} ({allSelected.length} /{' '}
                              {assets.length} Selected)
                            </label>
                          </div>
                        </div>
                        <Carousel
                          options={{
                            pager: true,
                            slidesToShow: 5,
                            slidesToScroll: 5,
                          }}
                        >
                          {assets.map(this.renderAsset)}
                        </Carousel>
                      </div>
                    ) : (
                      <div className="container">
                        <label className="cms-form__label">{series.label}</label>
                        <p>
                          No assets available for this{' '}
                          {theme.localisation.series.lower}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}

          {this.state.selectedResources.length > 0 && (
            <div className="sticky-actions">
              <div className="container">
                <div className="grid grid--end grid--center">
                  <p>
                    {this.state.selectedResources.length} /{' '}
                    {
                      this.state.resources.concat(
                        this.state.programmeResources,
                      ).length
                    }{' '}
                    Assets Selected
                  </p>
                  <Button
                    className="button button--filled"
                    onClick={this.permissionsOverlay}
                  >
                    Manage permissions
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </Meta>
    )
  }
}

const enhance = compose(
  withPageHelper,
  withHooks((props) => {
    const [selectedProgramme, setSelectedProgramme] = useState(null)
    const [series] = useGetSeriesByProgram((selectedProgramme || {}).id)
    return {
      selectedProgramme,
      setSelectedProgramme,
      series: makeSeriesOptions(props.theme, selectedProgramme || {}, series || []),
    }
  }),
)

export default enhance(AssetPermissionsIndex)

const useGetSeriesByProgram = programmeId => {
  const [state, fetchSeries] = useApi(api => () =>
    api.find('programme', programmeId, {
      include: 'series',
      fields: {
        programmes: 'series',
        series: 'name'
      }
    }),
  )

  useEffect(() => {
    if (programmeId) {
      fetchSeries(programmeId)
    }
  }, [programmeId])

  return [(state.data || {}).series || [], state.status]
}
