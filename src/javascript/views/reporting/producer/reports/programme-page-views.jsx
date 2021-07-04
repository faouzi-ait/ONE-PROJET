import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import withQueryControls from 'javascript/components/hoc/reporting/with-query-controls'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useCsvExport from 'javascript/utils/hooks/use-csv-export'

import ReportSection from 'javascript/components/reporting/section'
import { ReportControls } from 'javascript/components/reporting/controls'
import TitleHeader from 'javascript/components/reporting/title-header'
import TableHeader from 'javascript/components/reporting/table-header'
import NoResults from 'javascript/components/reporting/no-results'
import Loader from 'javascript/components/reporting/loader'

import { formatTimeOnPage } from 'javascript/views/reporting/utils'
import ProgrammePlaceholder from 'images/theme/programme-placeholder.jpg'


const ProgrammePageViews = (props) => {
  const { resources, queryControls, searchQuery, theme } = props
  const title = `${theme.localisation.programme.upper} pages viewed`

  const handleExport = (type) => {
    props.exportApi(type)
  }

  const handleClick = (value) => {
    const reverse = searchQuery.sort && searchQuery.sort.indexOf(value) === 0 ? true : false
    props.searchApi(value, reverse)
  }

  return (
    <ReportSection bg={props.bg}>
      <TitleHeader>{title}</TitleHeader>
      <div class="chart">
        <ReportControls>
          {queryControls.dateFrom}
          {queryControls.dateTo}
          {queryControls.limit}
          <button disabled={!resources.length} className="button button--filled" onClick={()=>handleExport('csv')}>Export as CSV</button>
        </ReportControls>
      </div>
      {props.loading ? (
        <Loader />
      ): (
        <>
          {resources.length ?
            <table className="table table--report table--hover">
              <thead>
              <tr>
                <TableHeader field="programme" colSpan="2" title={theme.localisation.programme.upper} onClick={() => handleClick('programme')} sort={searchQuery.sort} />
                <TableHeader field="pageViews" title="Page Views" onClick={() => handleClick('pageViews')} sort={searchQuery.sort} />
                <TableHeader field="timeOnPage" title="Time on Page" onClick={() => handleClick('timeOnPage')} sort={searchQuery.sort} />
                <TableHeader field="videosWatched" title="Videos Watched" onClick={() => handleClick('videosWatched')} sort={searchQuery.sort}/>
                <TableHeader field="assetsDownloaded" title="Assets Downloaded" onClick={() => handleClick('assetsDownloaded')} sort={searchQuery.sort}/>
                <TableHeader field="lastView" title="Last Viewed" onClick={() => handleClick('lastView')} sort={searchQuery.sort  || '-lastView'}/>
              </tr>
              </thead>
              <tbody>
              {resources.map(p => {
                return (
                  <tr key={p.id} onClick={()=>{props.selectProgramme(p)}}>
                    <td className="table__image"><img
                      src={p.thumbnail && p.thumbnail.small.url ? p.thumbnail.small.url : ProgrammePlaceholder} alt={p.name}/></td>
                    <td>{p.programme}</td>
                    <td>{p.pageViews}</td>
                    <td>{formatTimeOnPage(p.timeOnPage)}</td>
                    <td>{p.videosWatched}</td>
                    <td>{p.assetsDownloaded}</td>
                    <td>{moment(p.lastView).fromNow()}</td>
                  </tr>
                )
              })}
              </tbody>
            </table>
            : <NoResults />
          }
        </>
      )}
    </ReportSection>
    )
  }

export default compose(
  withTheme,
  withQueryControls(['dateFrom', 'dateTo', 'limit']),
  withHooks((props) => {
    const relation = {
      'name': 'user-activities',
      'id': props.producer.id
    }

    const reduxResource = useReduxResource('reports-producer', 'reports/producer', relation)
    const [csvExport] = useState(useCsvExport())
    const [searchQuery, setSearchQuery] = useState(props.query)
    let loading = true

    const exportApi = (format) => {
      const query = {...searchQuery}
      delete query['page[limit]']
      csvExport.create(`reports/producers/${relation.id}/${pluralize(relation.name)}`, query, format, relation.name)
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
      resources: reduxResource.queryState.data || []
    }
  })
)(ProgrammePageViews)