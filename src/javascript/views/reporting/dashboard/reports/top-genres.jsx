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
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'

import pluralize from 'pluralize'
import withTheme from 'javascript/utils/theme/withTheme'

const TopGenres = (props) => {
  const { queryControls, resources, loading, theme } = props
  const genres = []
  const subGenres = []
  const clientVariables = {
    subGenreLabel: {
      default: `Sub ${pluralize(theme.localisation.genre.upper)}`,
      'ae': 'Categories'
    }
  }
  const topGenresCV = useClientVariables(clientVariables)
  resources.map((item, i) => {
    genres.push({
      name: item.label,
      y: item['chart-data'].data.reduce((pv, cv) => pv + cv, 0)
    })
    const children = item['chart-data'].subgenres
    Object.values(children).map((c, i) => {
      const subGenre = {
        name: c,
        y: item['chart-data'].data[i]
      }
      if (c === 'none') {
        subGenre.name = ''
        subGenre.color = 'none'
      }
      subGenres.push(subGenre)
    })
  })
  const config = {
    chart: {
      type: 'pie',
      height: 800
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
      shared: false,
      split: false
    },
    series: [{
      name: pluralize(theme.localisation.genre.upper),
      data: genres,
      size: '69%',
      dataLabels: {
        formatter: function () {
          return this.y > 5 ? this.point.name : null;
        },
        color: '#ffffff',
        distance: -30
      }
    },{
      name: topGenresCV.subGenreLabel,
      data: subGenres,
      size: '100%',
      innerSize: '70%',
      id: 'sub genres',
      showInLegend: false
    }],
    plotOptions: {
      series: {
        y: -10
      }
    }
  }
  const title = `Top Genres`

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
          {queryControls.platform}
          <button disabled={!resources.length} className="button button--filled" onClick={()=>handleExport('csv')}>Export as CSV</button>
        </ReportControls>
        <ChartReport resources={resources} customConfig={config} loading={loading} />
      </div>
    </ReportSection>
  )
}

export default compose(
  withTheme,
  withQueryControls(['dateFrom', 'dateTo', 'platform', 'limit']),
  withHooks((props) => {
    const relation = {
      'name': 'top-genres',
      id: 2
    }

    const reduxResource = useReduxResource('reports-dashboard', 'reports/dashboard-genres', relation)
    const [csvExport] = useState(useCsvExport())
    let loading = true

    const exportApi = (format) => {
      const {query} = props
      delete query['page[limit]']
      csvExport.create(`reports/dashboard/${relation.name}`, query, format, relation.name)
    }

    useEffect(() => {
      reduxResource.findAllAndAllRelations(relation, props.query)
    }, [props.query['filter[date-from]'], props.query['filter[date-to]'], props.query['filter[platform]'], props.query['page[limit]']])

    if(reduxResource.queryState.succeeded){
      loading = false
    }

    return {
      exportApi,
      loading,
      resources: reduxResource.getReduxResources() || []
    }
  })
)(TopGenres)