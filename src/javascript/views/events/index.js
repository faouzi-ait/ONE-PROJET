import React from 'react'
import { NavLink } from 'react-router-dom'
import Meta from 'react-document-meta'
import moment from 'moment'

import PageLoader from 'javascript/components/page-loader'
import PageHelper from 'javascript/views/page-helper'
import Banner from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'

import Store from 'javascript/stores/events'
import Actions from 'javascript/actions/events'
import DeleteForm from 'javascript/views/events/delete'
import SendInvites from 'javascript/views/events/invites'
import DuplicateEvent from 'javascript/views/events/duplicate'
import SmallScreenMessage from 'javascript/components/small-screen-message'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'

import allClientVariables from './variables'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
class Events extends PageHelper {
  state = {
    resources: [],
    modal: () => { }
  }
  componentWillMount() {
    Store.on('change', this.getResources)
    Store.on('refresh', this.updateStore)
    Store.on('save', this.getResources)
  }
  componentDidMount() {
    this.updateStore()
  }
  componentWillUnmount() {
    Store.removeListener('change', this.getResources)
    Store.removeListener('save', this.getResources)
    Store.removeListener('refresh', this.updateStore)
  }
  updateStore = () => {
    Actions.getResources()
  }
  getResources = () => {
    this.setState({
      resources: Store.getResources()
    }, this.finishedLoading)
    this.unsetModal()
  }
  confirmDeletion = (resource) => () => {
    this.setState({
      modal: () => (
        <Modal closeEvent={this.unsetModal} title="Warning" modifiers={['warning']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} ref="modal">
          <div className="modal__content">
            <DeleteForm resource={resource} closeEvent={this.unsetModal} />
          </div>
        </Modal>
      )
    })
  }
  confirmInvites = (resource) => () => {
    this.setState({
      modal: () => (
        <Modal closeEvent={this.unsetModal} title="Please Confirm" modifiers={['small']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} ref="modal">
          <div className="modal__content">
            <SendInvites resource={resource} closeEvent={this.unsetModal} />
          </div>
        </Modal>
      )
    })
  }
  confirmDuplication = (resource) => () => {
    this.setState({
      modal: () => (
        <Modal closeEvent={this.unsetModal} title="Please Confirm" modifiers={['small']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} ref="modal">
          <div className="modal__content">
            <DuplicateEvent resource={resource} closeEvent={this.unsetModal} />
          </div>
        </Modal>
      )
    })
  }

  render() {
    const { features, localisation, variables } = this.props.theme
    return (
      <PageLoader {...this.state}>
        <Meta
          title={`${localisation.client} :: ${variables.SystemPages.events.upper}`}
          meta={{
            description: 'Events Dashboard'
          }}>
          <main>
            <div className="fade-on-load">
              <LoadPageBannerImage slug={`events`} fallbackBannerImage={this.props.indexVariablesCV.bannerImage}>
                {({ image }) => (
                  <Banner
                    classes={this.props.indexVariablesCV.bannerClasses}
                    title="Events"
                    image={image} />
                )}
              </LoadPageBannerImage>
              <Breadcrumbs classes={['bordered']} paths={[
                { name: variables.SystemPages.account.upper, url: `/${variables.SystemPages.account.path}` },
                { name: 'Events', url: `/${variables.SystemPages.account.path}/${variables.SystemPages.events.path}` }
              ]} />
              <AccountNavigation currentPage={`/${variables.SystemPages.events.path}`} />
              <div className="actions">
                <div className="container">
                  <div className="actions__inner">
                    <NavLink className="button button--filled" to={`/${variables.SystemPages.account.path}/${variables.SystemPages.events.path}/new`}>Create an event</NavLink>
                  </div>
                </div>
              </div>
              <div className={this.props.indexVariablesCV.sectionClasses}>
              <div className="container">
                <div className="panel-section">
                  <div className="panel-section__header">
                    <h2 className="panel-section__title">Manage Events</h2>
                  </div>
                  <div className="panel-section__panel">
                    <table className="table table--small">
                      <thead>
                        <tr>
                          <th>Event Title</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Status</th>
                          <th className="u-align-center">Report</th>
                          <th className="u-align-center">Duplicate</th>
                          <th className="u-align-center">Edit</th>
                          <th className="u-align-center">Delete</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.resources.map(r => (
                          <tr key={r.id}>
                            <td>
                              <NavLink to={{
                                pathname: `/${variables.SystemPages.account.path}/${variables.SystemPages.meeting.path}/`,
                                state: { 'calendar-events': r }
                              }}
                              >{r.title}</NavLink>
                            </td>
                            <td>{moment.utc(r['start-time']).format(features.formats.shortDate)}</td>
                            <td>{moment.utc(r['end-time']).format(features.formats.shortDate)}</td>
                            <td><span className={`tag tag--count ${!r.active && 'tag--disabled'}`}>{r.active ? 'Active' : 'Inactive'}</span></td>
                            <td className="u-align-center">
                              <NavLink to={`/${variables.SystemPages.account.path}/${variables.SystemPages.events.path}/${r.id}/reports`}>
                                <Icon width="20" height="20" id="i-report" />
                              </NavLink>
                            </td>
                            <td className="u-align-center">
                              <button className="button--transparent text-link" onClick={this.confirmDuplication(r)} >
                                <Icon width="20" height="20" id="i-duplicate" classes="icon" />
                              </button>
                            </td>
                            <td className="u-align-center">
                              <NavLink to={`/${variables.SystemPages.account.path}/${variables.SystemPages.events.path}/${r.id}/edit`}>
                                <Icon width="20" height="20" id="i-edit" />
                              </NavLink>
                            </td>
                            <td className="u-align-center">
                              <button className="delete" onClick={this.confirmDeletion(r)}>
                                <Icon id="i-close" classes="delete__icon" />
                              </button>
                            </td>
                            {r.active ? (
                              <td>
                                {r['invites-sent-at'] ? (
                                  <span className="info">Invites Sent</span>
                                ) : (
                                    <button className="button button--filled button--small" onClick={this.confirmInvites(r)}>Send invites</button>
                                  )}
                              </td>
                            ) : (
                                <td>
                                  {r['invites-sent-at'] &&
                                    <span className="info">Invites Sent</span>
                                  }
                                </td>
                              )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              </div>
            </div>
            {this.state.modal()}
            <SmallScreenMessage page="Events" fixedHeight/>
          </main>
        </Meta>
      </PageLoader>
    )
  }
}

const enhance = compose(
  withClientVariables('indexVariablesCV', allClientVariables),
)

export default enhance(Events)