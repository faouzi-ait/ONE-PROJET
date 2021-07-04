import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import moment from 'moment'

import deepEqual from 'deep-equal'

import { isCms } from 'javascript/utils/generic-tools'
import allClientVariables from 'javascript/containers/filters/programme-filter/variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import usePrefix from 'javascript/utils/hooks/use-prefix'
import withTheme from 'javascript/utils/theme/withTheme'

// Components
import AsyncSelectFilter from 'javascript/containers/filters/filter-types/async-select-filter'
import Button from 'javascript/components/button'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import CheckboxFilter from 'javascript/containers/filters/filter-types/checkbox-filter'
import CheckboxGroupFilter from 'javascript/containers/filters/filter-types/checkbox-group'
import TabsGroupFilter from 'javascript/containers/filters/filter-types/tabs-group'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import CustomAttributeFilter from 'javascript/containers/filters/filter-types/custom-attributes'
import GenreFilter from 'javascript/containers/filters/filter-types/genres'
import OrderSection from 'javascript/utils/client-switch/components/switch-order/order-section'
import RangeFilter from 'javascript/containers/filters/filter-types/range-filter'
import SelectFilter from 'javascript/containers/filters/filter-types/select-filter'
import DateRangeFilters from 'javascript/containers/filters/filter-types/date-range-filter'
import SwitchOrder from 'javascript/utils/client-switch/components/switch-order'


interface Query {
  [key: string]: string
}

interface Meta {
  [key: string]: any
}

interface Props {
  allowCataloguesFilter?: string
  closeEvent: (callback?: any) => void,
  cms: boolean,
  meta: Meta,
  onSubmit: (newQuery?: any, pageChange?: any, filtered?: boolean) => void,
  onPreFilter?: (newQuery?: any) => void,
  query: Query,
  theme: CustomThemeType
}

const ProgrammeFilter = ({
  allowCataloguesFilter,
  closeEvent,
  cms,
  meta,
  onSubmit,
  onPreFilter,
  query,
  theme,
}: Props) => {

  const { prefix } = usePrefix()
  const [savedQuery, setSavedQuery] = useState(query)
  const [savedMeta, setSavedMeta] = useState(meta)
  const [isFiltering, setIsFiltering] = useState(false)
  const [selectIsOpen, setSelectIsOpen] = useState(false)
  const classes = [`${prefix}form`, selectIsOpen && 'open-select'].join(` ${prefix}form--`)
  const [filtersLoaded, setFiltersLoaded] = useState({})
  const [allFiltersLoaded, setAllFiltersLoaded] = useState(false)
  const programmeFilterCV = useClientVariables(allClientVariables)
  const cataloguesAsCheckboxes = theme.features.customCatalogues.enabled && allowCataloguesFilter && programmeFilterCV.cataloguesFilter === 'checkbox'

  useEffect(() => {
    const isNewQuery = deepEqual(query, savedQuery)
    const isNewMeta = deepEqual(meta, savedMeta)
    if (isNewQuery) {
      setSavedQuery(query)
      setSavedMeta(meta)
    }
    if(!isNewMeta) {
      setIsFiltering(false)
    }
  }, [query])

  const updateQuery = (filter, filterValue = '') => {
    setSavedQuery((prevQuery) => ({
      ...prevQuery,
      [filter]: filterValue
    }))
  }

  useEffect(() => {
  }, [savedQuery])

  const updateQueryAndSubmit = (filter, filterValue = '') => {
    const updatedQuery = {
      ...savedQuery,
      [filter]: filterValue
    }
    setSavedQuery(updatedQuery)
    setIsFiltering(true)
    onPreFilter(updatedQuery)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(savedQuery)
    closeEvent()
  }

  const clearFilters = () => {
    onSubmit(false, true) // onSubmit - with no parameters, resets query = initialQuery
    closeEvent()
  }

  const metaHasProductionYears = () => {
    return ((meta['production-start'] && meta['production-start']['count'])
    || (meta['production-end'] && meta['production-start']['count']))
  }

  const getMetaProductionYearLimits = () => {
    if (meta['production-start'] || meta['production-end']) {
      let min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY
      if (meta['production-start']) {
        min = moment(meta['production-start']['min-as-string']).year()
        max = moment(meta['production-start']['max-as-string']).year()
      }
      if (meta['production-end']) {
        min = Math.min(min, moment(meta['production-end']['min-as-string']).year())
        max = Math.max(max, moment(meta['production-end']['max-as-string']).year())
      }
      return {
        min: min === Number.POSITIVE_INFINITY ? '' : min.toString(),
        max: max === Number.NEGATIVE_INFINITY ? '' : max.toString()
      }
    }
  }

  const finishedLoading = (name) => {
    if (!filtersLoaded.hasOwnProperty(name)) {
      setFiltersLoaded((prevFiltersLoaded) => ({
        ...prevFiltersLoaded,
        [name]: false
      }))
    }
    return () => setFiltersLoaded((prevFiltersLoaded) => ({
      ...prevFiltersLoaded,
      [name]: true
    }))
  }

  useEffect(() => {
    setAllFiltersLoaded(Object.keys(filtersLoaded).reduce((acc, curr) => {
      if (acc) return filtersLoaded[curr]
      return acc
    }, true))
  }, [filtersLoaded])

  return (
    <div className={`${prefix}programme-filters`}>
      <form className={classes} onSubmit={handleSubmit}>
        <div className={`${prefix}programme-filters__form`}>

        { (!allFiltersLoaded || isFiltering) && (
          <div className="container" style={{ minHeight: '65vh' }}>
            <div className="loader" />
          </div>
        )}

        {!isFiltering &&
        <>
        { cataloguesAsCheckboxes && (
          <>
            {allFiltersLoaded && (
              <div className={`${prefix}programme-filters__row`}>
                <h3 className="programme-filters__label">{pluralize(theme.localisation.customCatalogues.upper)}</h3>
                {!cms && programmeFilterCV.catalogueCopy &&
                  <span className={`${prefix}programme-filters__copy`}>{programmeFilterCV.catalogueCopy}</span>
                }
              </div>
            )}
            <TabsGroupFilter
              allLoaded={allFiltersLoaded}
              filter={'filter[catalogue]'}
              meta={meta}
              onFinishedLoading={finishedLoading('catalogue')}
              resourceName={'catalogue'}
              selectedOption={savedQuery['filter[catalogue]']}
              updateQuery={onPreFilter ? updateQueryAndSubmit : updateQuery}
            />
          </>
        )}

        { theme.features.programmeTypes.filters && programmeFilterCV.programmeTypesFilter === 'checkbox' && (
          <>
            <CheckboxGroupFilter
              allLoaded={allFiltersLoaded}
              filter={'filter[programme-type]'}
              meta={meta}
              onFinishedLoading={finishedLoading('programme-type')}
              resourceName={'programme-type'}
              selectedOptions={savedQuery['filter[programme-type]'] ? savedQuery['filter[programme-type]'].split(',') : []}
              updateQuery={updateQuery}
            >
              {allFiltersLoaded && (
                <div className={`${prefix}programme-filters__row`}>
                  <h3 className="programme-filters__label">{pluralize(theme.localisation.programmeType.upper)}</h3>
                </div>
              )}
            </CheckboxGroupFilter>
          </>
        )}

        {(!cataloguesAsCheckboxes || (cataloguesAsCheckboxes && savedQuery['filter[catalogue]'])) &&
          <>
            {allFiltersLoaded && (cms || programmeFilterCV.showGenreTitle) && (
              <div className={`${prefix}programme-filters__row`}>
                <h3 className="programme-filters__label">{pluralize(theme.localisation.genre.upper)}</h3>
                {!cms && programmeFilterCV.genreCopy &&
                  <span className={`${prefix}programme-filters__copy`}>{programmeFilterCV.genreCopy}</span>
                }
              </div>
            )}

            <GenreFilter
              allLoaded={allFiltersLoaded}
              meta={meta}
              onFinishedLoading={finishedLoading('genres')}
              selectedGenres={savedQuery['filter[genre]']}
              updateQuery={updateQuery}
              cms={cms}
            />
          </>
        }

        <div className={`${prefix}programme-filters__row`}>

          { cms && allFiltersLoaded && (
            <>
              <SelectFilter
                label={`${theme.localisation.programme.upper} Status`}
                filter={'filter[active]'}
                currentValue={savedQuery['filter[active]']}
                resourceName={[
                  { id: '', name: 'All'},
                  { id: 'true', name: 'Active'},
                  { id: 'false', name: 'Inactive'},
                ]}
                multi={false}
                updateQuery={updateQuery}
                setSelectIsOpen={setSelectIsOpen}
              />
              <SelectFilter
                label={`${theme.localisation.programme.upper} Restriction`}
                filter={'filter[restricted]'}
                currentValue={savedQuery['filter[restricted]']}
                resourceName={[
                  { id: '', name: 'All'},
                  { id: 'true', name: 'Restricted'},
                  { id: 'false', name: 'Not Restricted'},
                ]}
                multi={false}
                updateQuery={updateQuery}
                setSelectIsOpen={setSelectIsOpen}
              />
            </>
          )}

          <SwitchOrder
            clientSpecificOrder={{
              'ae': [
                'production-year', 'number-series', 'number-episodes', 'languages',
                'custom-attributes', 'talents', 'productionCompany', 'qualities', 'programmeType',
              ],
              'all3': [
                'customCatalogues', 'productionCompany', 'programmeBroadcasters', 'languages', 'definition', 'custom-attributes',
                'number-episodes', 'number-series', 'talents', 'qualities', 'programmeType',
              ],
              'cineflix': [
                'customCatalogues', 'custom-attributes', 'productionCompany', 'languages', 'definition',
                'number-episodes', 'number-series', 'production-year', 'talents', 'qualities', 'programmeType',
              ],
              'endeavor': [
                'customCatalogues', 'productionCompany', 'custom-attributes','languages','talents','qualities','programmeType',
              ],
            }}
          >
            <OrderSection name="programmeType" >
            { theme.features.programmeTypes.filters && programmeFilterCV.programmeTypesFilter === 'select' && (
              <SelectFilter
                label={theme.localisation.programmeType.upper}
                allLoaded={allFiltersLoaded}
                currentValue={savedQuery['filter[programme_type]']}
                filter={'filter[programme_type]'}
                meta={meta}
                onFinishedLoading={finishedLoading('programmeType')}
                resourceName={'programme-type'}
                setSelectIsOpen={setSelectIsOpen}
                updateQuery={updateQuery}
              />
            )}
            </OrderSection>

            <OrderSection name="customCatalogues" >
            { theme.features.customCatalogues.enabled && allowCataloguesFilter && programmeFilterCV.cataloguesFilter === 'select' && (
              <SelectFilter
                label={theme.localisation.customCatalogues.upper}
                allLoaded={allFiltersLoaded}
                currentValue={savedQuery['filter[catalogue]']}
                filter={'filter[catalogue]'}
                meta={meta}
                onFinishedLoading={finishedLoading('catalogue')}
                resourceName={'catalogue'}
                setSelectIsOpen={setSelectIsOpen}
                updateQuery={updateQuery}
              />
            )}
            </OrderSection>

            <OrderSection name="productionCompany" >
              {theme.features.programmeFilters.productionCompanies &&
                <SelectFilter
                  label={programmeFilterCV.productionCompanyLabel || theme.localisation.productionCompany.upper}
                  allLoaded={allFiltersLoaded}
                  currentValue={savedQuery['filter[production_company]']}
                  filter={'filter[production_company]'}
                  meta={meta}
                  onFinishedLoading={finishedLoading('productionCompany')}
                  resourceName={'production-company'}
                  setSelectIsOpen={setSelectIsOpen}
                  updateQuery={updateQuery}
                />
              }
            </OrderSection>

            <OrderSection name="programmeBroadcasters" >
              {theme.features.programmeFilters.broadcasters &&
                <AsyncSelectFilter
                  label={theme.localisation.broadcaster.upper}
                  allLoaded={allFiltersLoaded}
                  currentValue={savedQuery['filter[broadcaster]'] as string}
                  filter={'filter[broadcaster]'}
                  meta={meta}
                  resourceName={'broadcaster'}
                  updateQuery={updateQuery}
                  hideIfEmpty={false}
                />
              }
            </OrderSection>

            <OrderSection name="languages" >
              {theme.features.programmeFilters.languages &&
                <SelectFilter
                  label="Language"
                  allLoaded={allFiltersLoaded}
                  currentValue={savedQuery['filter[language]']}
                  filter={'filter[language]'}
                  meta={meta}
                  onFinishedLoading={finishedLoading('languages')}
                  resourceName={'language'}
                  setSelectIsOpen={setSelectIsOpen}
                  updateQuery={updateQuery}
                />
              }
            </OrderSection>

            <OrderSection name="definition" >
              <ClientSpecific client="cineflix">
                <SelectFilter
                  label="Definition"
                  allLoaded={allFiltersLoaded}
                  currentValue={savedQuery['filter[quality]']}
                  filter={'filter[quality]'}
                  meta={meta}
                  onFinishedLoading={() => { /* qualities get fetched in <OrderSection name="qualities"> */}}
                  resourceName={'quality'}
                  setSelectIsOpen={setSelectIsOpen}
                  updateQuery={updateQuery}
                />
              </ClientSpecific>
            </OrderSection>

            <OrderSection name="custom-attributes" >
              <CustomAttributeFilter
                allLoaded={allFiltersLoaded}
                customFilters={savedQuery['filter[custom_attribute_id_and_value]']}
                meta={meta}
                onFinishedLoading={finishedLoading('customAttributes')}
                setSelectIsOpen={setSelectIsOpen}
                updateQuery={updateQuery}
              />
            </OrderSection>

            <OrderSection name="number-episodes" >
              {theme.features.programmeFilters.episodes && allFiltersLoaded &&
                <RangeFilter
                  label={`Number of ${pluralize(theme.localisation.episodes.upper)}`}
                  defaultLimits={[0, 500]}
                  meta={meta['number-of-episodes']}
                  resourceName={'number_of_episodes'}
                  sliders={theme.features.programmeFilters.sliders}
                  updateQuery={updateQuery}
                  values={savedQuery['filter[number_of_episodes]'] ? savedQuery['filter[number_of_episodes]'].split(',') : ['', '']}
                />
              }
            </OrderSection>

            <OrderSection name="number-series" >
              {theme.features.programmeFilters.series && allFiltersLoaded &&
                <RangeFilter
                  label={`Number of ${pluralize(theme.localisation.series.upper)}`}
                  defaultLimits={[0, 30]}
                  meta={meta['number-of-series']}
                  resourceName={'number_of_series'}
                  sliders={theme.features.programmeFilters.sliders}
                  updateQuery={updateQuery}
                  values={savedQuery['filter[number_of_series]'] ? savedQuery['filter[number_of_series]'].split(',') : ['', '']}
                />
              }
            </OrderSection>

            <OrderSection name="production-year" >
              {theme.features.programmeFilters.productionYear && allFiltersLoaded && metaHasProductionYears() ? (
                  <RangeFilter
                    label="Production Year"
                    defaultLimits={[1950, 2100]}
                    meta={getMetaProductionYearLimits()}
                    resourceName={'production_year'}
                    sliders={theme.features.programmeFilters.sliders}
                    updateQuery={updateQuery}
                    values={savedQuery['filter[production_year]'] ? savedQuery['filter[production_year]'].split(',') : ['', '']}
                  />
                ) : null
              }
            </OrderSection>

            <OrderSection name="release-date">
              {(theme.features.programmeReleaseDate.enabled || theme.features.seriesReleaseDate.enabled) &&
                <DateRangeFilters
                label={'Release Date'}
                filterName={'filter[release-date]'}
                updateQuery={updateQuery}
                currentValue={savedQuery['filter[release-date]'] as string}
                dateFormat={'YYYY-MM-DD'}
              />}
            </OrderSection>

            <OrderSection name="talents" >
              {theme.features.talents && theme.features.programmeFilters.talents &&
                <SelectFilter
                  label="Talent"
                  allLoaded={allFiltersLoaded}
                  currentValue={savedQuery['filter[talent]']}
                  filter={'filter[talent]'}
                  meta={meta}
                  onFinishedLoading={finishedLoading('talents')}
                  resourceName={'talent'}
                  resourceLabel={['firstname', 'surname']}
                  setSelectIsOpen={setSelectIsOpen}
                  updateQuery={updateQuery}
                />
              }
            </OrderSection>

            <OrderSection name="qualities" >
              {theme.features.programmeFilters.qualities &&
                <CheckboxFilter
                  label={pluralize.singular(theme.localisation.quality.upper)}
                  allLoaded={allFiltersLoaded}
                  currentValue={savedQuery['filter[quality]']}
                  filter={'filter[quality]'}
                  meta={meta}
                  onFinishedLoading={finishedLoading('qualities')}
                  resourceName={'quality'}
                  updateQuery={updateQuery}
                />
              }
            </OrderSection>
          </SwitchOrder>
        </div>
        </>
        }
        </div>

        { allFiltersLoaded && !isFiltering && (
          <div className={`${prefix}programme-filters__actions`}>
            <Button className={isCms() ? 'button button--filled' : programmeFilterCV.applyButtonClasses}>
              Apply Filters
            </Button>
            <Button className={isCms() ? 'button button--secondary' : programmeFilterCV.clearFiltersButtonClasses}
              type="button"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

export default withTheme(ProgrammeFilter)

