import React from 'react'

// Components
import PageHeader from 'javascript/components/admin/layout/page-header'
import PageHelper from 'javascript/views/page-helper'
import Tabs from 'javascript/components/tabs'
import List from 'javascript/views/admin/approvals/list'
import Meta from 'react-document-meta'

const statusSet = ['pending', 'approved', 'rejected']

export default class ApprovalsIndex extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      status: 'pending'
    }
  }

  updateStatus = (currentTabIndex) => {
    this.setState({
      'status' : statusSet[currentTabIndex.value]
    })
  }

  render() {
    return (
    <Meta
        title={`${this.props.theme.localisation.client} :: Approvals`}
        meta={{
          description: 'Approve user registrations'
        }}>
      <main>
        <div className="fade-on-load">
          <PageHeader title="Approvals" />
          <div className="container">
            <Tabs onChange={ this.updateStatus }>
              { statusSet.map((tab, key) => {
                return <div key={key} title={tab.charAt(0).toUpperCase() + tab.slice(1)}></div>
              }) }
            </Tabs>
            <List status={ this.state.status } page={ 1 } user={this.props.user} />
          </div>
        </div>
      </main>
      </Meta>
    )
  }
}