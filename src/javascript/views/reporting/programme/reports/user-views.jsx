import React, { useEffect } from 'react'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

import ReportSection from 'javascript/components/reporting/section'
import TitleHeader from 'javascript/components/reporting/title-header'
import ChartReport from 'javascript/components/reporting/reports'

class CategoryDownloads extends React.Component {
  render() {
    const { programme, loading, theme } = this.props
    const config = {
      legend: { enabled: false },
      yAxis: {
        title: {
          text: 'Number of views'
        }
      },
      xAxis: {
        title: {
          text: `${programme.title} performance over 12 months`
        }
      }
    }

    return <ReportSection bg={this.props.bg}>
      <div class="page-controls">
        <div class="page-controls__left">
          <button className={['button', 'filled'].join(' button--')} onClick={this.props.onClick}>Return to Recent {theme.localisation.programme.upper} Activity</button>
        </div>
      </div>
      <TitleHeader>{programme.title}</TitleHeader>
      <ChartReport resources={this.props.resources} customConfig={config} loading={loading} />
    </ReportSection>
  }
}

export default compose(
  withTheme,
  withHooks((props) => {
    const relation = {
      'name': 'user-views',
      'id': props.programme.id
    }

    const reduxResource = useReduxResource('reports-programme', 'reports/programmes', relation)
    let loading = true

    const searchApi = () => {
      const query = {
        'filter': {
          'date-from': moment().subtract(1, 'years').format("YYYY-MM-DD")
        }
      }
      reduxResource.findOneAndAllRelations(relation, query)
    }
    useEffect(searchApi, [props.query])

    if(reduxResource.queryState.succeeded){
      loading = false
    }

    return {
      loading,
      resources: reduxResource.queryState.data || []
    }
  })
)(CategoryDownloads)