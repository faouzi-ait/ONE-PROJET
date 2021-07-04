import React, { useEffect, useState } from 'react'
import NavLink from 'javascript/components/nav-link'
import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import pluralize from 'pluralize'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import DashboardCard from 'javascript/components/admin/dashboard/card'
import withTheme from 'javascript/utils/theme/withTheme'

const Users = (props) => {

  const reports = [
    {
      label: `${
        props.recentUsers && props.recentUsers['record-count'] === 1
          ? 'User has'
          : 'Users have'
      } been added`,
      value: props.recentUsers ? props.recentUsers['record-count'] : 0,
      loading: !props.recentUsers,
      display: !props.hideUsers,
    },
    {
      label: `${
        props.recentUsers && props.recentUsers['record-count'] === 1
          ? 'User is'
          : 'Users are'
      } awaiting approval`,
      value: props.recentUnapprovedUsers
        ? props.recentUnapprovedUsers['record-count']
        : 0,
      theme: 'warning',
      loading: !props.recentUnapprovedUsers,
      display: !props.hideApprovals,
    },
  ]

  const stats = [
    {
      label: 'Active Users',
      value: props.activeUsers ? props.activeUsers['record-count'] : 0,
      loading: !props.activeUsers,
      display: !props.hideUsers,
    },
    {
      label: 'Pending Approvals',
      value: props.approvals ? props.approvals['record-count'] : 0,
      loading: !props.approvals,
      display: !props.hideApprovals,
    },
    {
      label: 'Companies',
      value: props.companies ? props.companies['record-count'] : 0,
      loading: !props.companies,
      display: !props.hideCompanies,
    },
    {
      label: 'Roles',
      value: props.roles ? props.roles['record-count'] : 0,
      loading: !props.roles,
      display: !props.hideRoles,
    },
  ]

  return (
    <DashboardCard
      title={`User Management`}
      icon={`i-admin-users`}
      width={'40'}
      height={'35'}
      reports={reports}
      stats={stats}
    >
      {(isAdmin(props.user) ||
        hasPermission(
          props.user,
          ['manage_internal_users'] ||
            hasPermission(props.user, ['manage_external_users']),
        )) && (
        <NavLink to={`/admin/users`} className="cms-button">
          {`View Users`}
        </NavLink>
      )}
    </DashboardCard>
  )
}

const enhance = compose(
  withTheme,
  withHooks(props => {
    const recentUsersReduxResource = useReduxResource(
      'users',
      'recent-users_dashboard',
    )
    const recentUnapprovedUsersReduxResource = useReduxResource(
      'approvals',
      'recent-unapproved-users_dashboard',
    )
    const activeUsersReduxResource = useReduxResource(
      'users',
      'active-users_dashboard',
    )
    const approvalsReduxResource = useReduxResource(
      'approvals',
      'approvals_dashboard',
    )
    const companiesReduxResource = useReduxResource(
      'companies',
      'companies_dashboard',
    )
    const rolesReduxResource = useReduxResource('roles', 'roles_dashboard')

    let hideUsers,
      hideApprovals,
      hideCompanies,
      hideRoles = false

    if (
      isAdmin(props.user) ||
      hasPermission(props.user, ['manage_internal_users']) ||
      hasPermission(props.user, ['manage_external_users'])
    ) {
      const getRecentUsers = () => {
        recentUsersReduxResource.findAll({
          'filter[created-since]': props.date,
          'page[size]': 1,
        })
      }
      useEffect(getRecentUsers, [])

      const getActiveUsers = () => {
        activeUsersReduxResource.findAll({
          'filter[active]': true,
          'page[size]': 1,
        })
      }
      useEffect(getActiveUsers, [])
    } else {
      hideUsers = true
    }

    if (
      isAdmin(props.user) ||
      hasPermission(props.user, ['manage_approvals'])
    ) {
      const getRecentUnapprovedUsers = () => {
        recentUnapprovedUsersReduxResource.findAll({
          'filter[created-since]': props.date,
          'filter[status]': 'pending',
          'page[size]': 1,
        })
      }
      useEffect(getRecentUnapprovedUsers, [])

      const getApprovals = () => {
        approvalsReduxResource.findAll({
          'filter[status]': 'pending',
          'page[size]': 1,
        })
      }
      useEffect(getApprovals, [])
    } else {
      hideApprovals = true
    }

    if (
      isAdmin(props.user) ||
      hasPermission(props.user, ['manage_companies'])
    ) {
      const getCompanies = () => {
        companiesReduxResource.findAll({
          'page[size]': 1,
        })
      }
      useEffect(getCompanies, [])
    } else {
      hideCompanies = true
    }

    if (isAdmin(props.user) || hasPermission(props.user, ['manage_roles'])) {
      const getRoles = () => {
        rolesReduxResource.findAll({
          'page[size]': 1,
        })
      }
      useEffect(getRoles, [])
    } else {
      hideRoles = true
    }

    return {
      recentUsers: recentUsersReduxResource.queryState.lastMeta || null,
      recentUnapprovedUsers:
        recentUnapprovedUsersReduxResource.queryState.lastMeta || null,
      activeUsers: activeUsersReduxResource.queryState.lastMeta || null,
      approvals: approvalsReduxResource.queryState.lastMeta || null,
      companies: companiesReduxResource.queryState.lastMeta || null,
      roles: rolesReduxResource.queryState.lastMeta || null,
      hideUsers,
      hideApprovals,
      hideCompanies,
      hideRoles,
    }
  }),
)

export default enhance(Users)
