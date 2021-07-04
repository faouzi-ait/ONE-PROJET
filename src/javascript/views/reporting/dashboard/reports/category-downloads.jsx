import React, { useEffect, useState } from 'react'
import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useCsvExport from 'javascript/utils/hooks/use-csv-export'

import ReportSection from 'javascript/components/reporting/section'
import { ReportControls } from 'javascript/components/reporting/controls'
import TitleHeader from 'javascript/components/reporting/title-header'
import ChartReport from 'javascript/components/reporting/reports'
import withQueryControls from 'javascript/components/hoc/reporting/with-query-controls'

const CategoryDownloads = (props) => {

  const handleExport = (type) => {
    props.exportApi(type)
  }

  const { resources, queryControls, loading } = props
  const series = {
    name: 'Download Category',
    colorByPoint: true,
    data: []
  }
  resources.map((item, i) => {
    series.data.push({
      name: item.label,
      y: resources.length === 1 && item['chart-data'] === 0 ? 100 : parseInt(item['chart-data'])
    })
  })
  const config = {
    chart: {
      type: 'pie',
      height: 600
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
      shared: false,
      split: false
    },
    series: [series]
  }
  const title = `Category Downloads`

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
        <ChartReport resources={props.resources} customConfig={config} loading={loading} />
      </div>
    </ReportSection>
  )
}

export default compose(
  withQueryControls(['dateFrom', 'dateTo', 'limit']),
  withHooks((props) => {
    const relation = {
      'name': 'category-downloads',
      id: 0
    }

    const reduxResource = useReduxResource('reports-dashboard', 'reports/dashboard-category', relation)
    const [csvExport] = useState(useCsvExport())

    let loading = true

    const exportApi = (format) => {
      const {query} = props
      delete query['page[limit]']
      csvExport.create(`reports/dashboard/${relation.name}`, query, format, relation.name)
    }

    useEffect(() => {
      reduxResource.findAllAndAllRelations(relation, props.query)
    }, [props.query['filter[date-from]'], props.query['filter[date-to]'], props.query['page[limit]']])

    if(reduxResource.queryState.succeeded){
      loading = false
    }

    return {
      exportApi,
      loading,
      resources: reduxResource.getReduxResources() || []
    }
  })
)(CategoryDownloads)