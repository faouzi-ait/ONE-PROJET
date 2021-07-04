import React, { useMemo } from 'react'

import { RouteComponentProps, withRouter } from 'react-router'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import useTheme from 'javascript/utils/theme/useTheme'


interface Props extends RouteComponentProps {}

const ExcludePageHeaderNavigation: React.FC<Props> = ({
  children,
  location,
}) => {
  const path = location.pathname
  const theme = useTheme()

  const pathShouldRenderHeading = useMemo(() => {
    return urlMappings(theme).reduce<boolean>((pathHasHeading, currRegex) => {
      if (!pathHasHeading) return pathHasHeading
      return !currRegex.test(path)
    }, true)
  }, [path, theme])

  if (pathShouldRenderHeading) {
    return (
      <>
        {children}
      </>
    )
  }
  return null
}

export default withRouter(ExcludePageHeaderNavigation)

const urlMappings: (theme: ThemeType) => RegExp[] = ({ variables: { SystemPages } }) => ([
  new RegExp(`/${SystemPages.account.path}/${SystemPages.meeting.path}/virtual/\\d+$`),
])