import React from 'react'
import Meta from 'react-document-meta'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import ReportingBanner from 'javascript/components/reporting/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import ReportTabs from 'javascript/components/reporting/tabs'


import MostViewedProgrammes from 'javascript/views/reporting/dashboard/reports/most-viewed-programmes'
import TopUsers from 'javascript/views/reporting/dashboard/reports/top-users'
import TopGenres from 'javascript/views/reporting/dashboard/reports/top-genres'
import UserTimeSpentOnProgrammes from 'javascript/views/reporting/dashboard/reports/user-time-spent-on-programmes'
import CategoryDownloads from 'javascript/views/reporting/dashboard/reports/category-downloads'
import SmallScreenMessage from 'javascript/components/small-screen-message'
import compose from 'javascript/utils/compose'
import allClientVariables from 'javascript/views/reporting/variables'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'

class ReportingDashboard extends PageHelper {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.finishedLoading();
  }

  render() {
    const { theme, clientVariables } = this.props
    return (
      <Meta
        title={`${theme.localisation.client} :: Reports`}
        meta={{
          description: "View your reports"
        }}
      >
        <PageLoader {...this.state}>
          <main>
            <ReportingBanner theme={theme} />
            <Breadcrumbs
              paths={[
                { name: `${theme.variables.SystemPages.account.upper}`, url: `/${theme.variables.SystemPages.account.path}` },
                { name: theme.variables.SystemPages.reporting.upper, url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.reporting.path}` }
              ]}
              classes={clientVariables.breadcrumbClasses}
            />
            <AccountNavigation currentPage={`/${theme.variables.SystemPages.reporting.path}`} />
            <div className={clientVariables.sectionClasses}>
              <ReportTabs {...this.props} />
            </div>
            <MostViewedProgrammes bg={clientVariables.blockBgClasses} />
            <TopUsers bg={clientVariables.blockBgClasses} />
            <TopGenres bg={clientVariables.blockBgClasses} />
            <UserTimeSpentOnProgrammes bg={clientVariables.blockBgClasses} />
            <CategoryDownloads bg={clientVariables.blockBgClasses} />
            <SmallScreenMessage />
          </main>
        </PageLoader>
      </Meta>
    );
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('clientVariables', allClientVariables)
)


export default enhance(ReportingDashboard)