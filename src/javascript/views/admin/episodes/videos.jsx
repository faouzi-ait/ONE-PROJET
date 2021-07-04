// React
import React from 'react'
import Meta from 'react-document-meta'
import NavLink from 'javascript/components/nav-link'
import PageHelper from 'javascript/views/page-helper'
import pluralize from 'pluralize'
import moment from 'moment'

import compose from 'javascript/utils/compose'

// Store
import ResourceStore from 'javascript/stores/videos'
import EpisodeStore from 'javascript/stores/episodes'

// Actions
import ResourceActions from 'javascript/actions/videos'
import EpisodeActions from 'javascript/actions/episodes'

// Components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import PageHeader from 'javascript/components/admin/layout/page-header'
import PageLoader from 'javascript/components/page-loader'
// HOC
import withVideoPageActions from 'javascript/components/hoc/with-video-page-actions'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import { BrightcoveUploadRefreshAlert } from 'javascript/components/brightcove-upload-refresh-alert'
import { UploadStatusMessage } from 'javascript/components/upload-status-message'
import { ReorderableList } from 'javascript/components/reorderable-list'

class EpisodeVideos extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      resources: false,
      episode: false,
      modal: () => {},
    }
  }

  componentWillMount() {
    ResourceStore.on('save', this.fetchResources)
    ResourceStore.on('change', this.setResources)
    EpisodeStore.on('change', this.setResources)
  }

  componentWillUnmount() {
    ResourceStore.removeListener('save', this.fetchResources)
    ResourceStore.removeListener('change', this.setResources)
    EpisodeStore.removeListener('change', this.setResources)
  }

  componentDidMount() {
    this.fetchResources()
    EpisodeActions.getResource(this.props.match.params.episode, {
      include: 'series,series.programme',
      fields: {
        programmes: 'title,title-with-genre,series',
        series: 'name,programme',
        episodes: 'name,series',
      },
    })
  }

  fetchResources = () => {
    const { theme } = this.props
    const { wistia, brightcove, knox, jwplayer, comcast } = this.props.videoProviders
    const easytrack =
      theme.features.rightsManagement &&
      theme.features.rightsManagement.includes('easytrack')
    const videos = [
      'public-video,poster,parent,name,position,mp4-url,restricted-users,restricted-companies',
      'restricted,downloadable,visibility',
      wistia && 'wistia-id',
      brightcove && 'brightcove-id',
      knox && 'knox-uuid',
      jwplayer && 'jwplayer-id',
      comcast && 'comcast-platform-id',
      'external-id',
      theme.features.videos.brightcoveUploader && 'upload-status,created-at',
      theme.features.videos.promo && 'promo-video-programmes-count',
      theme.features.videos.videoBanners && 'video-banner-programmes-count',
      theme.features.videos.types && 'video-type',
      'languages',
    ]
      .filter(Boolean)
      .join(',')

    ResourceActions.getResources({
      sort: 'position',
      filter: {
        parent_type: 'episode',
        parent_id: this.props.match.params.episode,
        all: true,
      },
      include: [
        'parent,restricted-users,restricted-companies,languages',
        theme.features.videos.types && 'video-type',
      ].filter(Boolean).join(','),
      fields: {
        videos,
        users: 'first-name,last-name',
        companies: 'name',
        languages: 'name'
      },
      page: {
        size: 200,
      },
    })
  }

  setResources = () => {
    this.setState({
      resources: ResourceStore.getResources(),
      episode: EpisodeStore.getResource(),
    })
    if (this.state.resources && this.state.episode) {
      this.finishedLoading()
    }
    this.unsetModal()
  }

  newResource = () => {
    this.props.newVideoResource({
      series: this.state.episode.series,
      episode: this.state.episode,
      onSave: () => {
        this.props.modalState.hideModal()
        this.fetchResources()
      }
    })
  }

  editResource = (resource) => {
    this.props.editVideoResource({
      resource,
      series: this.state.episode.series,
      episode: this.state.episode,
      onSave: () => {
        this.props.modalState.hideModal()
        this.fetchResources()
      }
    })
  }

  renderResources() {
    const { theme } = this.props

    if (this.state.resources?.length > 0) {
      return (
        <div className="container">
          <table className="cms-table">
            <thead>
              <tr>
                <th colSpan="3">Name</th>
              </tr>
            </thead>
            <ReorderableList
              items={this.state.resources}
              onChange={({ item, newPosition }) =>
                ResourceActions.updateResourcePosition({
                  id: item.id,
                  position: newPosition,
                })
              }
              droppableTag="tbody"
              draggableTag="tr"
              renderItem={({ item: resource, index }) => {
                return (
                  <>
                    <td>{resource.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {resource.restricted && (
                          <span class="count count--warning">Restricted</span>
                        )}
                        {resource['public-video'] && (
                          <span class="count count--success">Public</span>
                        )}
                        {theme.features.videos.brightcoveUploader &&
                          resource['upload-status'] && (
                            <UploadStatusMessage
                              uploadStatus={resource['upload-status']}
                              isStale={moment(resource['created-at']).isBefore(moment().subtract(12, 'hours'))}
                            ></UploadStatusMessage>
                          )}
                      </div>
                    </td>
                    <td className="cms-table__actions">
                      <ActionMenu name="Actions">
                        <ActionMenuItem
                          label="Edit"
                          onClick={() => {
                            this.editResource(resource)
                          }}
                        />
                        <ActionMenuItem
                          label="Delete"
                          onClick={() => {
                            this.props.deleteVideoResource(
                              resource,
                              this.getResources,
                            )
                          }}
                        />
                        <ActionMenuItem
                          label="Permissions"
                          onClick={() => {
                            this.props.editVideoPermissions(
                              resource,
                              this.fetchResources,
                            )
                          }}
                          divide
                        />
                        <ActionMenuItem
                          label="Manage Poster"
                          onClick={() => {
                            this.props.editVideoPoster(
                              resource,
                              this.getResources,
                            )
                          }}
                        />
                        {theme.features.videos.oneTimeVideoDownload && (
                          <ActionMenuItem
                            label="Generate one-time download"
                            onClick={() => {
                              this.props.generateOneTimeVideoDownload(resource)
                            }}
                            divide
                          />
                        )}
                      </ActionMenu>
                    </td>
                  </>
                )
              }}
            ></ReorderableList>
          </table>
        </div>
      )
    } else {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>
              There are currently no videos for this episode, try creating some!
            </p>
          </div>
        </div>
      )
    }
  }

  renderBackLink() {
    const { theme } = this.props
    if (this.props.location.search == '?videos') {
      return (
        <NavLink to={`/admin/${theme.localisation.video.path}/`} className="button">
          <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
          Back to {pluralize(theme.localisation.video.upper)}
        </NavLink>
      )
    }
    const BackLink = `/admin/${theme.localisation.programme.path}/${this.props.match.params.programme}/${theme.localisation.series.path}/${this.props.match.params.series}/episodes`
    const BackText = this.state.episode && `Back to ${this.state.episode.series.programme.title} ${this.state.episode.series.name} Episodes` || ''
    return (
      <NavLink to={BackLink} className="button">
        <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
        {BackText}
      </NavLink>
    )
  }

  render() {
    const { theme } = this.props
    const { episode } = this.state
    const pageTitle = episode ? `Manage ${pluralize(theme.localisation.video.upper)} for ${this.state.episode?.series?.programme?.title} ${this.state.episode?.series?.name} ${this.state.episode?.name}` : ''
    const title = episode ? `${theme.localisation.client} :: ${this.state.episode?.series?.programme?.title} / ${this.state.episode?.series?.name} / ${this.state.episode?.name} / Videos` : 'Videos'
    const multiVideoPath =  `/admin/${theme.localisation.programme.path}/${this.props.match.params.programme}` +
                            `/${theme.localisation.series.path}/${this.props.match.params.series}/episodes` +
                            `/${this.props.match.params.episode}/${theme.localisation.video.path}/multiple`

    const hasPendingResources =
      theme.features.videos.brightcoveUploader &&
      (this.state.resources || []).some(v => v['upload-status'] === 'pending')

      const hasRecentPendingResources =
      theme.features.videos.brightcoveUploader &&
      (this.state.resources || []).some(v => (v['upload-status'] === 'pending') && (moment(v['created-at']).isAfter(moment().subtract(12, 'hours'))))

    return (
      <Meta
        title={title}
        meta={{
          description: `Manage ${theme.localisation.video.upper}`
        }}>
        <PageLoader {...this.state}>
          <main>
            <PageHeader title={pageTitle}>
              <div className="page-header__actions">
                <Button className="button" onClick={this.newResource}>
                  <Icon
                    width="14"
                    height="14"
                    id="i-admin-add"
                    classes="button__icon"
                  />
                  New Video
                </Button>
                {theme.features.videos.multipleUpload && (
                  <NavLink
                    className="button"
                    to={{
                      pathname: multiVideoPath,
                      state: this.props.location.state,
                    }}
                    disabled={hasRecentPendingResources}
                  >
                    <Icon
                      width="14"
                      height="14"
                      id="i-admin-add"
                      classes="button__icon"
                    />
                    Upload Multiple {pluralize(theme.localisation.video.upper)}
                  </NavLink>
                )}
              </div>
            </PageHeader>
            <div className="container">
              <div className="page-actions">
                {this.renderBackLink()}
              </div>
              {hasPendingResources && (
                <BrightcoveUploadRefreshAlert
                  onRefresh={() => {
                    this.setState({
                      loaded: false,
                    })
                    this.fetchResources()
                  }}
                />
              )}
            </div>
            {this.renderResources()}
            {this.state.modal()}
          </main>
        </PageLoader>
      </Meta>
    )
  }
}

const enhance = compose(
  withVideoProviders,
  withVideoPageActions
)

export default enhance(EpisodeVideos)
