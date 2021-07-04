import React from 'react'
import Highcharts from 'react-highcharts/ReactHighstock'
import { BrandColor, ChartBgColor, ChartTextColor } from '../../config/features'
import deepmerge from 'deepmerge-concat'
import NoResults from 'javascript/components/reporting/no-results'
import moment from 'moment'

const resourcesToChartSeries = (resources) => {
  if(!resources) {
    return []
  }
  return resources.map(resource => {
    return {
      name: resource.label,
      data: resource['chart-data']
    }
  })
}

export const ChartReport = ({resources, customConfig = {}, loading = true}) => {
  const defaultConfig = {
    chart: { 
      backgroundColor: ChartBgColor ? `#${ChartBgColor}` : '#ffffff',
      plotBackgroundColor: false,
      height: 500
    },
    title: false,
    rangeSelector: false,
    scrollbar: false,
    navigator: false,
    xAxis: { 
      lineColor: `#${BrandColor}`,
      labels: {
        style: {color: ChartTextColor ? `#${ChartTextColor}` : '#000000'},
        formatter: function () {
          var label = moment(this.value).format('MMM YY')
          return label
        }
      },
      title: {
        margin: 30,
        style: {color: ChartTextColor ? `#${ChartTextColor}` : '#000000'}
      }
    },
    legend: { 
      enabled: true,
      itemStyle: {
        color: ChartTextColor ? `#${ChartTextColor}` : '#000000'
      },
      itemHoverStyle: {
        color: `#${BrandColor}`
      }
    },
    yAxis: {
      lineColor: `#${BrandColor}`,
      opposite: false,
      labels: {
        y: 3,
        style: {color: ChartTextColor ? `#${ChartTextColor}` : '#000000'}
      },
      title: {
        margin: 30,
        style: {color: ChartTextColor ? `#${ChartTextColor}` : '#000000'}
      }
    },
    credits: false,
    series: !customConfig.series && resourcesToChartSeries(resources),
    plotOptions: {
      pie: {
        dataLabels: false,
        showInLegend: true,
        cursor: 'pointer',
      }
    },
    tooltip: {
      xDateFormat: '%b %y',
    }
  }
  
  const config = deepmerge(defaultConfig, customConfig)
  if(loading){
    return (
      <div className="chart__placeholder">
        <div className="loader"></div>
      </div>
    )
  }
  if(resources.length) {
    return <Highcharts config={config} />
  }
  return <NoResults />
}

export default ChartReport