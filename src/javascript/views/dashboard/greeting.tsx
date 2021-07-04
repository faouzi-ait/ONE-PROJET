import React from 'react';
import moment from 'moment'

import 'stylesheets/core/components/dashboard/greeting'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import compose from 'javascript/utils/compose';
import withTheme from 'javascript/utils/theme/withTheme';

interface Props {
  name: string
  theme: ThemeType
}

const DashboardGreeting: React.FC<Props> = ({
  name,
  theme
}) => {
  const timeOfDay = () => {
    const time = moment()
    if (time.isBetween(moment('11:59:59', 'hh:mm:ss'), moment('17:00:00', 'hh:mm:ss'))) {
      return 'Afternoon'
    } else if (time.isBetween(moment('16:59:59', 'hh:mm:ss'), moment('23:59:59', 'hh:mm:ss'))) {
      return 'Evening'
    }
    return 'Morning'
  }
  const greetingTxt = `Good ${timeOfDay()}, ${name}`
  const welcomeTxt = `Welcome to ${theme.variables.SystemPages.dashboard.upper}`
  return (
      <div className="greeting">
        <div className="container">
          <div className="greeting__title">{ greetingTxt }</div>
          <div className="greeting__sub-title">{welcomeTxt}</div>
        </div>
      </div>
  )
}
const enhance = compose(
  withTheme
)

export default enhance(DashboardGreeting)