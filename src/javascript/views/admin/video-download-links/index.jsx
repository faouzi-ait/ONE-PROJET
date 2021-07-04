import React from 'react'
import moment from 'moment'

import Actions from 'javascript/actions/video-downloads'
import Store from 'javascript/stores/video-downloads'

import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import Button from 'javascript/components/button'
import Modal from 'javascript/components/modal'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import PageHeader from 'javascript/components/admin/layout/page-header'

export default class VideoDownloadLinksIndex extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      resources: [],
      modal: () => {}
    }
  }

  componentWillMount() {
    Store.on('change', this.getResources)

    const date = moment().subtract(0.5, 'years')

    Actions.getResources({
      include: 'video,video.parent',
      fields: {
        'video-download-links': 'video,downloaded-at,uid',
        videos: 'name,parent,programme-name',
        programmes:'title',
        series:'programme-name,name',
        episodes:'programme-name,name,series-name'
      },
      sort: '-downloaded-at',
      'filter[created-since]': moment(date).format(this.props.theme.features.formats.shortDate)
    })
  }

  componentWillUnMount() {
    Store.removeListener('change', this.getResources)
  }

  getResources = () => {
    this.setState({
      resources: Store.getResources()
    })
    this.finishedLoading()
    this.unsetModal()
  }

  confirmDisable = (resource) => {
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={ this.unsetModal }
            title="Warning" modifiers={['warning']}
            titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
            <div className="cms-modal__content">
              <div className="cms-form__control">
                <p>Are you sure you wish to disable the download link for <strong>{ resource.video.name }</strong>?</p>
              </div>
              <div class="cms-form__control cms-form__control--actions">
                <Button type="button" className="button button--reversed" onClick={ this.unsetModal }>Cancel</Button>
                <Button type="button" className="button button--filled button--reversed" onClick={() => { this.disableResource(resource) }}>Disable</Button>
              </div>
            </div>
          </Modal>
        )
      }
    })
  }

  disableResource = (resource) => {
    Actions.updateResource({
      id: resource.id,
      'downloaded-at': new Date()
    })
  }

  render() {
    return (
      <PageLoader {...this.state}>
        <main>
          <PageHeader title={`Manage ${this.props.theme.localisation.video.upper} Download Links`}/>
          <div className="container">
            { this.state.resources.length > 0 ? (
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>{this.props.theme.localisation.video.upper}</th>
                    <th>URL</th>
                    <th colSpan="2">Expired</th>
                  </tr>
                </thead>
                <tbody>
                  { this.state.resources.map(resource => {
                    const url = `${window.location.origin}/${this.props.theme.localisation.video.path}/download/${resource.uid}`
                    const parent = resource.video.parent
                    return (
                      <tr className="width-action" key={ resource.id }>
                        <td className="cms-table__overflow-cell">
                          <small style={{lineHeight: 1.4, display: 'block', marginBottom: 5}}>
                            <strong>{resource.video['programme-name'] || parent && parent.title}</strong><br/>
                              {parent && parent.type === 'episodes' ? (
                                <span>
                                  {parent['series-name']} | <i>{parent.name}</i>
                                </span>
                              ):(
                                <span>{parent && parent.name || 'Programme Level'}</span>
                              )}
                            </small>
                          { resource.video.name }
                        </td>
                        <td style={{maxWidth: '320px'}}><a href={url} target="_blank" className="active wrap">{url}</a></td>
                        <td>
                          { resource['downloaded-at'] ? (
                            <span className="count count--warning">{ moment(resource['downloaded-at']).format('DD/MM/YYYY') }</span>
                          ):(
                            <span className="count count--success">Active</span>
                          )}
                        </td>
                        <td className="cms-table__actions">
                          { !resource['downloaded-at'] &&
                            <Button className="button button--small button--filled button--warning" onClick={() => { this.confirmDisable(resource) }}>Disable Link</Button>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ):(
              <div className="panel u-align-center">
                <p>There are currently no {this.props.theme.localisation.video.lower} download links</p>
              </div>
            )}
          </div>
          { this.state.modal() }
        </main>
      </PageLoader>
    )
  }
}
