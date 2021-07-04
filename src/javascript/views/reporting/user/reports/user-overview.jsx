import React, { useEffect } from 'react'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

import { ReportSection } from 'javascript/components/reporting/section'

const UserDetails = ({children}) =>
  <div className="user">
    {children}
  </div>

const UserDetailWrapper = ({children}) =>
  <div className="user__detail-wrapper">
    {children}
  </div>

const UserDetail = ({label, children}) =>
  <p className="user__detail">
    <small className="user__label">{label}</small>
    {children}
  </p>

const UserNameWithJobTitle = ({user}) =>
  <div className="user__name">
    <h2 className="heading--two user__title">{user['first-name']} {user['last-name']}</h2>
    <p>{user['job-title']}</p>
  </div>

const StatisticBox = ({title, detail, children, classes}) =>
  <div className={`statistic ${classes}`}>
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

class UserOverviewInformation extends React.Component {
  shouldRenderCompany() {
    return !!this.props.user.company
  }

  shouldRenderAccountManager() {
    return this.props.theme.features.accountManager && this.props.user['account-manager']
  }

  shouldRenderTerritories() {
    return this.props.theme.features.territories.enabled
  }

  renderAccountManager() {
    const {user} = this.props
    return <span>{user['account-manager']['first-name']} {user['account-manager']['last-name']}</span>
  }

  renderTerritories() {
    const {user} = this.props
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
    const userData = this.props.data[0] || {}
    const systemData = this.props.data[1] || {}
    const { user, theme } = this.props

    return <ReportSection bg={this.props.bg}>
      <UserDetails>
        <UserNameWithJobTitle user={user} />
        <UserDetailWrapper>
          <UserDetail label='Email'>
            <span>{user.email}</span>
          </UserDetail>
          { this.shouldRenderCompany() && <UserDetail label='Company'><span>{user.company.name}</span></UserDetail>}
          { this.shouldRenderAccountManager() && <UserDetail label={theme.localisation.accountManager.upper}>{this.renderAccountManager()}</UserDetail> }
          { this.shouldRenderTerritories() && <UserDetail label='Territories'>{this.renderTerritories()}</UserDetail> }
        </UserDetailWrapper>
      </UserDetails>
      <h3 className="heading--three">Overview information</h3>
      <div className="grid grid--four">
        <StatisticBox
          classes="statistic--small"
          title='Last Login'
          detail={userData.lastLogin ? moment(userData.lastLogin).fromNow() : 'Never'} />
        <StatisticBox
          title='Average Monthly Visits'
          detail={userData.averageMonthlyVisits}>
          <SystemAverage value={systemData.averageMonthlyVisits} />
        </StatisticBox>
        <StatisticBox
          title={`Average Monthly ${theme.localisation.programme.upper} Views`}
          detail={userData.averageMonthlyProgrammeViews}>
          <SystemAverage value={systemData.averageMonthlyProgrammeViews} />
        </StatisticBox>
        <StatisticBox
          title='Average Monthly Video Views'
          detail={userData.averageMonthlyVideoViews}>
          <SystemAverage value={systemData.averageMonthlyVideoViews} />
        </StatisticBox>
      </div>
    </ReportSection>
  }
}

export default compose(
  withTheme,
  withHooks((props) => {
    const relation = {
      'name': 'user-overview-information',
      'id': props.user.id
    }

    const reduxResource = useReduxResource('reports-user', 'user-overview-information', relation)

    useEffect(() => {
      reduxResource.findOneAndAllRelations(relation)
    }, [props.user.id])

    return { data: reduxResource.queryState.data || [] }
  })
)(UserOverviewInformation)