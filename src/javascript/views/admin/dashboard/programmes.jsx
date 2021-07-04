import React, { useEffect, useState } from 'react'
import NavLink from 'javascript/components/nav-link'
import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import pluralize from 'pluralize'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import DashboardCard from 'javascript/components/admin/dashboard/card'

const Programmes = (props) => {
  const { theme } = props
  const reports = []
  if (props.recentProgrammes) {
    reports.push({
      label: `${
        props.recentProgrammes && props.recentProgrammes['record-count'] === 1
          ? `${theme.localisation.programme.upper} has`
          : `${pluralize(theme.localisation.programme.upper)} have`
      } been added`,
      value: props.recentProgrammes
        ? props.recentProgrammes['record-count']
        : 0,
      loading: !props.recentProgrammes,
      display: !props.hideProgrammes,
    })
  }

  const stats = [
    {
      label: `Active ${pluralize(theme.localisation.programme.upper)}`,
      value: props.activeProgrammes
        ? props.activeProgrammes['record-count']
        : 0,
      loading: !props.activeProgrammes,
      display: !props.hideProgrammes,
    },
    {
      label: `Inactive ${pluralize(theme.localisation.programme.upper)}`,
      value: props.inactiveProgrammes
        ? props.inactiveProgrammes['record-count']
        : 0,
      loading: !props.inactiveProgrammes,
      display: !props.hideProgrammes,
    },
    {
      label: 'Genres',
      value: props.genres ? props.genres['record-count'] : 0,
      loading: !props.genres,
      display: !props.hideProgrammeData,
    },
    {
      label: 'Languages',
      value: props.languages ? props.languages['record-count'] : 0,
      loading: !props.languages,
      display: !props.hideProgrammeData,
    },
  ]

  return (
    <DashboardCard
      loading={props.loading}
      title={`${theme.localisation.programme.upper} Management`}
      icon={`i-admin-tv`}
      width={'40'}
      height={'35'}
      reports={reports}
      stats={stats}
    >
      {(isAdmin(props.user) ||
        hasPermission(props.user, ['manage_programmes'])) && (
        <NavLink
          to={`/admin/${theme.localisation.programme.path}`}
          className="cms-button"
          ignorePrefixing
        >{`View ${pluralize(theme.localisation.programme.upper)}`}</NavLink>
      )}
    </DashboardCard>
  )
}

const enhance = compose(
  withTheme,
  withHooks(props => {
    const recentProgrammeReduxResource = useReduxResource(
      'programmes',
      'recent-programmes_dashboard',
    )
    const activeProgrammeReduxResource = useReduxResource(
      'programmes',
      'active-programmes_dashboard',
    )
    const inActiveProgrammeReduxResource = useReduxResource(
      'programmes',
      'inactive-programmes_dashboard',
    )
    const genresReduxResource = useReduxResource('genres', 'genres_dashboard')
    const languagesReduxResource = useReduxResource(
      'languages',
      'languages_dashboard',
    )

    let hideProgrammes,
      hideProgrammeData = false

    if (
      isAdmin(props.user) ||
      hasPermission(props.user, ['manage_programmes'])
    ) {
      const getRecentProgrammes = () => {
        recentProgrammeReduxResource.findAll({
          'filter[all]': 1,
          'filter[created-since]': props.date,
          'page[size]': 1,
        })
      }
      useEffect(getRecentProgrammes, [])

      const getActiveProgrammes = () => {
        activeProgrammeReduxResource.findAll({
          'filter[all]': 1,
          'filter[active]': true,
          'page[size]': 1,
        })
      }
      useEffect(getActiveProgrammes, [])

      const getInactiveProgrammes = () => {
        inActiveProgrammeReduxResource.findAll({
          'filter[all]': 1,
          'filter[active]': false,
          'page[size]': 1,
        })
      }
      useEffect(getInactiveProgrammes, [])
    } else {
      hideProgrammes = true
    }

    if (
      isAdmin(props.user) ||
      hasPermission(props.user, ['manage_programme_data_options'])
    ) {
      const getGenres = () => {
        genresReduxResource.findAll({
          'page[size]': 1,
        })
      }
      useEffect(getGenres, [])

      const getLanguages = () => {
        languagesReduxResource.findAll({
          'page[size]': 1,
        })
      }
      useEffect(getLanguages, [])
    } else {
      hideProgrammeData
    }

    if (
      recentProgrammeReduxResource.queryState.succeeded &&
      activeProgrammeReduxResource.queryState.succeeded &&
      inActiveProgrammeReduxResource.queryState.succeeded &&
      inActiveProgrammeReduxResource.queryState.succeeded &&
      languagesReduxResource.queryState.succeeded
    ) {
    }

    return {
      recentProgrammes:
        recentProgrammeReduxResource.queryState.lastMeta || null,
      activeProgrammes:
        activeProgrammeReduxResource.queryState.lastMeta || null,
      inactiveProgrammes:
        inActiveProgrammeReduxResource.queryState.lastMeta || null,
      genres: genresReduxResource.queryState.lastMeta || null,
      languages: languagesReduxResource.queryState.lastMeta || null,
      hideProgrammes,
      hideProgrammeData,
    }
  }),
)

export default enhance(Programmes)
