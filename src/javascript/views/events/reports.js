import React from 'react'
import Meta from 'react-document-meta'

import PageLoader from 'javascript/components/page-loader'
import PageHelper from 'javascript/views/page-helper'
import Banner from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import Card from 'javascript/components/card'

import EventStore from 'javascript/stores/events'
import EventActions from 'javascript/actions/events'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'

import allClientVariables from './variables'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

class EventReports extends PageHelper {

  constructor(props) {
    super(props)
    this.state = { event: null }
  }

  componentWillMount() {
    EventStore.on('dataChange', this.setEvent)
    EventActions.getDataResource(this.props.match.params.id, {
      fields: {
        'calendar-events': 'title,start-time,end-time'
      }
    })
  }

  componentWillUnmount() {
    EventStore.removeListener('dataChange', this.setEvent)
  }

  setEvent = () => {
    this.setState({
      event: EventStore.getDataResource(this.props.match.params.id)
    }, this.finishedLoading())
  }

  generateReport = type => () => {
    const { variables } = this.props.theme
    window.open(`/${variables.SystemPages.account.path}/${variables.SystemPages.events.path}/${this.props.match.params.id}/reports/${type}`)
  }

  render() {
    const {theme} = this.props
    const { event } = this.state
    if (!event) {
      return null
    }
    return (
      <PageLoader {...this.state}>
        <Meta
          title={`${theme.localisation.client} :: Events`}
          meta={{
            description: `${event.title} Reports`
          }}>
          <main>
            <div className="fade-on-load">
              <LoadPageBannerImage slug={`events`} fallbackBannerImage={this.props.indexVariablesCV.bannerImage}>
                {({ image }) => (
                  <Banner classes={['intro']} title={`${event.title} Reports`} image={image} />
                )}
              </LoadPageBannerImage>
              <Breadcrumbs classes={['bordered']} paths={[
                { name: theme.variables.SystemPages.account.upper, url: `/${theme.variables.SystemPages.account.path}` },
                { name: 'Events', url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.events.path}` },
                { name: `${event.title} Reports` }
              ]} />
              <AccountNavigation currentPage={`/${theme.variables.SystemPages.events.path}`} />
              <section className="section section--shade">
                <div className="container">
                  <div className="grid grid--four">
                    <Card title="Schedule" onClick={this.generateReport('schedule')} style={{ cursor: 'pointer' }} />
                    <Card title="Resource Usage" onClick={this.generateReport('resource-usage')} style={{ cursor: 'pointer' }} />
                    <Card title="Event Overview" onClick={this.generateReport('event-overview')} style={{ cursor: 'pointer' }} />
                    <Card title="Event Notes" onClick={this.generateReport('event-notes')} style={{ cursor: 'pointer' }} />
                  </div>
                </div>
              </section>
            </div>
          </main>
        </Meta>
      </PageLoader>
    )
  }
}

const enhance = compose(
  withClientVariables('indexVariablesCV', allClientVariables),
)

export default enhance(EventReports)