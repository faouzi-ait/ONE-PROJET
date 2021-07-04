import React, { useEffect, useState } from 'react'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withQueryControls from 'javascript/components/hoc/reporting/with-query-controls'
import withTheme from 'javascript/utils/theme/withTheme'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useCsvExport from 'javascript/utils/hooks/use-csv-export'

import ReportSection from 'javascript/components/reporting/section'
import { ReportControls } from 'javascript/components/reporting/controls'
import TitleHeader from 'javascript/components/reporting/title-header'
import Loader from 'javascript/components/reporting/loader'
import NoResults from 'javascript/components/reporting/no-results'
import Card from 'javascript/components/card'
import Icon from 'javascript/components/icon'

const ScreenersSent = (props) => {
  const { resources, queryControls, theme } = props
  const title = 'Screeners Sent'

  const handleExport = (type) => {
    props.exportApi(type)
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
            <div className="grid grid--four fade-on-load">
              {resources.map((r) => {
                return (
                  <Card
                    key={r.id}
                    title={r.title}
                    image={{src: r['image']['admin_preview']['url']}}>
                    <p className="card__copy">{r['programme-title']}</p>
                    <p className="card__count">
                      {theme.variables.ListFolderIcon ?
                        <>
                          <Icon id="i-folder" />
                          <span>
                          { r['screeners-sent'] }
                          </span>
                        </>
                      : r['screeners-sent']}
                    </p>
                  </Card>
              )
              })}
            </div>
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
      'name': 'reports-by-producer-screeners-sent',
      'id': props.producer.id
    }

    const reduxResource = useReduxResource('reports-producer', 'reports/producer', relation)
    const [csvExport] = useState(useCsvExport())
    let loading = true

    const exportApi = (format) => {
      const {query} = props
      delete query['page[limit]']
      csvExport.create(`reports/producers/${relation.id}/screeners-sent`, query, format, relation.name)
    }

    const searchApi = (sort = '') => {
      if (sort.length) {
        props.query.sort = sort
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
)(ScreenersSent)