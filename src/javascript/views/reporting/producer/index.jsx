import React, { useState } from 'react'
import queryString from 'query-string'
import Meta from 'react-document-meta'
import pluralize from 'pluralize'

import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import ReportingBanner from "javascript/components/reporting/banner"
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import ProducerProgrammeViews from 'javascript/views/reporting/producer/reports/programme-page-views'
import ProductionCompaniesSearch from 'javascript/containers/search/production-companies'
import RecipientsOfScreeners from 'javascript/views/reporting/producer/reports/recipients-of-screeners'
import ReportTabs from "javascript/components/reporting/tabs"
import ScreenersSent from 'javascript/views/reporting/producer/reports/screeners-sent'
import SmallScreenMessage from 'javascript/components/small-screen-message'
import withPageHelper from 'javascript/components/hoc/with-page-helper'
import compose from 'javascript/utils/compose'
import allClientVariables from 'javascript/views/reporting/variables'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'

const ProducerReports = (props) => {
  const [selectedProducer, setSelectedProducer] = useState(null)
  const {theme, clientVariables} = props
  const reportingPath = `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.reporting.path}`
  return (
    <Meta
      title={`${theme.localisation.client} :: Reports`}
      meta={{
        description: 'View your reports'
      }}>
      <main>
          <ReportingBanner theme={theme} />
          <Breadcrumbs
            paths={[
              { name: `${theme.variables.SystemPages.account.upper}`, url: `/${theme.variables.SystemPages.account.path}` },
              { name: theme.variables.SystemPages.reporting.upper, url: reportingPath },
              { name: pluralize(theme.localisation.productionCompany.upper),url: `${reportingPath}/producers`}
            ]}
            classes={clientVariables.breadcrumbClasses} />
          <AccountNavigation currentPage={`/${theme.variables.SystemPages.reporting.path}`} />
          <section className={clientVariables.sectionClasses}>
            <ReportTabs {...props} active={3} />
            <div style={{'minHeight': selectedProducer ? '0' : '250px'}}>
              <ProductionCompaniesSearch
                onLoadStatusChange={props.pageIsLoading}
                onProducerSelected={setSelectedProducer}
                theme={theme}
              />
            </div>
          </section>
          { selectedProducer &&
            <div>
              <ScreenersSent producer={ selectedProducer } bg={clientVariables.blockBgClasses} />
              <RecipientsOfScreeners producer={ selectedProducer } bg={clientVariables.blockBgClasses} />
              <ProducerProgrammeViews producer={ selectedProducer } selectProgramme={(programme)=>{
                props.history.push(`${reportingPath}/${theme.localisation.programme.path}?p=${programme['programmeId']}`)
              }} bg={clientVariables.blockBgClasses} />
            </div>
          }
      </main>
      <SmallScreenMessage />
    </Meta>
  )
}

const enhance = compose(
  withTheme,
  withClientVariables('clientVariables', allClientVariables)
)


export default enhance(ProducerReports)