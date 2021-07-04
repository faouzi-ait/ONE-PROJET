import React, { useEffect, useState } from 'react'
import NavLink from 'javascript/components/nav-link'
import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import pluralize from 'pluralize'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import DashboardCard from 'javascript/components/admin/dashboard/card'
import withTheme from 'javascript/utils/theme/withTheme'

const Assets = (props) => {
  const { theme } = props
  const reports = [
    {
      label: `${props.recentAssets && props.recentAssets['record-count'] === 1 ? `${theme.localisation.asset.upper} has`: `${pluralize(theme.localisation.asset.upper)} have`} been added`,
      value: props.recentAssets ? props.recentAssets['record-count'] : 0,
      loading: !props.recentAssets
    }
  ]

  const stats = [
    {
      label:  pluralize(theme.localisation.asset.upper),
      value: props.assets ? props.assets['record-count'] : 0,
      loading: !props.assets
    },
    {
      label: 'Categories',
      value: props.categories ? props.categories['record-count'] : 0,
      loading: !props.categories
    }
  ]

  return (
    <DashboardCard
      title={`${theme.localisation.asset.upper} Management`}
      icon={`i-admin-asset`}
      width={'36'}
      height={'30'}
      reports={reports}
      stats={stats}
    >
      <NavLink
        to={`/admin/${pluralize(theme.localisation.asset.lower)}/management`}
        className="cms-button"
        ignorePrefixing
      >
        {`View ${pluralize(theme.localisation.asset.upper)}`}
      </NavLink>
    </DashboardCard>
  )
}

const enhance = compose(
  withTheme,
  withHooks(props => {
    const recentAssetsReduxResource = useReduxResource('asset-materials', 'recent-assets_dashboard')
    const assetsReduxResource = useReduxResource('asset-materials', 'assets_dashboard')
    const categoriesReduxResource = useReduxResource('asset-categories', 'asset-categories_dashboard')

    const getRecentAssets = () => {
      recentAssetsReduxResource.findAll({
        'filter[created-since]': props.date,
        'page[size]': 1
      })
    }
    useEffect(getRecentAssets, [])

    const getAssets = () => {
      assetsReduxResource.findAll({
        'page[size]': 1
      })
    }
    useEffect(getAssets, [])

    const getCategories = () => {
      categoriesReduxResource.findAll({
        'page[size]': 1
      })
    }
    useEffect(getCategories, [])

    return {
      recentAssets: recentAssetsReduxResource.queryState.lastMeta || null,
      assets: assetsReduxResource.queryState.lastMeta || null,
      categories: categoriesReduxResource.queryState.lastMeta || null
    }
  })
)

export default enhance(Assets)
