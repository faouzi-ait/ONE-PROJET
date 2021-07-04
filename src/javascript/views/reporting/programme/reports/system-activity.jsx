import React, { useEffect, useState } from 'react'
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
import ProgrammePlaceholder from 'images/theme/programme-placeholder.jpg'
import { formatTimeOnPage } from 'javascript/views/reporting/utils'


const SystemActivity = (props) => {
  const { resources, queryControls, searchQuery, theme } = props

  const handleClick = (value) => {
    const reverse = searchQuery.sort && searchQuery.sort.indexOf(value) === 0 ? true : false
    props.searchApi(value, reverse)
  }

  const handleExport = (type) => {
    props.exportApi(type)
  }

  return (
    <ReportSection bg={props.bg}>
      <TitleHeader>Recent {theme.localisation.programme.upper} Activity</TitleHeader>
      <h3 className="heading--three report__sub-title">Displaying your users only</h3>
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
                  <TableHeader colSpan="2" field="programme" title={theme.localisation.programme.upper} onClick={() => handleClick('programme')} sort={searchQuery.sort} />
                  <TableHeader field="user" title="User" onClick={() => handleClick('user')} sort={searchQuery.sort} />
                  <TableHeader field="company-name" title="Company" onClick={() => handleClick('company-name')} sort={searchQuery.sort} />
                  <TableHeader field="time-on-page" title="Time on Page" onClick={() => handleClick('time-on-page')} sort={searchQuery.sort} />
                  <TableHeader field="videos-watched" title="Videos Watched" onClick={() => handleClick('videos-watched')} sort={searchQuery.sort}/>
                  <TableHeader field="assetsDownloaded" title="Assets Downloaded" onClick={() => handleClick('assetsDownloaded')} sort={searchQuery.sort}/>
                  <TableHeader field="last-view" title="Last Viewed" onClick={() => handleClick('last-view')} sort={searchQuery.sort || '-last-view'} />
                </tr>
                </thead>
                <tbody>
                {resources.map(p => {
                  return (
                    <tr key={p.id} onClick={()=>{props.selectProgramme(p)}}>
                      <td className="table__image"><img
                        src={p.thumbnail && p.thumbnail.small.url ? p.thumbnail.small.url : ProgrammePlaceholder} alt={p.name}/></td>
                      <td>{p['programme']}</td>
                      <td>{p['user']}</td>
                      <td>{p['company-name']}</td>
                      <td>{formatTimeOnPage(p['time-on-page'])}</td>
                      <td>{p['videos-watched']}</td>
                      <td>{p['assets-downloaded']}</td>
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
      'name': 'reports-by-system-user-activity',
      id: 0
    }

    const reduxResource = useReduxResource('reports-system', 'reports/system', relation)
    const [csvExport] = useState(useCsvExport())
    const [searchQuery, setSearchQuery] = useState(props.query)
    let loading = true

    const exportApi = (format) => {
      const query = {...searchQuery}
      delete query['page[limit]']
      csvExport.create(`reports/system/user-activities`, query, format, relation.name)
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
      reduxResource.findAllAndAllRelations(relation, update)
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
      resources: reduxResource.queryState.data || []
    }
  })
)(SystemActivity)