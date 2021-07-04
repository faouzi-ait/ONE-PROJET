import React from 'react'
import pluralize from 'pluralize'
import moment from 'moment'

// Stores
import AssetsAccessReportsStore from 'javascript/stores/asset-access-reports'
import AssetCategoriesStore from 'javascript/stores/asset-categories'

// Actions
import AssetsAccessReportsActions from 'javascript/actions/asset-access-reports'
import AssetCategoriesActions from 'javascript/actions/asset-categories'

// Components
import Button from 'javascript/components/button'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Select from 'react-select'

import Paginator from 'javascript/components/paginator'
import {
  AssetMaterialType,
  AssetCategoryType,
  UserType,
  CompanyType,
  SeriesType,
  ProgrammeType,
  AssetMaterialSearchResultType,
  ProgrammeSearchResultType,
  GroupType
} from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import useTheme from 'javascript/utils/theme/useTheme'
import useAutosuggestLogic from 'javascript/utils/hooks/use-autosuggest-logic'
import { findAllByModel, query } from 'javascript/utils/apiMethods'
import AsyncSearchProgrammes from 'javascript/components/async-search-programmes'

interface Props {
  theme: ThemeType
}

interface State {
  searchBy: {
    value: 'user'
    label: string
  }
  assets: AssetMaterialType[] & { meta?: { totalPages: number } }
  users: UserType[]
  totalPages?: number
  companies: CompanyType[]
  categories: AssetCategoryType[]
  selectedResource:
    | AssetMaterialType
    | CompanyType
    | GroupType
    | (UserType & { name: string })
  selectedSeries: SeriesType[]
  selectedCategories: AssetCategoryType[]
  selectedProgramme: ProgrammeSearchResultType & ProgrammeType
  page: {
    number: number
    size: number
  }
  loaded: boolean
  errored: boolean
}

export default class AccessReports extends React.Component<Props, State> {
  query: {}
  constructor(props) {
    super(props)
    this.state = {
      searchBy: { value: 'user', label: 'Search by user' },
      assets: [],
      users: [],
      companies: [],
      selectedSeries: [],
      selectedCategories: [],
      categories: [],
      selectedProgramme: null,
      selectedResource: null,
      page: {
        number: 1,
        size: 48,
      },
      errored: false,
      loaded: true,
    }

    this.query = {}
  }

  componentWillMount() {
    AssetsAccessReportsStore.on('change', this.setAssets)
    AssetCategoriesStore.on('change', this.setCategories)
  }

  componentWillUnmount() {
    AssetsAccessReportsStore.removeListener('change', this.setAssets)
    AssetCategoriesStore.removeListener('change', this.setCategories)
  }

  finishedLoading = () => {
    this.setState({ loaded: true })
  }

  setCategories = () => {
    this.setState(
      {
        categories: AssetCategoriesStore.getResources(),
      },
      this.finishedLoading,
    )
  }

  componentDidMount() {
    AssetCategoriesActions.getResources({
      fields: {
        'asset-categories': 'name',
      },
    })
  }

  setAssets = () => {
    this.setState(
      {
        assets: AssetsAccessReportsStore.getResources(),
      },
      this.finishedLoading,
    )
    if (this.state.assets) {
      this.setState({
        totalPages: this.state.assets.meta['page-count'],
      })
    }
  }

  getUsers = () => {
    const { selectedResource } = this.state
    this.query = {
      'parent-type': selectedResource.type,
      'parent-id': selectedResource.id,
    }
    AssetsAccessReportsActions.getResources({
      include: 'restricted-users',
      fields: {
        users: 'first-name,last-name',
      },
      filter: this.query,
      page: this.state.page,
    })
  }

  componentDidUpdate(_, prevState: State) {
    const arrayHasChanged = (key: 'selectedSeries' | 'selectedCategories') => {
      return prevState[key]?.length !== this.state[key]?.length
    }
    const itemHasChanged = (key: 'selectedProgramme' | 'selectedResource') => {
      return prevState[key]?.id !== this.state[key]?.id
    }
    if (
      arrayHasChanged('selectedSeries') ||
      arrayHasChanged('selectedCategories') ||
      itemHasChanged('selectedProgramme') ||
      itemHasChanged('selectedResource')
    ) {
      this.getAssets()
    }
  }

  getAssets = () => {
    const {
      selectedResource,
      selectedProgramme,
      selectedCategories,
      selectedSeries,
    } = this.state
    if (!selectedResource) {
      return
    }
    if (selectedResource.type === 'asset-materials') {
      this.getUsers()
    } else {
      const categories = selectedCategories
        .map((category, i) => {
          return category.id
        })
        .join(',')
      const series = selectedSeries
        .map((category, i) => {
          return category.id
        })
        .join(',')
      this.query = {
        'parent-type': selectedResource.type,
        'parent-id': selectedResource.id,
      }
      if (selectedSeries.length > 0) {
        this.query['search-by-series-ids'] = series
      } else if (selectedProgramme) {
        this.query['search-by-programme-id'] = selectedProgramme.id
      }
      if (selectedCategories.length > 0) {
        this.query['search-by-categories-ids'] = categories
      }

      AssetsAccessReportsActions.getResources({
        include: 'asset-items,asset-category',
        fields: {
          'asset-materials':
            'name,asset-items,programme-name,series-name,asset-category',
          'asset-items': 'file-identifier',
          'asset-categories': 'name',
        },
        filter: this.query,
        page: this.state.page,
      })
      this.setState({ loaded: false })
    }
  }

  updatePage = page => {
    this.setState(
      {
        page: {
          ...this.state.page,
          number: parseInt(page),
        },
      },
      () => {
        this.getAssets()
      },
    )
  }

  downloadCSV = () => {
    const { name } = this.state.selectedResource as AssetMaterialType
    const fileName = `asset-access-reports-${name}-${moment().format(
      'DD-MM-YYYY-HH-MM-SS',
    )}`
      .toLowerCase()
      .replace(/ /g, '-')
    const assetFields = {
      'asset-items':
        'file-identifier,asset-category-name,asset-material-name,asset-programme-name,asset-series-name',
      'asset-categories': 'name',
    }

    let query = []
    for (const p in assetFields) {
      if (assetFields.hasOwnProperty(p)) {
        query.push('fields[' + p + ']=' + assetFields[p])
      }
    }
    for (const p in this.query) {
      if (this.query.hasOwnProperty(p)) {
        query.push('filter[' + p + ']=' + this.query[p])
      }
    }
    AssetsAccessReportsActions.exportResources(
      'include=asset-items,asset-category&' + query.join('&'),
      fileName,
    )
  }

  renderUsers = () => {
    const resources = this.state.assets.map((resource, i) => {
      return resource['restricted-users'].map((item, i) => {
        return (
          <tr key={i}>
            <td>
              {item['first-name']} {item['last-name']}
            </td>
          </tr>
        )
      })
    })
    if (resources.length > 0) {
      return (
        <table className="cms-table">
          <thead>
            <tr>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>{resources}</tbody>
        </table>
      )
    } else {
      return (
        <div className="panel u-align-center">
          <p>There are currently no users, try creating some!</p>
        </div>
      )
    }
  }

  renderAssets = () => {
    const resources = this.state.assets.map((resource, i) => {
      return resource['asset-items'].map((item, i) => {
        return (
          <tr key={i}>
            <td>{resource.name && resource.name}</td>
            <td>{resource['programme-name']}</td>
            <td>{resource['series-name']}</td>
            <td>{resource['asset-category'].name}</td>
            <td>{item && item['file-identifier']}</td>
          </tr>
        )
      })
    })
    if (resources.length > 0) {
      return (
        <table className="cms-table">
          <thead>
            <tr>
              <th>{this.props.theme.localisation.asset.upper} name</th>
              <th>{this.props.theme.localisation.programme.upper} name</th>
              <th>{this.props.theme.localisation.series.upper} name</th>
              <th>{this.props.theme.localisation.asset.upper} type</th>
              <th>Filename</th>
            </tr>
          </thead>
          <tbody>{resources}</tbody>
        </table>
      )
    } else {
      return (
        <div className="panel u-align-center">
          <p>There are currently no assets, try creating some!</p>
        </div>
      )
    }
  }

  render() {
    const {
      selectedSeries = [],
      selectedProgramme = { series: [] },
      selectedCategories = [],
    } = this.state
    const allSeriesSelected =
      selectedProgramme &&
      selectedProgramme.series &&
      selectedSeries.length === selectedProgramme.series.length
    const allCategoriesSelected =
      selectedCategories.length === this.state.categories.length

    return (
      <main>
        <PageHeader
          title={`${pluralize(
            this.props.theme.localisation.asset.upper,
          )} Access Reports`}
        />
        <div className="container">
          <SearchSection
            searchBy={this.state.searchBy}
            selectedResource={this.state.selectedResource}
            setSelectedResource={selectedResource => {
              this.setState({ selectedResource })
            }}
            updateSearchBy={searchBy => {
              this.setState({ searchBy, selectedSeries: [] })
            }}
          />
          {this.state.selectedResource && (
            <div>
              {this.state.selectedResource.type !== 'asset-materials' && (
                <div>
                  <hr />
                  <div className="page-actions">
                    <div className="cms-form__control cms-form__control--small">
                      <label className="cms-form__label">
                        Refine by{' '}
                        {this.props.theme.localisation.programme.lower}
                      </label>
                      <AsyncSearchProgrammes
                        value={this.state.selectedProgramme}
                        onChange={programme =>
                          this.setState({ selectedProgramme: programme })
                        }
                        buildParams={keywords => ({
                          fields: {
                            programmes: 'id,title-with-genre,title,series',
                            series: 'name',
                          },
                          include: 'programme,programme.series',
                          filter: {
                            keywords: encodeURIComponent(keywords),
                          },
                        })}
                      />
                    </div>

                    {this.state.selectedProgramme &&
                      this.state.selectedProgramme?.series.length > 0 && (
                        <div className="cms-form__control">
                          <div className="checkbox">
                            <input
                              type="checkbox"
                              className="checkbox__input"
                              id="all-series"
                              checked={allSeriesSelected}
                              onChange={e => {
                                this.setState({
                                  selectedSeries: e.target.checked
                                    ? selectedProgramme.series
                                    : [],
                                })
                              }}
                            />
                            <label
                              htmlFor="all-series"
                              className="checkbox__label cms-form__label"
                            >
                              {allSeriesSelected && 'Un-'}Select all{' '}
                              {pluralize(
                                this.props.theme.localisation.series.upper,
                              )}
                            </label>
                          </div>
                          <Select
                            options={selectedProgramme.series}
                            valueKey="id"
                            labelKey="name"
                            onChange={series =>
                              this.setState({ selectedSeries: series })
                            }
                            value={this.state.selectedSeries}
                            multi={true}
                          />
                        </div>
                      )}

                    <div className="cms-form__control">
                      <div className="checkbox">
                        <input
                          type="checkbox"
                          className="checkbox__input"
                          id="all-categories"
                          checked={allCategoriesSelected}
                          onChange={e => {
                            this.setState({
                              selectedCategories: e.target.checked
                                ? this.state.categories
                                : [],
                            })
                          }}
                        />
                        <label
                          htmlFor="all-categories"
                          className="checkbox__label cms-form__label"
                        >
                          {allCategoriesSelected && 'Un-'}Select all Categories
                        </label>
                      </div>
                      <Select
                        options={this.state.categories}
                        valueKey="id"
                        labelKey="name"
                        onChange={selectedCategories =>
                          this.setState({ selectedCategories })
                        }
                        value={this.state.selectedCategories}
                        multi={true}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="list-controls list-controls--plain">
                <div></div>
                <div>
                  <div className="list-controls__list">
                    {
                      <Button
                        className="button button--small button--filled"
                        onClick={() => this.downloadCSV()}
                      >
                        Save as CSV
                      </Button>
                    }
                  </div>
                </div>
              </div>

              {!this.state.loaded ? (
                <div className="loader"></div>
              ) : (
                <>
                  {(this.state.selectedResource.type === 'users' ||
                    this.state.selectedResource.type === 'companies' ||
                    this.state.selectedResource.type === 'groups') &&
                    this.renderAssets()}

                  {this.state.selectedResource.type === 'asset-materials' &&
                    this.renderUsers()}

                  {this.state.totalPages > 1 && (
                    <Paginator
                      currentPage={Number(this.state.page.number)}
                      totalPages={this.state.totalPages}
                      onChange={this.updatePage}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    )
  }
}

const SearchSection = ({
  updateSearchBy,
  searchBy,
  setSelectedResource,
  selectedResource,
}) => {
  const theme = useTheme()

  const users = useAutosuggestLogic({
    query: (search, callback) => {
      return findAllByModel('users', {
        fields: ['first-name', 'last-name'],
        filter: {
          search,
        },
        page: {
          size: 6,
        },
      }).then(options => {
        callback(null, {
          options: options.map(u => ({
            ...u,
            name: `${u['first-name']} ${u['last-name']}`,
          })),
        })
        return options
      })
    },
  })

  const companies = useAutosuggestLogic({
    query: (search, callback) => {
      return findAllByModel('companies', {
        fields: ['name'],
        filter: {
          search,
        },
        page: {
          size: 6,
        },
      }).then(options => {
        callback(null, { options })
        return options
      })
    },
  })

  const groups = useAutosuggestLogic({
    query: (search, callback) => {
      return findAllByModel('groups', {
        fields: ['name'],
        filter: {
          search,
        },
        page: {
          size: 6,
        },
      }).then(options => {
        callback(null, { options })
        return options
      })
    },
  })

  const assets = useAutosuggestLogic({
    query: (search, callback) => {
      if (!search) {
        return
      }
      return query<
        'asset-material-search-results',
        AssetMaterialSearchResultType[]
      >('asset-materials/search', 'asset-material-search-results', {
        fields: ['name'],
        page: {
          size: 10,
        },
        sort: 'name',
        filter: {
          keywords: encodeURIComponent(search),
        },
      }).then(options => {
        callback(null, {
          options: options.map(o => ({ ...o, type: 'asset-materials' })),
        })
        return options
      })
    },
  })

  const loadOptions = (search, callback) => {
    if (searchBy?.value === 'user') {
      users.fetchSuggestions(search, callback)
    } else if (searchBy?.value === 'company') {
      companies.fetchSuggestions(search, callback)
    } else if (searchBy?.value === 'group') {
      groups.fetchSuggestions(search, callback)
    } else if (searchBy?.value === 'asset') {
      assets.fetchSuggestions(search, callback)
    }
  }

  const options = [{
    value: 'user',
    label: 'Search by user',
  },
  {
    value: 'company',
    label: 'Search by company',
  }]
  if (theme.features.groups.enabled) {
    options.push({
      value: 'group',
      label: 'Search by groups',
    })
  }
  options.push({
    value: 'asset',
    label: `Search by restricted ${pluralize(theme.localisation.asset.lower)}`,
  })

  return (
    <div className="page-actions">
      <div className="cms-form__control cms-form__control--small">
        <Select
          options={options}
          clearable={false}
          onChange={e => {
            updateSearchBy(e)
            setSelectedResource(null)
          }}
          value={searchBy}
          searchable={false}
          backspaceRemoves={false}
        />
      </div>
      <div className="cms-form__control">
        <Select.Async
          loadOptions={loadOptions}
          valueKey="id"
          labelKey="name"
          onChange={setSelectedResource}
          value={selectedResource}
          cache={false}
        />
      </div>
    </div>
  )
}
