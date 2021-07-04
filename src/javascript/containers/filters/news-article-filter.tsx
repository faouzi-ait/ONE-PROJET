import React, { useEffect, useState } from 'react'

import usePrefix from 'javascript/utils/hooks/use-prefix'
import useResource from 'javascript/utils/hooks/use-resource'
import useTheme from 'javascript/utils/theme/useTheme'
import { applyValidFilters } from 'javascript/containers/filters/filter-tools'

// Components
import Button from 'javascript/components/button'
import SelectFilter from 'javascript/containers/filters/filter-types/select-filter'
import DateRangeFilters from 'javascript/containers/filters/filter-types/date-range-filter'


interface Query {
  [key: string]: string | boolean
}

interface Meta {
  [key: string]: any
}

interface Props {
  closeEvent: (callback?: any) => void,
  initialMeta: Meta,
  onSubmit: (newQuery?: any, pageChange?: any, filtered?: boolean) => void,
  query: Query,
}

const metaQuery = {
  fields: {
    'news-article-search-results': 'title',
  },
  'page[size]': 1,
  'page[number]': 1,
  'filter[with-aggregations]': true,
}

const NewsArticleFilter = ({
  closeEvent,
  initialMeta,
  onSubmit,
  query,
}: Props) => {
  const { localisation } = useTheme()
  const { prefix } = usePrefix()
  const newsArticleSearchResource = useResource('news-article-search-result')
  //keep savedQuery (filters) and meta states here - only passed up on 'Submit'
  const [savedQuery, setSavedQuery] = useState(query)
  const [meta, setMeta] = useState(initialMeta)

  const [selectIsOpen, setSelectIsOpen] = useState(false)
  const classes = [`${prefix}form`, selectIsOpen && 'open-select'].join(` ${prefix}form--`)
  const [filtersLoaded, setFiltersLoaded] = useState({})
  const [allFiltersLoaded, setAllFiltersLoaded] = useState(false)

  useEffect(() => {
    setSavedQuery(query)
  }, [query])

  const updateQuery = (filter: string, filterValue: string | boolean = '') => {
    const update = {
      ...savedQuery,
      [filter]: filterValue
    }
    setSavedQuery(update)
    updateMeta(update)
  }

  const updateMeta = (currentFilters) => {
    const query = applyValidFilters(metaQuery, currentFilters)
    newsArticleSearchResource.findAll(query)
    .then((response) => {
      setMeta(response.meta || {})
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(savedQuery)
    closeEvent()
  }

  const clearFilters = () => {
    onSubmit() // onSubmit - with no parameters, resets query = initialQuery
    closeEvent()
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
        { !allFiltersLoaded && (
          <div className="container" style={{ minHeight: '65vh' }}>
            <div className="loader" />
          </div>
        )}
        <div className={`${prefix}programme-filters__row`}>
          <SelectFilter
            label={`${localisation.news.upper} ${localisation.newsCategory.upper}`}
            allLoaded={allFiltersLoaded}
            currentValue={savedQuery['filter[news-category]']}
            filter={'filter[news-category]'}
            meta={meta}
            onFinishedLoading={finishedLoading('news-category')}
            resourceName={'news-category'}
            setSelectIsOpen={setSelectIsOpen}
            updateQuery={updateQuery}
            hideIfEmpty={false}
          />

          <SelectFilter
            label={'Status'}
            filter={'filter[status]'}
            currentValue={savedQuery['filter[status]'] || ''}
            resourceName={[
              { id: '', name: 'All'},
              { id: 'draft', name: 'Draft'},
              { id: 'published', name: 'Published'},
            ]}
            multi={false}
            updateQuery={updateQuery}
            setSelectIsOpen={setSelectIsOpen}
          />

          <DateRangeFilters
            label={'Published Date'}
            filterName={'filter[publish-date]'}
            updateQuery={updateQuery}
            currentValue={savedQuery['filter[publish-date]'] as string}
          />

          <SelectFilter
            label={'Featured'}
            filter={'filter[featured]'}
            currentValue={savedQuery['filter[featured]'] || ''}
            resourceName={[
              { id: '', name: 'All'},
              { id: 'true', name: 'Featured'},
              { id: 'false', name: 'Regular'},
            ]}
            multi={false}
            updateQuery={updateQuery}
            setSelectIsOpen={setSelectIsOpen}
          />
        </div>

        { allFiltersLoaded && (
          <div className={`${prefix}programme-filters__actions`}>
            <Button className="button button--filled" type="submit">Apply Filters</Button>
            {Object.keys(savedQuery).length > 0 && (
              <Button className="button button--secondary" type="button" onClick={clearFilters}>Clear filters</Button>
            )}
          </div>
        )}
      </form>
    </div>
  )
}

export default NewsArticleFilter

