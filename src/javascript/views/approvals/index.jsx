import React from 'react'

import allClientVariables from './variables'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

// Components
import PageHelper from 'javascript/views/page-helper'
import Banner from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import Tabs from 'javascript/components/tabs'
import List from 'javascript/views/approvals/list'
import Meta from 'react-document-meta'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'

const statusSet = ['pending', 'approved', 'rejected']

class ApprovalsIndex extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      status: 'pending'
    }
  }

  updateStatus = (currentTabIndex) => {
    this.setState({
      'status': statusSet[currentTabIndex.value]
    })
  }

  render() {
    const {
      bannerImage,
      bannerClasses,
      sectionClasses
    } = this.props.approvalsCV

    const { localisation, variables } = this.props.theme

    return (
      <Meta
        title={`${localisation.client} :: Approvals`}
        meta={{
          description: 'Approve user registrations'
        }}>
        <main>
          <div className="fade-on-load">
            <LoadPageBannerImage slug={variables.SystemPages.approvals.path} fallbackBannerImage={bannerImage} >
              {({ image }) => (
                <Banner title={variables.SystemPages.approvals.upper}
                  classes={bannerClasses}
                  image={image}
                />
              )}
            </LoadPageBannerImage>
            <Breadcrumbs paths={[
              { name: this.props.theme.variables.SystemPages.account.upper, url: `/${this.props.theme.variables.SystemPages.account.path}` },
              { name: this.props.theme.variables.SystemPages.approvals.upper, url: `/${this.props.theme.variables.SystemPages.account.path}/${this.props.theme.variables.SystemPages.approvals.path}` }
            ]} />

            <AccountNavigation currentPage={`/${this.props.theme.variables.SystemPages.approvals.path}`}/>

            <section className={sectionClasses}>
              <div className="container">
                <Tabs onChange={this.updateStatus}>
                  {statusSet.map((tab, key) => {
                    return <div key={key} title={tab.charAt(0).toUpperCase() + tab.slice(1)}></div>
                  })}
                </Tabs>
                <List status={this.state.status} page={1} user={this.props.user} />
              </div>
            </section>
          </div>
        </main>
      </Meta>
    )
  }
}

const enhance = compose(
  withClientVariables('approvalsCV', allClientVariables)
)

export default enhance(ApprovalsIndex)