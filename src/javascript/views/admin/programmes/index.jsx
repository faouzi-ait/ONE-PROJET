// React
import React, { useEffect } from 'react'
import deepEqual from 'deep-equal'
import deepmerge from 'deepmerge-concat'
import pluralize from 'pluralize'
import queryString from 'query-string'
import NavLink from 'javascript/components/nav-link'

import allClientVariables from './variables'
import catalogueClientVariables from 'javascript/views/catalogue/variables'
import iconClientVariables from 'javascript/components/icon/variables'
import programmeFormVariables from 'javascript/views/admin/programmes/form/variables'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import useProgrameSearchState from './use-programme-search-state'
import { removeTrailingSlash } from 'javascript/utils/generic-tools'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

// Store
import ProgrammeSearchResultsStore from 'javascript/stores/programme-search-results'
import ProgrammesStore from 'javascript/stores/programmes'
import TitlesStore from 'javascript/stores/programme-alternative-titles'

// Actions
import ProgrammesActions from 'javascript/actions/programmes'
import ProgrammeSearchResultActions from 'javascript/actions/programme-search-results'

// Components
import {
  ActionMenu,
  ActionMenuItem,
} from 'javascript/components/admin/action-menu'
import AlternativeTitlesForm from 'javascript/views/admin/programmes/alternative-titles-form'
import Button from 'javascript/components/button'
import DeleteForm from 'javascript/views/admin/programmes/delete'
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import MetaDataForm from 'javascript/views/admin/programmes/metadata-form'
import Modal from 'javascript/components/modal'
import PageHeader from 'javascript/components/admin/layout/page-header'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import Paginator from 'javascript/components/paginator'
import PermissionsForm from 'javascript/views/admin/programmes/permissions'
import ProgrammeFilters from 'javascript/containers/filters/programme-filter'
import ProgrammeSearchSuggestions from 'javascript/components/programme-search-suggestions'
import Resource from 'javascript/components/admin/programmes/programme'
import Select from 'react-select'
import WeightedSearchTerms from 'javascript/views/admin/programmes/weighted-search-terms'

// Services
import { hasPermission, isAdmin } from 'javascript/services/user-permissions'
import withUser from 'javascript/components/hoc/with-user'

class ProgrammesIndex extends PageHelper {
  constructor(props) {
    super(props)
    this.timer = false
    this.params = queryString.parse(props.location.search)
    this.initialQuery = props.initialQuery

    this.state = {
      resources: null,
      genres: null,
      companies: null,
      meta: {},
      duplicate: false,
      filtered: Object.keys(this.params).length > Object.keys(this.initialQuery).length,
      query: {...this.initialQuery, ...this.params},
      selectedProgramme: null,
      fetchingProgrammeResources: false,
      preFiltered: false
    }

    this.programmeQuery = {
      include: 'programme,programme.restricted-companies,programme.restricted-users,programme.custom-attributes,programme.custom-attributes.custom-attribute-type',
      fields: {
        'programme-search-results': 'title,programme',
        programmes: 'title,title-with-genre,id,banner,thumbnail,series-count,restricted-users,restricted-companies,restricted,active,videos-count,custom-attributes',
        companies: 'name',
        users: 'first-name,last-name',
        'custom-attributes': 'value,custom-attribute-type,position',
      },
      filter: {
        all: 1,
        'with-aggregations': true,
      },
    }
    this.programmeQuery = deepmerge.concat(this.programmeQuery, {
      include: 'programme.genres',
      fields: {
        programmes: 'genres',
        genres: 'name,parent-id',
      }
    })
    if (props.theme.features.programmeOverview.alternativeTitles) {
      this.programmeQuery = deepmerge.concat(this.programmeQuery, {
        include: 'programme.programme-alternative-titles',
        fields: {
          programmes: 'programme-alternative-titles',
          'programme-alternative-titles': 'name,position',
        }
      })
    }
    if (this.props.programmeFormCV.createdDate) {
      this.programmeQuery = deepmerge.concat(this.programmeQuery, {
        fields: {
          programmes: 'created-at',
        }
      })
    }

    this.sortOptions = props.catalogueCV.sortOrder.map((sortOption) => ({
      label: sortOption[0],
      value: sortOption[1]
    }))
  }

  componentWillMount() {
    ProgrammeSearchResultsStore.on('change', this.getResources)
    ProgrammesStore.on('duplicated', this.duplicatedResource)
    ProgrammesStore.on('exported', this.updateExport)
    ProgrammesStore.on('save', this.updateResources)
    ProgrammesStore.on('change', this.updateResources)
    TitlesStore.on('save', this.getResources)
    ProgrammeSearchResultsStore.unsetResources()
    ProgrammesStore.unsetResource()
    this.browserListenStop = this.props.history.listen(this.updateResources)
  }

  componentWillUnmount() {
    ProgrammeSearchResultsStore.removeListener('change', this.getResources)
    ProgrammesStore.removeListener('duplicated', this.duplicatedResource)
    ProgrammesStore.removeListener('exported', this.updateExport)
    ProgrammesStore.removeListener('save', this.updateResources)
    ProgrammesStore.removeListener('change', this.updateResources)
    TitlesStore.removeListener('save', this.getResources)
    !this.state.duplicate && ProgrammeSearchResultActions.saveQuery(this.state.query)
    /**
     * Bugfix for an id filter continuing to remain in the history
     * state after leaving the page
     */
    const resolvedQuery = this.state.query
    delete resolvedQuery['filter[id]']
    this.props.history.push({
      query: resolvedQuery,
    })
    this.browserListenStop()
  }

  componentDidMount() {
    this.updateResources('onComponentDidMount')
  }

  componentDidUpdate(prevProps, prevState) {
    const { history, location } = this.props
    const prevParams = {...queryString.parse(prevProps.location.search)}
    const currentParams = {...queryString.parse(this.props.location.search)}
    this.params = currentParams
    if (!deepEqual(prevParams, currentParams)) {
      delete currentParams['filter[keywords]']
      const filtered = Object.keys(currentParams).length > Object.keys(this.initialQuery).length
      this.setState({
        query: {
          ...this.state.query,
          ...this.params
        },
        filtered,
        selectedProgramme: !!(this.params['filter[ids]'])
      }, () => {

        if (history.action === 'REPLACE') {
          this.updateResources('replaceAction')
        }
      })
    }
  }

  updateResources = (fromBrowserListen) => {
    const { history, reduxFilterState, theme } = this.props
    let pathName = removeTrailingSlash(history.location.pathname)
    if (history.action === 'PUSH' && pathName !== `/admin/${theme.localisation.programme.path}`) {
      // user is navigating away from ProgrammeIndex.. No need to fetch again.
      // This has been causes by browserListener - component is about to dismount
      return
    }

    let shouldUpdateResources = true //stopping mulitple fetches and race conditions on loading.
    this.props.saveReduxFilterState(this.state.query)
    if (fromBrowserListen === 'onComponentDidMount' && reduxFilterState) {
      if (`?${queryString.stringify(this.state.query, { encode: false })}` !== reduxFilterState) {
        shouldUpdateResources = false
      }
    } else if (typeof fromBrowserListen?.search === 'string' && fromBrowserListen?.search === reduxFilterState) {
      shouldUpdateResources = false
    }
    if (shouldUpdateResources) {
      this.setState({
        fetchingProgrammeResources: true
      })      

      ProgrammeSearchResultActions.getResources({
        ...this.programmeQuery,
        ...this.state.query,
      })
    }
  }

  getResources = () => {
    const fetchedResources = ProgrammeSearchResultsStore.getResources()
    const resources = this.state.preFiltered ? this.state.resources : fetchedResources
    const stateUpdate = {
      resources,
      meta: fetchedResources.meta,
      totalPages: fetchedResources.meta['page-count'],
      fetchingProgrammeResources: false,
    }
    if (this.state.query['filter[ids]'] && fetchedResources.length) {
      stateUpdate.selectedProgramme = fetchedResources[0]
    }
    this.setState(stateUpdate)
    if (this.state.resources) {
      this.finishedLoading()
    }
    if(this.props.modalState.isModalVisible()){
      this.openFilters()
    }
  }

  deleteResource = resource => {
    this.props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title="Warning"
          modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}
        >
          <div className="cms-modal__content">
            <DeleteForm
              deleteProgramme={resource}
              closeEvent={hideModal}
              onDeletion={() => {
                if (this.state.selectedProgramme) {
                  const newQuery = {...this.state.query}
                  delete newQuery['filter[ids]']
                  this.setState({
                    query: newQuery,
                    selectedProgramme: false
                  }, () => this.filter(newQuery))
                }
              }}
            />
          </div>
        </Modal>
      )
    })
  }

  editPermissions = resource => {
    const modalModifiers = []
    if (this.props.theme.features.restrictions.expiring) {
      modalModifiers.push('large')
    }
    this.props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          title={`${resource.title} Permissions`}
          modifiers={modalModifiers}
          closeEvent={() => {
            hideModal()
            this.updateResources()
          }}
        >
          <div className="cms-modal__content">
            <PermissionsForm
              resource={resource}
              closeEvent={hideModal}
            />
          </div>
        </Modal>
      )
    })
  }

  editMetadata = resource => {
    this.props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          title={`${resource.title} Metadata`}
          closeEvent={hideModal}
        >
          <div className="cms-modal__content">
            <MetaDataForm resource={resource} closeEvent={hideModal} />
          </div>
        </Modal>
      )
    })
  }

  editWeightedSearchTerms = resource => {
    this.props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          title={`Weighted Search Terms`}
          closeEvent={hideModal}
        >
          <div className="cms-modal__content">
            <WeightedSearchTerms programme={resource} closeEvent={hideModal} />
          </div>
        </Modal>
      )
    })
  }

  duplicate = resource => {
    ProgrammesActions.duplicateResource(resource)
    this.setState({
      duplicate: true,
    })
  }

  duplicatedResource = () => {
    let duplicate = ProgrammesStore.getResource()
    this.props.history.push({
      pathname: `/admin/${this.props.theme.localisation.programme.path}/${
        duplicate['duplicate-id']
      }/edit`,
    })
  }

  editProgrammeAlternativeTitles = resource => {
    this.props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          title={pluralize(this.props.theme.localisation.programmeAlternativeTitle.upper)}
          closeEvent={hideModal}
        >
          <div className="cms-modal__content">
            <AlternativeTitlesForm
              resource={resource}
              closeEvent={hideModal}
            />
          </div>
        </Modal>
      )
    })
  }

  openFilters = () => {
    const { theme } = this.props
    this.props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title="Filter your search"
          titleIcon={{
            id: 'i-filter',
            ...iconClientVariables['i-filter'].default,
          }}
          modifiers={['filters', 'xlarge']}>
          <div className="cms-modal__content">
            <ProgrammeFilters
              cms={true}
              query={this.state.query}
              meta={this.state.meta}
              onPreFilter={this.getMeta}
              onSubmit={(...restArgs) => {
                this.filter(...restArgs)
              }}
              closeEvent={hideModal}
              allowCataloguesFilter={true}
            />
          </div>
        </Modal>
      )
    })
  }
  

  filter = (newQuery, pageChange, filtered = true) => {
    const { catalogueCV } = this.props
    let update = {
      ...this.state.query,
      ...newQuery
    }
    if(!newQuery) {
      update = this.initialQuery
    }
    if (newQuery && newQuery.hasOwnProperty('filter[keywords]')) {
      delete update['filter[ids]']
      this.setState({
        selectedProgramme: false
      })
    }
    if (!pageChange) {
      update['page[number]'] = 1
    }
    Object.keys(update).map((key) => {
      if (update[key].length < 1) {
        delete update[key]
      }
    })
    const filterQuery = Object.keys(update).filter(key => !this.initialQuery[key] && key !== 'filter[keywords]')
    if (filterQuery.length === 0) {
      newQuery = false
    }

    if (update['filter[keywords]'] && !this.state.query['filter[keywords]']) {
      update['sort'] = catalogueCV.relevanceSortOption.value
    } else if (!update['filter[keywords]'] && this.state.query['filter[keywords]'] && update['sort'] === catalogueCV.relevanceSortOption.value) {
      update['sort'] = catalogueCV.initialSort
    }

    this.setState({
      query: update,
      filtered: newQuery,
      preFiltered: false
    }, () => this.updateParams(filtered ? newQuery : false))
  }

  getMeta = (newQuery) => {
    let update = {
      ...this.state.query,
      ...newQuery,
      'page[number]': 1
    }
    Object.keys(update).map((key) => {
      if (update[key].length < 1) {
        delete update[key]
      }
    })
    this.setState({
      query: update,
      preFiltered: true,
      loaded: false,
    }, () => this.filter(newQuery))
  }

  updateParams = (newQuery) => {
    const query = newQuery ? `?${queryString.stringify(this.state.query, { encode: false })}` : ''
    this.props.history.push(`/admin/${this.props.theme.localisation.programme.path}${query}`)
  }

  filterByProgramme = programme => {
    const updatedState = {
      filtered: false
    }
    if (programme) {
      updatedState.selectedProgramme = true
      // selectedProgramme will be updated with correct resource by getResources - when fetch is finished
      // set to true for now to maintain page state during re-renders whilst fetching
      updatedState.query = {
        ...this.initialQuery,
        'filter[ids]': programme.id
      }
    } else {
      updatedState.selectedProgramme = null
    }
    this.setState(updatedState, () => {
      this.filter(updatedState.query)
    })
  }

  sort = (newValue) => {
    const update = this.state.query
    update['sort'] = newValue
    this.setState({
      query: update
    }, ()=>{this.updateParams(this.state.filtered)})
  }
  updatePage = page => {
    const updatedQuery = this.state.query
    updatedQuery['page[number]'] = parseInt(page)
    this.setState({
      query: updatedQuery,
    })
    this.props.history.push({
      pathname: `/admin/${this.props.theme.localisation.programme.path}`,
      query: updatedQuery,
    })
    this.updateResources()
  }

  exportProgrammesCSV = () => {
    ProgrammesActions.exportCSV(pluralize(this.props.theme.localisation.programme.upper))
    this.setState({
      exporting: true,
    })
  }

  updateExport = () => {
    this.setState({
      exporting: false,
    })
  }

  renderResources = () => {
    const { theme, programmesCV, user } = this.props
    let programmeColSpan = 5
    if (programmesCV.displayGenreTags) {
      programmeColSpan += 1
    }
    if (this.props.programmeFormCV.createdDate) {
      programmeColSpan -= 1
    }

    const canEditProgrammePermissions = isAdmin(user) || 
      hasPermission(user, ['manage_users']) ||
      hasPermission(user, ['manage_companies']) || 
      hasPermission(user, ['manage_groups'])

    const resources = this.state.resources.map(searchResource => {
      const resource = searchResource.programme
      const genres = resource.genres && resource.genres.filter(g => !g['parent-id'])
      const adminProgrammes = `/admin/${theme.localisation.programme.path}`
      return (
        <Resource
          key={resource.id}
          name={resource.title}
          link={`/admin/${theme.localisation.programme.path}/${
            resource.id
          }/edit`}
          restricted={resource.restricted}
          active={resource.active}
          images={[resource.thumbnail && resource.thumbnail.admin_thumb.url]}
          {...(this.props.programmesCV.displayGenreTags && {tags: genres})}
          {...(this.props.programmeFormCV.createdDate && { createdDate: resource['created-at'] })}
        >
          <ActionMenu name="Actions">
            <ActionMenuItem
              label={`Manage ${pluralize(theme.localisation.series.upper)}`}
              link={`${adminProgrammes}/${resource.id}/${theme.localisation.series.path}`}
            />
            <ActionMenuItem
              label="Manage Images"
              link={`${adminProgrammes}/${resource.id}/images`}
            />
            <ActionMenuItem
              label={`Manage ${pluralize(theme.localisation.video.upper)}`}
              link={`${adminProgrammes}/${resource.id}/${theme.localisation.video.path}`}
            />
            <ActionMenuItem
              label="Manage Content"
              link={`${adminProgrammes}/${resource.id}/content`}
            />
            <ActionMenuItem
              label={`Manage ${pluralize(theme.localisation.productionCompany.upper)}`}
              link={`${adminProgrammes}/${resource.id}/${theme.localisation.productionCompany.path}`}
            />
            {theme.features.programmeOverview.broadcasters.programme &&
              <ActionMenuItem
                label={`Manage ${pluralize(theme.localisation.broadcaster.upper)}`}
                link={`${adminProgrammes}/${resource.id}/${theme.localisation.broadcaster.path}`}
              />
            }
            <ActionMenuItem
              label={pluralize(
              theme.localisation.programmeAlternativeTitle.upper,
              )}
              onClick={() => {
                this.editProgrammeAlternativeTitles(resource)
              }}
              divide
            />
            { theme.features.programmeSearch.weightedWords.enabled && (
              <ActionMenuItem
                label="Weighted Search Terms"
                onClick={() => {
                  this.editWeightedSearchTerms(resource)
                }}
              />
            )}
            <ActionMenuItem
              label="Detail"
              link={`${adminProgrammes}/${resource.id}`}
              divide
            />
            <ActionMenuItem
              label="Duplicate"
              onClick={() => {
                this.duplicate(resource)
              }}
              divide
            />
            <ActionMenuItem
              label="Edit"
              link={`${adminProgrammes}/${resource.id}/edit`}
            />
            <ActionMenuItem
              label="Manage Meta Data"
              onClick={() => {
                this.editMetadata(resource)
              }}
            />
            <ActionMenuItem
              label="Delete"
              onClick={() => {
                this.deleteResource(resource)
              }}
            />
            {canEditProgrammePermissions &&
              <ActionMenuItem
                label="Manage Permissions"
                onClick={() => {
                  this.editPermissions(resource)
                }}
                divide
              />
            }
            <ActionMenuItem
              label="View"
              href={`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(resource, theme)}`}
              divide
            />
          </ActionMenu>
        </Resource>
      )
    })
    if (resources.length > 0) {
      return (
        <div className="container">
          <table className="cms-table">
            <thead>
              <tr>
                <th colSpan={programmeColSpan}>{theme.localisation.programme.upper}</th>
                {this.props.programmeFormCV.createdDate && (
                  <th colSpan={2}>Created Date</th>
                )}
              </tr>
            </thead>
            <tbody>{resources}</tbody>
          </table>
        </div>
      )
    } else {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>
              There are currently no {pluralize(theme.localisation.programme.upper)}{' '}
              to show.
            </p>
          </div>
        </div>
      )
    }
  }

  render() {
    const { catalogueCV, theme } = this.props
    const exportButtonClasses = this.state.exporting
      ? 'button button--small button--filled button--loading'
      : 'button button--small button--filled'

    const openFiltersButtonClasses = this.state.fetchingProgrammeResources
      ? 'button button--filled-bg page-controls__right button--loading'
      : 'button button--filled-bg page-controls__right'

    let searchInput = this.state.query['filter[keywords]'] || ''
    if (this.state.selectedProgramme && this.state.selectedProgramme.title) {
      searchInput = this.state.selectedProgramme.title
    }

    return (
      <PageLoader {...this.state}>
        <Meta
          title={`${theme.localisation.client} :: ${pluralize(theme.localisation.programme.upper)}`}
          meta={{
            description: `Edit and Create ${pluralize(theme.localisation.programme.upper)}`,
          }}
        >
          <main>
            <PageHeader
              title={`Manage ${pluralize(theme.localisation.programme.upper)}`}
              subtitle={`${this.state.resources &&
                this.state.resources.meta['record-count']} ${
                this.state.resources &&
                this.state.resources.meta['record-count'] === 1
                  ? theme.localisation.programme.lower
                  : pluralize(theme.localisation.programme.lower)
              }`}
            >
              <NavLink
                to={`/admin/${theme.localisation.programme.path}/new`}
                className="button"
              >
                <Icon
                  width="14"
                  height="14"
                  id="i-admin-add"
                  classes="button__icon"
                />
                New {theme.localisation.programme.upper}
              </NavLink>
            </PageHeader>
            <div className="intro">
              <div className="container">
                <Button
                  className={exportButtonClasses}
                  onClick={this.exportProgrammesCSV}
                >
                  Export all {pluralize(theme.localisation.programme.lower)} (.csv)
                </Button>
              </div>
            </div>
            <div className="container">
              <div className="page-actions">
                <ProgrammeSearchSuggestions onSubmit={this.filter}
                  value={searchInput}
                  clearQuery={true}
                  onSuggestionSelected={(e, p) => this.filterByProgramme(p.suggestion)}
                  allProgrammes={true}
                />
                <div className="cms-form__control">
                  <Select
                    style={{minHeight: '46px', minWidth: '235px'}}
                    clearable={false} simpleValue={true}
                    searchable={false} backspaceRemoves={false}
                    placeholder="Sort by"
                    options={this.state.query['filter[keywords]']
                      ? [catalogueCV.relevanceSortOption, ...this.sortOptions]
                      : this.sortOptions
                    }
                    value={this.state.query['sort']}
                    onChange={(val) => { this.sort(val) }}
                  />
                </div>
                { !this.state.selectedProgramme && (
                  <>
                    {this.state.filtered &&
                      <Button type="button"
                        className="text-button text-button--error page-controls__right"
                        style={{position: 'relative', bottom: '-2px', margin: '0 5px', height: '34px'}}
                        onClick={() => this.filter()}
                      >
                        Clear filters
                      </Button>
                    }
                    <Button onClick={this.openFilters} className={openFiltersButtonClasses} style={{height: '46px'}}>
                      { !this.state.fetchingProgrammeResources && (
                        <>
                          <Icon width="24" height="20" classes="button__icon" id="i-filter" />
                          {this.state.filtered ? 'Filters Applied' : 'Filters'}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
            {this.state.resources && this.renderResources()}
            <Paginator
              currentPage={parseInt(this.state.query['page[number]'])}
              totalPages={this.state.totalPages}
              onChange={(page) => this.filter({ 'page[number]': page }, true)}
            />
          </main>
        </Meta>
      </PageLoader>
    )
  }
}

const enhance = compose(
  withClientVariables('programmesCV', allClientVariables),
  withClientVariables('programmeFormCV', programmeFormVariables),
  withClientVariables('catalogueCV', catalogueClientVariables),
  withModalRenderer,
  withUser,
  withHooks(({
    catalogueCV,
    location,
    history,
    theme: { localisation }
  }) => {
    const initialQuery = {
      'page[number]': 1,
      'page[size]': 48,
      sort: catalogueCV.initialSort,
    }

    const programmeSearchState = useProgrameSearchState()
    const reduxFilterState = programmeSearchState.lastSearchParams()

    useEffect(() => {
      if (location.search !== reduxFilterState) {
        if (location.search && !reduxFilterState) {
          return //still initialising reduxState - manually copied url for instance.
        }
        history.replace(`/admin/${localisation.programme.path}${programmeSearchState.lastSearchParams()}`)
      }
    }, [location.search, reduxFilterState])

    return {
      initialQuery,
      saveReduxFilterState: (params) => {
        if (deepEqual(initialQuery, params)) {
          programmeSearchState.setLastSearchParams('')
        } else {
          const query = `?${queryString.stringify(params, { encode: false })}`
          programmeSearchState.setLastSearchParams(query)
        }
      },
      reduxFilterState,
    }
  })
)

export default enhance(ProgrammesIndex)
