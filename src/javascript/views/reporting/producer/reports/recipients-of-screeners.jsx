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


const RecipientsOfScreeners = (props) => {
  const { resources, queryControls, query, theme } = props
  const title = 'Recipients of Screeners'

  const handleClick = (value) => {
    const reverse = (value == query.sort) ? true : false
    props.searchApi(value, reverse)
  }

  const handleExport = (type) => {
    props.exportApi(type)
  }

  return(
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
            <table className="table table--report">
              <thead>
              <tr>
                <TableHeader field="item-name" title="Item" onClick={() => handleClick('item-name')} sort={query.sort} />
                <TableHeader field="programme-title" title={theme.localisation.programme.upper} onClick={() => handleClick('programme-title')} sort={query.sort} />
                <TableHeader field="recipient" title="Recipient" onClick={() => handleClick('recipient')} sort={query.sort}/>
                <TableHeader field="company-name" title="Company" onClick={() => handleClick('company-name')} sort={query.sort}/>
                <TableHeader field="sent-at" title="Date" onClick={() => handleClick('sent-at')} sort={query.sort}/>
              </tr>
              </thead>
              <tbody>
              {resources.map(p => {
                return (
                  <tr key={p.id}>
                    <td>{p['item-name']}</td>
                    <td>{p['programme-title']}</td>
                    <td>{p.recipient}</td>
                    <td>{p['company-name']}</td>
                    <td>{moment(p['sent-at']).format(theme.features.formats.mediumDate)}</td>
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
      'name': 'recipients-of-screeners',
      'id': props.producer.id
    }

    const reduxResource = useReduxResource('reports-producer', 'reports/producer', relation)
    const [csvExport] = useState(useCsvExport())
    let loading = true

    const exportApi = (format) => {
      const {query} = props
      delete query['page[limit]']
      csvExport.create(`reports/producers/${relation.id}/${pluralize(relation.name)}`, query, format, relation.name)
    }

    const searchApi = (sort = '', reverse) => {
      if (sort.length) {
        props.query.sort = reverse ? `-${sort}` : sort
      }
      reduxResource.findOneAndAllRelations(relation, props.query)
    }
    useEffect(searchApi, [props.query['filter[date-from]'], props.query['filter[date-to]'], props.query['page[limit]']])

    if(reduxResource.queryState.succeeded){
      loading = false
    }

    return {
      searchApi,
      exportApi,
      loading,
      resources: reduxResource.queryState.data || []
    }
  })
)(RecipientsOfScreeners)