import React, { useEffect, useState } from 'react'
import NavLink from 'javascript/components/nav-link'
import pluralize from 'pluralize'
import styled from 'styled-components'

import compose from 'javascript/utils/compose'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
// components
import DashboardCard from 'javascript/components/admin/dashboard/card'
//hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
//hoc
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'

const Activity = (props) => {
  const { theme } = props
  const reports = [
    {
      label: `Unique logins`,
      label: `Unique ${props.recentLogins && props.recentLogins['logins-total'] === 1 ? 'login':'logins'}`,
      value: props.recentLogins ? props.recentLogins['logins-total'] : 0,
      loading: !props.recentLogins
    },
    {
      label: `${props.videoViews && props.videoViews['record-count'] === 1 ? `${theme.localisation.video.upper} has`: `${pluralize(theme.localisation.video.upper)} have`} been viewed`,
      value: props.videoViews ? props.videoViews['record-count'] : 0,
      loading: !props.videoViews
    },
    {
      label: `${props.programmeViews && props.programmeViews['record-count'] === 1 ? `${theme.localisation.programme.upper} has`: `${pluralize(theme.localisation.programme.upper)} have`} been viewed`,
      value: props.programmeViews ? props.programmeViews['record-count'] : 0,
      loading: !props.programmeViews
    }
  ]

  return (
    <DashboardCard
      title={`Activity`}
      icon={`i-chart`}
      width={'40'}
      height={'30'}
      reports={reports}>
      <Copy>Video and programme views are inclusive of internal and external user data</Copy>
      <NavLink
        to={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.reporting.path}`}
        className="cms-button"
        ignorePrefixing
      >
        {`View Reporting`}
      </NavLink>
    </DashboardCard>
  )
}

const enhance = compose(
  withTheme,
  withHooks(props => {
    const loginRelation = {'name': 'reports-by-system-overview'}
    const loginsReduxResource = useReduxResource('reports-system', 'logins_dashboard', loginRelation)
    const programmeViewsReduxResource = useReduxResource('programme-views', 'programme-views__dashboard')
    const videoViewsReduxResource = useReduxResource('video-views', 'video-views__dashboard')

    const getRecentLogins = () => {
      loginsReduxResource.findAllAndAllRelations(loginRelation, {
        'filter[date-from]': props.date,
        'page[size]': 1
      })
    }
    useEffect(getRecentLogins, [])

    const getProgrammeViews = () => {
      programmeViewsReduxResource.findAll({
        'filter[created-since]': props.date,
        'page[size]': 1
      })
    }
    useEffect(getProgrammeViews, [])

    const getVideoViews = () => {
      videoViewsReduxResource.findAll({
        'filter[created-since]': props.date,
        'page[size]': 1,
        'filter[all]': true
      })
    }
    useEffect(getVideoViews, [])

    return {
      recentLogins: loginsReduxResource.queryState.data || null,
      programmeViews: programmeViewsReduxResource.queryState.lastMeta || null,
      videoViews: videoViewsReduxResource.queryState.lastMeta || null
    }
  })
)

const Copy = styled.p`
  font-size: 14px
  font-style: italic
  margin: 0 0 20px
  margin-right: auto
  max-width: 100%
`

export default enhance(Activity)
