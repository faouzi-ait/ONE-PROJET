import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'

import 'stylesheets/admin/components/programme-filter-modal'

import catalogueClientVariables from 'javascript/views/catalogue/variables'
import iconClientVariables from 'javascript/components/icon/variables'
import { allHitsStillSelected } from 'javascript/components/bulk-selection/use-bulk-selection-state'

// Components
import Button from 'javascript/components/button'
import Checkbox from 'javascript/components/custom-checkbox'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'
import Paginator from 'javascript/components/paginator'
import ProgrammeFilters from 'javascript/containers/filters/programme-filter'
import ProgrammeSearchSuggestions from 'javascript/components/programme-search-suggestions'
import Resource from 'javascript/components/admin/programmes/programme'

// Hooks
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useResource from 'javascript/utils/hooks/use-resource'
import useTheme from 'javascript/utils/theme/useTheme'
import usePrefix from 'javascript/utils/hooks/use-prefix'

interface QueryType {
  [key: string]: string | number
}

interface Props {
  onSubmit: (selectedProgrammeIds: string[]) => void
  providedQuery?: QueryType
  showChildModal: any
}

const programmeQuery = {
  include: 'programme',
  fields: {
    'programme-search-results': 'title,programme',
    'programmes': 'title,title-with-genre,id,restricted,active,thumbnail',
  },
  filter: {
    all: 1,
    'with-aggregations': true,
  }
}

const pageSize = 10

const ProgrammeFilterModal: React.FC<Props> = ({
  onSubmit,
  providedQuery = {},
  showChildModal,
}) => {
  const { localisation } = useTheme()
  const { prefix } = usePrefix()
  const catalogueCV = useClientVariables(catalogueClientVariables)
  const [totalPages, setTotalPages] = useState(0)
  const initialQuery = {
    'page[number]': 1,
    'page[size]': pageSize,
    sort: catalogueCV.initialSort,
  }

  const [query, setQuery] = useState<any>({...initialQuery, ...providedQuery})
  const [meta, setMeta] = useState({})
  const [hits, setHits] = useState([])
  const [filtered, setFiltered] = useState(false)
  const [programmes, setProgrammes] = useState([])
  const [selectedProgramme, setSelectedProgramme] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [basket, setBasket] = useState({})
  const [selectAllChecked, setSelectAllChecked] = useState(false)

  const programmeSearchResultResource = useResource('programme-search-result')

  useEffect(() => {
    fetchProgrammes()
  }, [query])

  const fetchProgrammes = () => {
    setIsLoading(true)
    programmeSearchResultResource.findAll({
      ...programmeQuery,
      ...query,
    }).then((response) => {
      setTotalPages(response.meta['page-count'])
      setProgrammes(response.map((searchResource) => searchResource.programme))
      setMeta(response.meta)
      setHits(response.meta?.hits || [])
      if (selectedProgramme && response.length === 1) {
        setSelectedProgramme(response[0])
      }
      setIsLoading(false)
    })
  }

  useEffect(() => {
    setSelectAllChecked(allHitsStillSelected(hits, basket))
  }, [hits])

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

  const updateBasket = (addToBasket, id, basketCache) => {
    if (addToBasket) {
      basketCache[id] = 'selected'
    } else {
      delete basketCache[id]
    }
    return basketCache
  }

  const toggleSelectedResource = (id, checked) => {
    setBasket(updateBasket(checked, id, {...basket}))
  }

  const toggleSelectAllChecked = (checked) => {
    const update = {...basket}
    hits.forEach((hit) => {
      updateBasket(checked, hit, update)
    })
    setBasket(update)
    setSelectAllChecked(checked)
  }

  const submitSelection = () => {
    onSubmit(Object.keys(basket).slice(0, 500))
  }

  const renderResources = () => {
    const resources = programmes.map((resource) => {
      return (
        <Resource
          key={resource.id}
          name={resource.title}
          restricted={resource.restricted}
          active={resource.active}
          images={[resource.thumbnail && resource.thumbnail.admin_thumb.url]}
        >
          <Checkbox
            labeless={true}
            id={`prog_modal_selector_${resource.id}`}
            onChange={(e) => {
              toggleSelectedResource(resource.id, e.target.checked)
            }}
            checked={!!basket[resource.id]}
          />
        </Resource>
      )
    })
    if (resources.length > 0) {
      return (
        <div className="container">
          <table className={`${prefix}table`}>
            <thead>
              <tr>
                <th colSpan={4}>{localisation.programme.upper}</th>
                <th>
                  <div className="programme-filter-modal__select-all">
                    <span className="programme-filter-modal__select-all-label">
                        {selectAllChecked ? 'Unselect All' : 'Select All'}
                    </span>
                    <Checkbox
                      labeless={true}
                      id={`prog_modal_select_all`}
                      checked={selectAllChecked}
                      onChange={({target}) => toggleSelectAllChecked(target.checked)}
                    />
                  </div>
                </th>
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
              There are currently no {pluralize(localisation.programme.upper)}{' '}
              to show.
            </p>
          </div>
        </div>
      )
    }
  }

  const renderFilters = () => {
    showChildModal(({ hideModal }) => (
      <Modal
        closeEvent={hideModal}
        title={`Select ${pluralize(localisation.programme.lower)}`}
        titleIcon={{
          id: 'i-filter',
          ...iconClientVariables['i-filter'].default,
        }}
        modifiers={['filters', 'xlarge']}
      >
        <ProgrammeFilters
          cms={true}
          query={query}
          meta={meta}
          onSubmit={(...restArgs) => {
            //@ts-ignore
            filter(...restArgs)
          }}
          closeEvent={hideModal}
        />
      </Modal>
    ))
  }

  const openFiltersButtonClasses = isLoading
  ? 'button button--filled-bg page-controls__right button--loading'
  : 'button button--filled-bg page-controls__right'

  let searchInput = query['filter[keywords]'] || ''
  if (selectedProgramme && selectedProgramme.title) {
    searchInput = selectedProgramme.title
  }

  const totalSelected = Object.keys(basket).length
  const resourceNameText = totalSelected === 1 ? localisation.programme.lower : pluralize(localisation.programme.lower)
  const bulkLimitWarning = totalSelected >= 500

  const basketClasses = ['programme-filter-modal__basket', bulkLimitWarning && 'limit-warning'].filter(Boolean).join(' programme-filter-modal__basket--')
  const actionClasses = ['programme-filter-modal__action', bulkLimitWarning && 'limit-warning'].filter(Boolean).join(' programme-filter-modal__action--')

  return (
    <div className={`${prefix}modal__content`} style={{height: '85vh'}}>
      <div className={basketClasses}>
        { bulkLimitWarning &&
          <div className="programme-filter-modal__limit-warning">
            Bulk Actions have a limit of 500. Records may be truncated, please refine your search
          </div>
        }
        <div className={'programme-filter-modal__basket-content'} >
          <div>
            <span className="programme-filter-modal__selected-msg">{totalSelected} {resourceNameText} selected</span>
            <Button className="button button--small" onClick={() => {
              setBasket({})
              setSelectAllChecked(false)
            }}>
              Clear
            </Button>
          </div>
        </div>
        <div className={actionClasses}>
          { totalSelected > 0 &&
            <Button className="button" style={{ position: 'relative', right: '38px' }}
              onClick={submitSelection}
            >
              {`Add ${resourceNameText}`}
            </Button>
          }
        </div>
      </div>

      <div className="container">
        <div className="page-actions">
          <ProgrammeSearchSuggestions //@ts-ignore
            onSubmit={filter}
            value={searchInput}
            clearQuery={true}
            onSuggestionSelected={(e, p) => filterByProgramme(p.suggestion)}
            allProgrammes={true}
          />
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
              <Button onClick={() => renderFilters()} className={openFiltersButtonClasses} style={{height: '46px'}}>
                { !isLoading && (
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
      {renderResources()}
      {(totalPages > 1 || programmes.length >= pageSize) && (
        <Paginator currentPage={ query['page[number]'] } totalPages={ totalPages } onChange={ (pageNum) => filter({ 'page[number]': pageNum }, true) } />
      )}
    </div>
  )
}

export default ProgrammeFilterModal
