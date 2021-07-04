import React, { useEffect, useState } from 'react'
import NavLink from 'javascript/components/nav-link'
import pluralize from 'pluralize'
import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import DashboardCard from 'javascript/components/admin/dashboard/card'

const Videos = (props) => {
  const { theme } = props
  const reports = [
    {
      label: `${
        props.recentVideos && props.recentVideos['record-count'] === 1
          ? `${theme.localisation.video.upper} has`
          : `${pluralize(theme.localisation.video.upper)} have`
      } been added`,
      value: props.recentVideos ? props.recentVideos['record-count'] : 0,
      loading: !props.recentVideos,
    },
  ]

  const stats = [
    {
      label: `Restricted ${pluralize(theme.localisation.video.upper)}`,
      value: props.restrictedVideos
        ? props.restrictedVideos['record-count']
        : 0,
      loading: !props.restrictedVideos,
    },
    {
      label: `Unrestricted ${pluralize(theme.localisation.video.upper)}`,
      value: props.unRestrictedVideos
        ? props.unRestrictedVideos['record-count']
        : 0,
      loading: !props.unRestrictedVideos,
    },
  ]

  return (
    <DashboardCard
      title={`${theme.localisation.video.upper} Management`}
      icon={`i-admin-play`}
      width={'36'}
      height={'30'}
      reports={reports}
      stats={stats}
    >
      <NavLink
        to={`/admin/${theme.localisation.video.path}`}
        className="cms-button"
        ignorePrefixing
      >{`View ${pluralize(theme.localisation.video.upper)}`}</NavLink>
    </DashboardCard>
  )
}

const enhance = compose(
  withTheme,
  withHooks(props => {
    const recentVideosReduxResource = useReduxResource(
      'videos',
      'recent-videos_dashboard',
    )
    const restrictedVideosReduxResource = useReduxResource(
      'videos',
      'restricted-videos_dashboard',
    )
    const unRestrictedVideosReduxResource = useReduxResource(
      'videos',
      'unrestricted-video_dashboard',
    )

    const getRecentVideos = () => {
      recentVideosReduxResource.findAll({
        'filter[created-since]': props.date,
        'page[size]': 1,
      })
    }
    useEffect(getRecentVideos, [])

    const getRestrictedVideos = () => {
      restrictedVideosReduxResource.findAll({
        'filter[restricted]': true,
        'page[size]': 1,
      })
    }
    useEffect(getRestrictedVideos, [])

    const getUnRestrictedVideos = () => {
      unRestrictedVideosReduxResource.findAll({
        'page[size]': 1,
        'filter[restricted]': false,
      })
    }
    useEffect(getUnRestrictedVideos, [])

    return {
      recentVideos: recentVideosReduxResource.queryState.lastMeta || null,
      restrictedVideos: restrictedVideosReduxResource.queryState.lastMeta || null,
      unRestrictedVideos: unRestrictedVideosReduxResource.queryState.lastMeta || null,
    }
  }),
)

export default enhance(Videos)
