import React, { useEffect, useState } from 'react'
import compose from 'javascript/utils/compose'
import deepEqual from 'deep-equal'
import pluralize from 'pluralize'
import queryString from 'query-string'

import { retrieveAllFilters } from 'javascript/containers/filters/filter-tools'
import iconClientVariables from 'javascript/components/icon/variables'
import catalogueClientVariables from 'javascript/views/catalogue/variables'

// Components
import Button from 'javascript/components/button'
import BulkActionManager from 'javascript/components/bulk-selection/bulk-action-manager'
import BulkActionMenuItem from 'javascript/components/bulk-selection/actions/bulk-action-menu-item'
import BulkSelector from 'javascript/components/bulk-selection/selectors/bulk-checkbox'
import BulkToggleButton from 'javascript/components/bulk-selection/bulk-toggle-button'
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Paginator from 'javascript/components/paginator'
import ProgrammeFilterModal from 'javascript/components/admin/programme-filter-modal'
import ProgrammeFilters from 'javascript/containers/filters/programme-filter'
import ProgrammeSearchSuggestions from 'javascript/components/programme-search-suggestions'
import Resource from 'javascript/components/admin/programmes/programme'
import Select from 'react-select'

// Hooks
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useResource from 'javascript/utils/hooks/use-resource'
import withModalRenderer, { WithModalType } from 'javascript/components/hoc/with-modal-renderer'

import { RouteComponentProps, useLocation } from 'react-router-dom'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import { ActionMenu } from 'javascript/components/admin/action-menu'


interface MatchParams {
  catalogueId
}

interface Props extends WithModalType, RouteComponentProps<MatchParams> {
  theme: ThemeType
}

const programmeQuery = {
  include: 'programme,programme.catalogues',
  fields: {
    'programme-search-results': 'title,programme',
    'programmes': 'title,title-with-genre,id,restricted,active,thumbnail,catalogues',
    'catalogues': 'id',
  },
  filter: {
    all: 1,
    'with-aggregations': true,
  }
}

const pageSize = 24

const CustomCataloguesProgrammes: React.FC<Props> = ({
  match,
  modalState,
  theme,
}) => {

  const location = useLocation()
  const catalogueCV = useClientVariables(catalogueClientVariables)

  const { catalogueId } = match.params
  const catalogueRelationship = {
    id: catalogueId,
    name: 'catalogue'
  }

  const [totalPages, setTotalPages] = useState(0)
  const initialQuery = {
    'page[number]': 1,
    'page[size]': pageSize,
    sort: catalogueCV.initialSort,
    'filter[catalogue]': catalogueId,
  }

  const [query, setQuery] = useState<any>({...initialQuery, ...queryString.parse(location.search)})
  const [meta, setMeta] = useState({})
  const [filtered, setFiltered] = useState(false)
  const [programmes, setProgrammes] = useState([])
  const [selectedProgramme, setSelectedProgramme] = useState(null)
  const [savingProgrammeResources, setSavingProgrammeResources] = useState(false)
  const [fetchingProgrammeResources, setFetchingProgrammeResources] = useState(true)
  const [displayRefreshButton, setDisplayRefreshButton] = useState(false)

  const programmeSearchResultResource = useResource('programme-search-result')
  const programmeResource = useResource('programme')

  useEffect(() => {
    const params = queryString.parse(location.search)
    if (params['filter[ids]'] && !selectedProgramme && params['filter[ids]'] === query['filter[ids]']) {
      filterByProgramme({id: params['filter[ids]']}) //page refresh with selected programme
    }

    const filterParams = retrieveAllFilters(query)
    delete filterParams['filter[catalogue]']
    const filterParamsForUrl = ['page[number]', 'sort']
    filterParamsForUrl.forEach((p) => {
      if (query[p] !== initialQuery[p]) {
        filterParams[p] = query[p]
      }
    })
    if (Object.keys(filterParams).length) {
      window.history.pushState({}, null, `?${queryString.stringify(filterParams, { encode: false })}`)
    } else {
      window.history.pushState({}, null, location.pathname)
    }
    fetchProgrammes()
  }, [query])


  const fetchProgrammes = (resetRefreshButton = false) => {
    setFetchingProgrammeResources(true)
    const currentProgrammes = [...programmes]
    programmeSearchResultResource.findAll({
      ...programmeQuery,
      ...query,
    }).then((response) => {
      setTotalPages(response.meta['page-count'])
      const updatedProgrammes = response.map((searchResource) => searchResource.programme)
      setProgrammes(updatedProgrammes)
      setMeta(response.meta)
      if (selectedProgramme && response.length === 1) {
        setSelectedProgramme(response[0])
      }
      setFetchingProgrammeResources(false)
      setSavingProgrammeResources(false)
      if (resetRefreshButton && !deepEqual(currentProgrammes, updatedProgrammes)) {
        setDisplayRefreshButton(false)
      }
    })
  }

  const idsToProgrammeArray = (ids) => {
    return ids.map((id) => ({
      id,
      type: 'programmes'
    }))
  }

  const addProgrammesToCatalogue = (programmeIds) => {
    modalState.hideModal()
    setSavingProgrammeResources(true)
    programmeResource.createRelationships(catalogueRelationship, idsToProgrammeArray(programmeIds))
      .then((response) => {
        setTimeout(() => {
          setDisplayRefreshButton(true)
          fetchProgrammes()
        }, programmeIds.length > 1 ? 4000 : 1000)
      })
  }

  const openAddProgrammes = () => {
    modalState.showModal(({ hideModal, showChildModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title={`Select ${pluralize(theme.localisation.programme.lower)}`}
          titleIcon={{
            id: 'i-filter',
            ...iconClientVariables['i-filter'].default,
          }}
          modifiers={['filters', 'xlarge']}
        >
          <ProgrammeFilterModal onSubmit={addProgrammesToCatalogue} showChildModal={showChildModal} />
        </Modal>
      )
    })
  }

  const filter = (newQuery?: any, pageChange?: boolean) => {
    let update = {
      ...query,
      ...newQuery
    }
    if(!newQuery) { // clear Filters..
      update = initialQuery
    }
    if (newQuery && newQuery.hasOwnProperty('filter[keywords]')) {
      delete update['filter[ids]']
      setSelectedProgramme(null)
    }
    if (!pageChange) {
      update['page[number]'] = 1
    }
    Object.keys(update).map((key) => { //remove invalid filters
      if (update[key].length < 1) {
        delete update[key]
      }
    })
    const hasFilter = Object.keys(update).filter(key => !initialQuery[key]).length > 0
    setFiltered(hasFilter)
    setQuery(update)
  }


  const filterByProgramme = (programme) => {
    setFiltered(false)
    if (programme) {
      setSelectedProgramme(programme.id)
      setQuery({
        ...initialQuery,
        'filter[ids]': programme.id
      })
    } else {
      setSelectedProgramme(null)
      filter()
    }
  }

  const openFilters = () => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={hideModal}
        title="Filter your search"
        titleIcon={{
          id: 'i-filter',
          ...iconClientVariables['i-filter'].default,
        }}
        modifiers={['filters', 'xlarge']}>
        <div className="modal__content">
          <ProgrammeFilters
            cms={true}
            query={query}
            meta={meta}
            onSubmit={filter}
            closeEvent={hideModal}
          />
        </div>
      </Modal>
    ))
  }

  const handleSort = (newValue) => {
    setQuery((query) => ({
      ...query,
      'sort': newValue
    }))
  }

  const removeProgrammeFromCatalogue = (programme) => (e) => {
    setSavingProgrammeResources(programme.id)
    const update = {
      id: programme.id,
      type: programme.type
    }
    update['catalogues'] = programme['catalogues'].filter((c) => c.id !== catalogueId)
    programmeResource.updateResource(update)
      .then((response) => {
        setTimeout(() => {
          setDisplayRefreshButton(true)
          fetchProgrammes()
        }, 1000) // timeout exists for re-indexing search
      })
  }

  const renderResources = () => {
    const resources = programmes.map((resource) => {
      const buttonClasses = ['button', 'filled', 'small', savingProgrammeResources === resource.id && 'loading'].join(' button--')
      return (
        <Resource
          key={resource.id}
          name={resource.title}
          restricted={resource.restricted}
          active={resource.active}
          images={[resource.thumbnail && resource.thumbnail.admin_thumb.url]}
        >
          <BulkSelector id={resource.id} >
            <Button className={buttonClasses} style={{minWidth: '130px'}} onClick={removeProgrammeFromCatalogue(resource)}>Remove</Button>
          </BulkSelector>
        </Resource>
      )
    })
    if (resources.length > 0) {
      return (
        <div className="container">
          <BulkActionManager
            resourceName={'programme'}
            hits={meta['hits']}
            renderActions={(disabled) => (
              <ActionMenu
                name="Bulk Actions"
                disabled={disabled}
              >
                <BulkActionMenuItem label="Remove Programmes" bulkAction={(selectedResouces) => new Promise((resolve, reject) => {
                  setSavingProgrammeResources(true)
                  programmeResource.deleteRelationships(catalogueRelationship, idsToProgrammeArray(selectedResouces))
                  .then((response) => {
                    setTimeout(() => {
                      setDisplayRefreshButton(true)
                      fetchProgrammes()
                    }, 3000)
                    resolve(true)
                  })
                  .catch(reject)
                })} />
              </ActionMenu>
            )}
          />
          <table className="cms-table">
            <thead>
              <tr>
                <th colSpan={4}>{theme.localisation.programme.upper}</th>
                <th><BulkToggleButton /></th>
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

  const renderBulkActionRefresh = () => {
    return (
      <div className="container" style={{textAlign: 'center'}}>
        <span style={{marginRight: '10px'}}>Bulk Actions can take a while before all content is visible. If you cannot see your changes, try and refresh.</span>
        <Button type="button"
          className="button button--small"
          onClick={() => fetchProgrammes(true)}
        >Refresh</Button>
      </div>
    )
  }

  const [sortOptions] = useState(catalogueCV.sortOrder.map((sortOption) => ({
    label: sortOption[0],
    value: sortOption[1]
  })))

  const openFiltersButtonClasses = fetchingProgrammeResources
      ? 'button button--filled-bg page-controls__right button--loading'
      : 'button button--filled-bg page-controls__right'

  let searchInput = query['filter[keywords]'] || ''
  if (selectedProgramme && selectedProgramme.title) {
    searchInput = selectedProgramme.title
  }

  return (
    <Meta
      title={`${theme.localisation.client} :: ${theme.localisation.catalogue.upper} ${theme.localisation.programme.upper}`}
      meta={{
        description: `Create/Edit ${theme.localisation.programme.upper} ${theme.localisation.catalogue.upper}`
      }}
    >
      <main>
        <PageHeader title={`Manage ${theme.localisation.catalogue.upper} ${pluralize(theme.localisation.programme.upper)}`}>
          <Button className="button" onClick={ () => openAddProgrammes() }>
            <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
            Add {pluralize(theme.localisation.programme.upper)}
          </Button>
        </PageHeader>
        <div className="container">
          <div className="page-actions">
            <NavLink to={`/admin/${theme.localisation.catalogue.path}`} className="button" classesToPrefix={['button']}>
              <Icon
                id="i-admin-back"
                classes="button__icon"
              />
              {`Back to ${pluralize(theme.localisation.catalogue.upper)}`}
            </NavLink>
          </div>
        </div>
        <div className="container">
          <div className="page-actions">
            <ProgrammeSearchSuggestions
              //@ts-ignore
              onSubmit={filter}
              value={searchInput}
              clearQuery={true}
              onSuggestionSelected={(e, p) => filterByProgramme(p.suggestion)}
              allProgrammes={true}
              isFiltered={true}
              appliedFilters={{
                'filter[catalogue]': catalogueId
              }}
            />
            <div className="cms-form__control">
              <Select
                style={{minHeight: '46px', minWidth: '235px'}}
                clearable={false} simpleValue={true}
                searchable={false} backspaceRemoves={false}
                placeholder="Sort by"
                options={sortOptions}
                value={query['sort']}
                onChange={(val) => { handleSort(val) }}
              />
            </div>
            { !selectedProgramme && (
              <>
                {filtered &&
                  <Button type="button"
                    className="text-button text-button--error page-controls__right"
                    style={{position: 'relative', bottom: '-2px', margin: '0 5px', height: '34px'}}
                    onClick={() => filter()}
                  >
                    Clear filters
                  </Button>
                }
                <Button onClick={openFilters} className={openFiltersButtonClasses} style={{height: '46px'}}>
                  { !fetchingProgrammeResources && (
                    <>
                      <Icon width="24" height="20" classes="button__icon" id="i-filter" />
                      {filtered ? 'Filters Applied' : 'Filters'}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
        {savingProgrammeResources && (
          <div className="loader" style={{top: '45%'}}/>
        )}
        {displayRefreshButton && renderBulkActionRefresh()}
        {renderResources()}
        {(totalPages > 1 || programmes.length >= pageSize) && (
          <Paginator currentPage={ query['page[number]'] } totalPages={ totalPages } onChange={ (pageNum) => filter({ 'page[number]': pageNum }, true) } />
        )}
      </main>
    </Meta>
  )
}

const enhance = compose(
  withModalRenderer,
)

export default enhance(CustomCataloguesProgrammes)
