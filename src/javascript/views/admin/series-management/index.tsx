import React, { useEffect, useState } from 'react'
import Meta from 'react-document-meta'
import pluralize from 'pluralize'
import queryString from 'query-string'
import deepEqual from 'deep-equal'
import { RouteComponentProps } from 'react-router-dom'

import allClientVariables from './variables'

import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import { CustomAttributeType, TalentType } from 'javascript/types/ModelTypes'
import { WithThemeType } from 'javascript/utils/theme/withTheme'
import AsyncSearchSeries from 'javascript/components/async-search-series'
import Button from 'javascript/components/button'
import compose from 'javascript/utils/compose'
import Icon from 'javascript/components/icon'
import iconClienVariables from 'javascript/components/icon/variables'
import Modal from 'javascript/components/modal'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Paginator from 'javascript/components/paginator'
import SeriesFilters from 'javascript/containers/filters/series-filter'
import SeriesResource from 'javascript/components/admin/series/series'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useResource from 'javascript/utils/hooks/use-resource'
import withModalRenderer, { WithModalType } from 'javascript/components/hoc/with-modal-renderer'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'
import withSeriesPageActions, { WithSeriesPageActionsType } from 'javascript/components/hoc/with-series-page-actions'


interface Props extends
  WithThemeType,
  WithModalType,
  WithPageHelperType,
  RouteComponentProps,
  WithSeriesPageActionsType {
    seriesFormProps: {
      types: CustomAttributeType[]
      talentTypes: TalentType[]
    }
  }

const initialQuery = {
  'page[number]': '1',
  'page[size]': '48',
}

const SeriesManagementIndex: React.FC<Props> = (props) => {

  const { theme: { localisation, features } } = props

  const seriesSearchResource = useResource('series-search-result')
  const seriesResource = useResource('series')
  const seriesMgmtCV = useClientVariables(allClientVariables)
  const params = queryString.parse(props.location.search)

  const [series, setSeries] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [isFetchingSeries, setIsFetchingSeries] = useState(false)
  const [query, setQuery] = useState({...initialQuery, ...params})
  const [filtered, setFiltered] = useState(props.location.search.includes('filter'))

  const seriesQuery = {
    include: 'series',
    fields: {
      'series-search-results': 'series',
      'series': 'name,created-at,active,restricted,episodes-count,videos-count,programme-id,programme-name',
    },
    filter: {
      all: 1,
      'with-aggregations': true,
    },
    sort: '-created-at'
  }

  useEffect(() => {
    updateParams()
  }, [query, filtered])

  useEffect(() => {
    updateResources()
  }, [props.location.search])

  const updateResources = () => {
    setIsFetchingSeries(true)
    props.modalState.hideModal()
    getSeries()
  }

  const filter = (newQuery, pageChange, filtered = true) => {
    let update = {
      ...query,
      ...newQuery
    }
    if(!newQuery) {
      update = initialQuery
    }
    if (newQuery && newQuery.hasOwnProperty('filter[keywords]')) {
      delete update['filter[ids]']
      setSelectedSeries(false)
    }
    if (!pageChange) {
      update['page[number]'] = 1
    }
    Object.keys(update).map((key) => {
      if (update[key].length < 1) {
        delete update[key]
      }
    })
    const filterQuery = Object.keys(update).filter(key => !initialQuery[key])
    if(filterQuery.length === 0) {
      newQuery = false
    }
    const isFiltered = !!newQuery
    setFiltered(isFiltered)
    setQuery(update)
  }

  const makeQueryString = (queryObj) => {
    return `?${queryString.stringify(queryObj, { encode: false })}`
  }

  const updateParams = () => {
    const queryStr = deepEqual(initialQuery, query) ? '' : makeQueryString(query)
    props.history.push(`/admin/${localisation.series.path}${queryStr}`)
  }

  const getSeries = () => {
    seriesSearchResource.findAll({
      ...seriesQuery,
      ...query,
    })
      .then((response) => {
        props.pageIsLoading(false)
        const seriesUpdate = response.map((result) => ({
          ...result.series,
        }))
        setIsFetchingSeries(false)
        seriesUpdate.meta = response.meta
        setTotalPages(response.meta['page-count'])
        setSeries(seriesUpdate)
      })
  }

  const openFilters = () => {
    props.modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={hideModal}
        title="Filter your search"
        titleIcon={{
          id: 'i-filter',
          ...iconClienVariables['i-filter'].default
        }}
        modifiers={['filters', 'large', 'stretch-select']}>
        <div className="cms-modal__content">
          <SeriesFilters
            cms={true}
            query={query}
            meta={series?.meta || {}}
            onSubmit={(...restArgs) => filter(...restArgs)}
            closeEvent={props.modalState.hideModal}
          />
        </div>
      </Modal>
    ))
  }

  const renderSeriesResources = () => {
    const resources = (series || []).map(resource => {
      const programmeId = resource['programme-id']
      const episodesLink = `/admin/${localisation.programme.path}/${programmeId}/${localisation.series.path}/${resource.id}/episodes`
      const imagesLink = `/admin/${localisation.programme.path}/${programmeId}/${localisation.series.path}/${resource.id}/images`
      const videoLink = `/admin/${localisation.programme.path}/${programmeId}/${localisation.series.path}/${resource.id}/${localisation.video.path}`
      const productionCompanyLink = `/admin/${localisation.programme.path}/${programmeId}/${localisation.series.path}/${resource.id}/${localisation.productionCompany.path}`
      const broadcastersLink = `/admin/${localisation.programme.path}/${programmeId}/${localisation.series.path}/${resource.id}/${localisation.broadcaster.path}`
      const menuItemClick = (linkPath) => (e) => {
        const returnPathState = { backUrl: `/admin/${localisation.series.path}` }
        props.history.push({ pathname: linkPath, state: returnPathState, search: makeQueryString(query) })
      }
      return (
        <SeriesResource resource={resource} key={resource.id} >
          <ActionMenu name="Actions">
            <ActionMenuItem label={`Manage ${localisation.episodes.upper}`} onClick={menuItemClick(episodesLink)} />
            {features.programmeOverview.seriesImages &&
              <ActionMenuItem label={`Manage ${localisation.series.upper} Images`} onClick={menuItemClick(imagesLink)} />
            }
            <ActionMenuItem label={`Manage ${localisation.series.upper} Videos`} onClick={menuItemClick(videoLink)} />
            <ActionMenuItem label={`Manage ${pluralize(localisation.productionCompany.upper)}`} onClick={menuItemClick(productionCompanyLink)} />
            {features.programmeOverview.broadcasters.series &&
              <ActionMenuItem label={`Manage ${pluralize(localisation.broadcaster.upper)}`} onClick={menuItemClick(broadcastersLink)} />
            }
            <ActionMenuItem
              label="Edit"
              divide
              onClick={() => props.editSeriesResource({
                resource,
                onSave: (r) => new Promise((resolve, reject) => {
                  seriesResource.updateResource(r).then((res) => {
                    getSeries()
                    return resolve(res)
                  }).catch(reject)
                }),
                programmeId: null,
              })}
            />
            <ActionMenuItem
              label="Delete"
              onClick={() => props.deleteSeriesResource({
                resource,
                onSave: (r) => new Promise((resolve, reject) => {
                  seriesResource.deleteResource(r).then((res) => {
                    getSeries()
                    return resolve(res)
                  }).catch(reject)
                }),
                programmeId: null
              }) }
            />
            <ActionMenuItem label="Permissions" divide onClick={() => props.editSeriesPermissions({
              resource,
              onSave: (r) => {
                getSeries()
                return Promise.resolve() as any
              },
            })}/>
          </ActionMenu>
        </SeriesResource>
      )
    })
    if (resources.length > 0) {
      return (
        <div className="container">
          <table className={seriesMgmtCV.tableClasses}>
            <thead>
              <tr>
                <th>Name</th>
                <th colSpan={2}>
                  {localisation.programme.upper}
                </th>
                <th colSpan={2}>
                  Created Date
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
              There are currently no {pluralize(localisation.series.lower)} to display. Try changing your filter criteria.
            </p>
          </div>
        </div>
      )
    }
  }

  const resetFilters = (seriesId?: string) => {
    setFiltered(false)
    setQuery({
      ...initialQuery,
      ...(seriesId && { 'filter[ids]': seriesId})
    })
  }

  const openFiltersButtonClasses = isFetchingSeries
    ? 'button button--filled-bg page-controls__right button--loading'
    : 'button button--filled-bg page-controls__right'

  return (
    <Meta
      title={`${localisation.client} :: ${localisation.series.upper}`}
      meta={{ description: `View ${localisation.series.upper}` }}
    >
      <main>
        <PageHeader
          title={`Manage ${pluralize(localisation.series.upper)}`}
          subtitle={`${series && series.meta['record-count']
            ? series.meta['record-count']
            : ''
          }
            ${series && series.meta['record-count'] === 1
              ? localisation.series.lower
              : pluralize(localisation.series.lower)
          }`}
        >
          <Button className="button" onClick={() => props.newSeriesResource({
            onSave: (r) => new Promise((resolve, reject) => {
              seriesResource.createResource(r).then((res) => {
                setTimeout(() => {
                  getSeries()
                  return resolve(res)
                }, 1000)
              }).catch(reject)
            }),
            programmeId: null,
          })}>
            <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
            New {localisation.series.upper}
          </Button>
        </PageHeader>

        <div className="container">
          <div className="page-actions">
            <div className="cms-form__control">
                <AsyncSearchSeries
                  seriesFilters={{ /* async search does not care about filters -  filterStringsToObject(query) if we want only filtered values */ }}
                  value={selectedSeries}
                  clearable={true}
                  onChange={(selectedOption) => {
                    setSelectedSeries(selectedOption)
                    resetFilters(selectedOption?.id)
                  }}
                />
            </div>
            { !selectedSeries && (
              <>
                {filtered &&
                  <Button type="button"
                    className="text-button text-button--error page-controls__right"
                    style={{position: 'relative', bottom: '-2px', margin: '0 5px', height: '34px'}}
                    onClick={() => resetFilters()}
                  >
                    Clear filters
                  </Button>
                }
                <Button onClick={openFilters} className={openFiltersButtonClasses} style={{height: '45px'}}>
                  { !isFetchingSeries &&
                    <>
                      <Icon width="24" height="20" classes="button__icon" id="i-filter" />
                      {filtered ? 'Filters Applied' : 'Filters'}
                    </>
                  }
                </Button>
              </>
            )}
          </div>
        </div>

        {renderSeriesResources()}

        {(totalPages > 1 || series?.length >= parseInt(initialQuery['page[size]'])) && (
          <Paginator
            currentPage={parseInt(query['page[number]'])}
            totalPages={totalPages}
            onChange={(page) => filter({ 'page[number]': page }, true)}
          />
        )}
      </main>
    </Meta>
  )
}

const enhance = compose(
  withPageHelper,
  withModalRenderer,
  withSeriesPageActions,
)

export default enhance(SeriesManagementIndex)
