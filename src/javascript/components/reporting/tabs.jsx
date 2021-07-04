
import React from 'react'
import Tabs from "javascript/components/tabs";
import pluralize from 'pluralize'
import ClientProps from 'javascript/utils/client-switch/components/client-props'

export function navigate(value, props) {
  const { localisation, variables: { SystemPages} } = props.theme
  const reportingPath = `/${SystemPages.account.path}/${SystemPages.reporting.path}`
  if (value === 0) {
    props.history.push(reportingPath)
  } else if (value === 1) {
    props.history.push(`${reportingPath}/users`)
  } else if (value === 2) {
    props.history.push(`${reportingPath}/${localisation.programme.path}`)
  } else if (value === 3) {
    props.history.push(`${reportingPath}/producers`)
  }
}

export const ReportTabs = (props) => {
  const { theme } = props
  return (
    <ClientProps
      clientProps={{
        dashboardTitle: {
          'default': 'Dashboard',
          'ae': 'Aggregate'
        },
        dashboardIcon: {
          'default': null,
          'ae': {
            id: "i-dashboard",
          }
        },
        usersTitle: {
          'default': 'Users',
          'ae': 'By User'
        },
        usersIcon: {
          'default': null,
          'ae': {
            id: "i-user",
            width: 24,
            height: 24
          }
        },
        programmesTitle: {
          'default': pluralize(theme.localisation.programme.upper),
          'ae': `By ${theme.localisation.programme.upper}`
        },
        programmesIcon: {
          'default': null,
          'ae': {
            id: "i-square-play",
          }
        },
        producersTitle: {
          'default': pluralize(theme.localisation.productionCompany.upper),
          'ae': `By ${theme.localisation.productionCompany.upper}`
        },
        producersIcon: {
          'default': null,
          'ae': {
            id: "i-production-company",
          }
        },
      }}
      renderProp={(clientProps) => (
        <Tabs onChange={(tab) => navigate(tab.value, props)} active={props.active}>
            <div title={clientProps.dashboardTitle} icon={clientProps.dashboardIcon} />
            <div title={clientProps.usersTitle} icon={clientProps.usersIcon} />
            <div title={clientProps.programmesTitle} icon={clientProps.programmesIcon} />
            {theme.features.reporting.producer ?
              <div title={clientProps.producersTitle} icon={clientProps.producersIcon} />
            : undefined }
        </Tabs>
      )}
    />
  )
}

export default ReportTabs

