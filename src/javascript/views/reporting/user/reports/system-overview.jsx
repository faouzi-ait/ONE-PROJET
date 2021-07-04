import React, { useEffect } from 'react'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

import TitleHeader from 'javascript/components/reporting/title-header'
import { ReportSection } from 'javascript/components/reporting/section'

const StatisticBox = ({title, detail, children}) =>
  <div className="statistic">
    <div className="statistic__box">
      <p className="statistic__title">{title}</p>
      <p className="statistic__detail">{detail || 0}</p>
    </div>
    <p className="statistic__additional">{children}</p>
  </div>

const SystemAverage = ({value}) =>
  <React.Fragment>
    System average: <strong>{value || 0}</strong>
  </React.Fragment>

class SystemOverview extends React.Component {
  shouldRenderCompany() {
    return !!this.props.company
  }

  shouldRenderAccountManager() {
    const user = this.props.resource
    return this.props.theme.features.accountManager && user['account-manager']
  }

  shouldRenderTerritories() {
    return this.props.theme.features.territories.enabled
  }

  renderAccountManager() {
    const user = this.props.resource
    return <span>{user['account-manager']['first-name']} {user['account-manager']['last-name']}</span>
  }

  renderTerritories() {
    const user = this.props.resource
    if (user && user.territories && user.territories.length > 0) {
      return (
        user.territories.map(territory => <span className={`user__detail-tag tag territory`} key={territory.id}>{territory.name}</span>)
      )
    } else {
      return (
        <span className='user__detail-tag tag territory territory--placeholder'>{this.props.theme.features.territories.default}</span>
      )
    }
  }

  render() {
    const data = this.props.resources || {}
    return <ReportSection bg={this.props.bg}>
      <TitleHeader>Overview information</TitleHeader>
      <div className="grid grid--four">
        <StatisticBox
          title='Total number of logins'
          detail={data['logins-total']} />
        <StatisticBox
          title='Av. monthly visits'
          detail={data['average-monthly-visits-my-users']}>
          <SystemAverage value={data['average-monthly-visits-system']} />
        </StatisticBox>
        <StatisticBox
          title={`Av. monthly programme views`}
          detail={data['average-monthly-programme-views-my-users']}>
        </StatisticBox>
        <StatisticBox
          title='Av. monthly video views'
          detail={data['average-monthly-video-views-my-users']}>
          <SystemAverage value={data['average-monthly-video-views-system']} />
        </StatisticBox>
      </div>
    </ReportSection>
  }
}

export default compose(
  withTheme,
  withHooks((props) => {
    const relation = {
      'name': 'reports-by-system-overview'
    }

    const reduxResource = useReduxResource('reports-system', 'reports/system', relation)

    useEffect(() => {
      reduxResource.findAllAndAllRelations(relation)
    }, [])
    return { resources: reduxResource.queryState.data || [] }
  })
)(SystemOverview)