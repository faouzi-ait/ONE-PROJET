import React, { useEffect, useState, useMemo } from 'react'
import pluralize from 'pluralize'

import { applyValidFilters } from 'javascript/containers/filters/filter-tools'
import { capitalize } from 'javascript/utils/generic-tools'
import { hasPermission, isAdmin } from 'javascript/services/user-permissions'
import withTheme from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import withUser from 'javascript/components/hoc/with-user'
import usePrefix from 'javascript/utils/hooks/use-prefix'
import useResource from 'javascript/utils/hooks/use-resource'

// Components
import AsyncSelectFilter from 'javascript/containers/filters/filter-types/async-select-filter'
import Button from 'javascript/components/button'
import DateRangeFilters from 'javascript/containers/filters/filter-types/date-range-filter'
import GenreFilter from 'javascript/containers/filters/filter-types/genres'
import SelectFilter from 'javascript/containers/filters/filter-types/select-filter'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import { UserType } from 'javascript/types/ModelTypes'


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
  theme: CustomThemeType
  user: UserType
}

const metaQuery = {
  fields: {
    'user-search-results': 'first-name,last-name',
  },
  'page[size]': 1,
  'page[number]': 1,
  'filter[with-aggregations]': true,
}

const UserFilter = ({
  closeEvent,
  initialMeta,
  onSubmit,
  query,
  theme,
  user,
}: Props) => {

  const userSearchResource = useResource('user-search-result')

  //keep savedQuery (filters) and meta states here - only passed up on 'Submit'
  const { prefix } = usePrefix()
  const [savedQuery, setSavedQuery] = useState(query)
  const [meta, setMeta] = useState(initialMeta)

  const [selectIsOpen, setSelectIsOpen] = useState(false)
  const classes = [`${prefix}form`, selectIsOpen && 'open-select'].join(` ${prefix}form--`)
  const [filtersLoaded, setFiltersLoaded] = useState({})
  const [allFiltersLoaded, setAllFiltersLoaded] = useState(false)

  const canFilterByAccountManager = useMemo(() => isAdmin(user) || hasPermission(user, 'manage_external_users'), [user])
  const canFilterByRoles = useMemo(() => isAdmin(user) || hasPermission(user, 'manage_internal_users'), [user])
  const canFilterByTerritories = theme.features.territories.enabled
  const canFilterByRegions = theme.features.regions.enabled
  const canFilterByMarketing = theme.features.users.marketing.enabled
  const canFilterByGroups = theme.features.groups.enabled

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
    userSearchResource.findAll(query)
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

  const shouldDisplayGenreFilters = !!(allFiltersLoaded && theme.features.users.genres && meta['genre-ids']?.length)

  return (
    <div className={`${prefix}programme-filters`}>
      <form className={classes} onSubmit={handleSubmit}>

        { !allFiltersLoaded && (
          <div className="container" style={{ minHeight: '65vh' }}>
            <div className="loader" />
          </div>
        )}
        <div className={`${prefix}programme-filters__row`}>
          {canFilterByAccountManager &&
            <SelectFilter
              label={theme.localisation.accountManager.upper}
              allLoaded={allFiltersLoaded}
              currentValue={savedQuery['filter[account-manager]']}
              filter={'filter[account-manager]'}
              meta={{
                'user-ids': meta['account-manager-ids']
              }}
              resourceLabel={['first-name', 'last-name']}
              onFinishedLoading={finishedLoading('accountManager')}
              resourceName={'user'}
              setSelectIsOpen={setSelectIsOpen}
              updateQuery={updateQuery}
              hideIfEmpty={false}
            />
          }
          {canFilterByTerritories &&
            <AsyncSelectFilter
              label="Territories"
              allLoaded={allFiltersLoaded}
              currentValue={savedQuery['filter[territories]'] as string}
              filter={'filter[territories]'}
              meta={meta}
              resourceName={'territory'}
              updateQuery={updateQuery}
              hideIfEmpty={false}
            />
          }
          {canFilterByRegions &&
            <AsyncSelectFilter
              label={pluralize(theme.localisation.region.upper)}
              allLoaded={allFiltersLoaded}
              currentValue={savedQuery['filter[regions]'] as string}
              filter={'filter[regions]'}
              meta={meta}
              resourceName={'region'}
              updateQuery={updateQuery}
              hideIfEmpty={false}
            />
          }
          {canFilterByRoles &&
            <SelectFilter
              label="Roles"
              allLoaded={allFiltersLoaded}
              currentValue={savedQuery['filter[roles]']}
              filter={'filter[roles]'}
              meta={meta}
              onFinishedLoading={finishedLoading('roles')}
              resourceName={'role'}
              setSelectIsOpen={setSelectIsOpen}
              updateQuery={updateQuery}
              hideIfEmpty={false}
            />
          }
           <AsyncSelectFilter
            label="Companies"
            allLoaded={allFiltersLoaded}
            currentValue={savedQuery['filter[company]'] as string}
            filter={'filter[company]'}
            meta={meta}
            resourceName={'company'}
            updateQuery={updateQuery}
            hideIfEmpty={false}
          />
          {canFilterByGroups && (
            <SelectFilter
              label="Groups"
              allLoaded={allFiltersLoaded}
              currentValue={savedQuery['filter[groups]']}
              filter={'filter[groups]'}
              meta={meta}
              onFinishedLoading={finishedLoading('group')}
              resourceName={'group'}
              setSelectIsOpen={setSelectIsOpen}
              updateQuery={updateQuery}
              hideIfEmpty={false}
            />
          )}

          {allFiltersLoaded && (
            <>
              {meta['user-types']?.length > 0 && (
                <SelectFilter
                  label={'User Type'}
                  filter={'filter[user-type]'}
                  currentValue={savedQuery['filter[user-type]'] || ''}
                  resourceName={meta['user-types'].map((userType) => ({
                    id: userType,
                    name: capitalize(userType)
                  }))}
                  multi={false}
                  updateQuery={updateQuery}
                  setSelectIsOpen={setSelectIsOpen}
                />
              )}

              <SelectFilter
                label={'Status'}
                filter={'filter[active]'}
                currentValue={savedQuery['filter[active]'] || ''}
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
                label={'Suspended'}
                filter={'filter[suspended]'}
                currentValue={savedQuery['filter[suspended]'] || ''}
                resourceName={[
                  { id: '', name: 'All'},
                  { id: 'true', name: 'Suspended'},
                  { id: 'false', name: 'Not suspended'},
                ]}
                multi={false}
                updateQuery={updateQuery}
                setSelectIsOpen={setSelectIsOpen}
              />

              <SelectFilter
                label={'Approval Status'}
                filter={'filter[approval-status]'}
                currentValue={savedQuery['filter[approval-status]'] || ''}
                resourceName={[
                  { id: '', name: 'All'},
                  { id: 'pending', name: 'Pending'},
                  { id: 'approved', name: 'Approved'},
                  { id: 'rejected', name: 'Rejected'},
                ]}
                multi={false}
                updateQuery={updateQuery}
                setSelectIsOpen={setSelectIsOpen}
              />

              { canFilterByMarketing &&
                <SelectFilter
                  label={'Marketing Opt-in'}
                  filter={'filter[marketing]'}
                  currentValue={savedQuery['filter[marketing]'] || ''}
                  resourceName={[
                    { id: 'not-set', name: 'Not stated'},
                    { id: 'true', name: 'Opted-in'},
                    { id: 'false', name: 'Opted-out'},
                  ]}
                  multi={false}
                  updateQuery={updateQuery}
                  setSelectIsOpen={setSelectIsOpen}
                />
              }

              <div>
                <DateRangeFilters
                  label={'Created Date'}
                  filterName={'filter[created-at]'}
                  updateQuery={updateQuery}
                  currentValue={savedQuery['filter[created-at]'] as string}
                  dateFormat={'YYYY-MM-DD'}
                />
              </div>
            </>
          )}
        </div>

        { shouldDisplayGenreFilters && (
          <>
            <div className={`${prefix}programme-filters__row`}>
              <h3>{`${pluralize(theme.localisation.genre.upper)} of Interest`}</h3>
            </div>
            <GenreFilter
              allLoaded={allFiltersLoaded}
              meta={meta}
              onFinishedLoading={finishedLoading('genres')}
              selectedGenres={savedQuery['filter[genres]']}
              filterName={'filter[genres]'}
              updateQuery={updateQuery}
            />
          </>
        )}

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

const enhance = compose(
  withTheme,
  withUser,
)

export default enhance(UserFilter)

