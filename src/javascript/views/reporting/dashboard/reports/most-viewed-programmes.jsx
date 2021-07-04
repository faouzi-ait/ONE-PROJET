import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useCsvExport from 'javascript/utils/hooks/use-csv-export'

import ReportSection from 'javascript/components/reporting/section'
import { ReportControls } from 'javascript/components/reporting/controls'
import TitleHeader from 'javascript/components/reporting/title-header'
import ChartReport from 'javascript/components/reporting/reports'
import withQueryControls from 'javascript/components/hoc/reporting/with-query-controls'
import withTheme from 'javascript/utils/theme/withTheme'

const MostViewedProgrammes = (props) => {
  const { resources, queryControls, loading, theme } = props
  const title = `Most Viewed ${pluralize(theme.localisation.programme.upper)}`

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
          {queryControls.precision}
          {queryControls.platform}
          <button disabled={!resources.length} className="button button--filled" onClick={()=>handleExport('csv')}>Export as CSV</button>
        </ReportControls>
        <ChartReport resources={props.resources} loading={loading} />
      </div>
    </ReportSection>
  )
}

export default compose(
  withTheme,
  withQueryControls(['dateFrom', 'dateTo', 'precision', 'platform', 'limit']),
  withHooks((props) => {
    const relation = {
      'name': 'most-viewed-programmes',
      id: 1
    }

    const reduxResource = useReduxResource('reports-dashboard', 'reports/dashboard-programmes', relation)
    const [csvExport] = useState(useCsvExport())

    let loading = true

    const exportApi = (format) => {
      const {query} = props
      delete query['page[limit]']
      csvExport.create(`reports/dashboard/${relation.name}`, query, format, relation.name)
    }

    useEffect(() => {
      reduxResource.findAllAndAllRelations(relation, props.query)
    }, [props.query['filter[date-from]'], props.query['filter[date-to]'], props.query['filter[precision]'], props.query['filter[platform]'], props.query['page[limit]']])

    if (reduxResource.queryState.succeeded) {
      loading = false
    }

    return {
      exportApi,
      loading,
      resources: reduxResource.getReduxResources() || []
    }
  })
)(MostViewedProgrammes)