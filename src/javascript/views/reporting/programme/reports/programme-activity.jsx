import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withQueryControls from 'javascript/components/hoc/reporting/with-query-controls'
import withTheme from 'javascript/utils/theme/withTheme'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useCsvExport from 'javascript/utils/hooks/use-csv-export'

import ReportSection from 'javascript/components/reporting/section'
import { ReportControls } from 'javascript/components/reporting/controls'
import TitleHeader from 'javascript/components/reporting/title-header'
import TableHeader from 'javascript/components/reporting/table-header'
import NoResults from 'javascript/components/reporting/no-results'
import Loader from 'javascript/components/reporting/loader'

import { formatTimeOnPage } from 'javascript/views/reporting/utils'

const UserViews = (props) => {
  const { resources, queryControls, searchQuery, theme } = props

  const handleClick = (value) => {
    const reverse = searchQuery.sort && searchQuery.sort.indexOf(value) === 0 ? true : false
    props.searchApi(value, reverse)
  }

  const handleExport = (type) => {
    props.exportApi(type)
  }

  return(
    <ReportSection bg={props.bg}>
      <TitleHeader>Recent {theme.localisation.programme.upper} Activity</TitleHeader>
      <div class="chart">
        <ReportControls>
          {queryControls.dateFrom}
          {queryControls.dateTo}
          {queryControls.limit}
          <button disabled={!resources.length} className="button button--filled" onClick={()=>handleExport('csv')}>Export as CSV</button>
        </ReportControls>
        {props.loading ? (
          <Loader />
        ): (
          <>
            {resources.length ?
              <table className="table table--report table--hover">
                <thead>
                  <tr>
                    <TableHeader field="user" title="User" onClick={() => handleClick('user')} sort={searchQuery.sort} />
                    <TableHeader field="company-name" title="Company" onClick={() => handleClick('company-name')} sort={searchQuery.sort} />
                    <TableHeader field="time-on-page" title="Time On Page" onClick={() => handleClick('time-on-page')} sort={searchQuery.sort} />
                    <TableHeader field="page-views" title="No. Of Views" onClick={() => handleClick('page-views')} sort={searchQuery.sort}  />
                    <TableHeader field="videos-watched" title="Videos Watched" onClick={() => handleClick('videos-watched')} sort={searchQuery.sort}/>
                    <TableHeader field="last-view" title="Last Viewed" onClick={() => handleClick('last-view')} sort={searchQuery.sort || '-last-view'} />
                  </tr>
                </thead>
                <tbody>
                {resources.map(p => {
                  return (
                    <tr key={p.id} onClick={()=>{props.selectUser(p['user-id'])}}>
                      <td>{p.user}</td>
                      <td>{p['company-name']}</td>
                      <td>{formatTimeOnPage(p['time-on-page'])}</td>
                      <td>{p['page-views']}</td>
                      <td>{p['videos-watched']}</td>
                      <td>{moment(p['last-view']).fromNow()}</td>
                    </tr>
                  )
                })}
                </tbody>
              </table>
              : <NoResults />
            }
          </>
        )}
      </div>
    </ReportSection>
  )
}

export default compose(
  withTheme,
  withQueryControls(['dateFrom', 'dateTo', 'limit']),
  withHooks((props) => {
    const relation = {
      'name': 'user-activity',
      'id': props.programme.id
    }

    const reduxResource = useReduxResource('reports-programme', 'reports/programmes', relation)
    const [csvExport] = useState(useCsvExport())
    const [searchQuery, setSearchQuery] = useState(props.query)
    let loading = true

    const exportApi = (format) => {
      const query = {...searchQuery}
      delete query['page[limit]']
      csvExport.create(`reports/programmes/${relation.id}/${pluralize(relation.name)}`, query, format, relation.name)
    }

    const searchApi = (sort = '', reverse) => {
      const update = {...searchQuery}
      if (sort.length) {
        if(sort != 'lastView') {
          sort += ',-lastView'
        }
        update.sort = reverse ? `-${sort}` : sort
      } else {
        update.sort = '-lastView'
      }
      setSearchQuery(update)
      reduxResource.findOneAndAllRelations(relation, update)
    }

    useEffect(searchApi, [searchQuery['filter[date-from]'], searchQuery['filter[date-to]'], searchQuery['page[limit]']])

    useEffect(()=>{
      setSearchQuery(props.query)
    }, [props.query])

    if(reduxResource.queryState.succeeded){
      loading = false
    }

    return {
      searchQuery,
      searchApi,
      exportApi,
      loading,
      resources: reduxResource.getReduxResources() || []
     }
  })
)(UserViews)