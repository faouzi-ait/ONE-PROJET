import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'

import deepEqual from 'deep-equal'

import { isCms } from 'javascript/utils/generic-tools'
import allClientVariables from 'javascript/containers/filters/programme-filter/variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import usePrefix from 'javascript/utils/hooks/use-prefix'
import withTheme from 'javascript/utils/theme/withTheme'

// Components
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import ProgrammeFilter from 'javascript/containers/filters/filter-types/programme-filter'
import Button from 'javascript/components/button'
import DateRangeFilters from 'javascript/containers/filters/filter-types/date-range-filter'
import RangeFilter from 'javascript/containers/filters/filter-types/range-filter'
import SelectFilter from 'javascript/containers/filters/filter-types/select-filter'

interface Query {
  [key: string]: string
}

interface Meta {
  [key: string]: any
}

interface Props {
  closeEvent: (callback?: any) => void,
  cms: boolean,
  meta: Meta,
  onSubmit: (newQuery?: any, pageChange?: any, filtered?: boolean) => void,
  query: Query,
  theme: CustomThemeType
}

const SeriesFilter = ({
  closeEvent,
  cms,
  meta,
  onSubmit,
  query,
  theme,
}: Props) => {

  const { prefix } = usePrefix()
  const [savedQuery, setSavedQuery] = useState(query)
  const [selectIsOpen, setSelectIsOpen] = useState(false)
  const classes = [`${prefix}form`, selectIsOpen && 'open-select'].join(` ${prefix}form--`)
  const programmeFilterCV = useClientVariables(allClientVariables)

  useEffect(() => {
    const isNewQuery = deepEqual(query, savedQuery)
    if (isNewQuery) {
      setSavedQuery(query)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(savedQuery)
    closeEvent()
  }

  const clearFilters = () => {
    onSubmit() // onSubmit - with no parameters, resets query = initialQuery
    closeEvent()
  }

  return (
    <div className={`${prefix}programme-filters`}>
      <form className={classes} onSubmit={handleSubmit}>
        <div className={`${prefix}programme-filters__row`}>
          <ProgrammeFilter
            filter={'filter[programme-ids]'}
            meta={meta['programme-id']}
            currentValue={savedQuery['filter[programme-ids]']}
            updateQuery={updateQuery}
          />
          <SelectFilter
            label={`${theme.localisation.series.upper} Status`}
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
            label={`${theme.localisation.series.upper} Restriction`}
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
          <RangeFilter
            label={`Number of ${pluralize(theme.localisation.episodes.upper)}`}
            defaultLimits={[0, 500]}
            meta={meta['episodes-count']}
            resourceName={'number-of-episodes'}
            sliders={theme.features.programmeFilters.sliders}
            updateQuery={updateQuery}
            values={savedQuery['filter[number-of-episodes]'] ? savedQuery['filter[number-of-episodes]'].split(',') : ['', '']}
          />

          {(theme.features.programmeReleaseDate.enabled || theme.features.seriesReleaseDate.enabled) &&
            <DateRangeFilters
              label={'Release Date'}
              filterName={'filter[release-date]'}
              updateQuery={updateQuery}
              currentValue={savedQuery['filter[release-date]'] as string}
              dateFormat={'YYYY-MM-DD'}
            />
          }
        </div>
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
      </form>
    </div>
  )
}

export default withTheme(SeriesFilter)

