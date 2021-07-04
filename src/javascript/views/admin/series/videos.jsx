// React
import React from 'react'
import PageHelper from 'javascript/views/page-helper'
import pluralize from 'pluralize'
import moment from 'moment'

import compose from 'javascript/utils/compose'

// Store
import ResourceStore from 'javascript/stores/videos'
import SeriesStore from 'javascript/stores/series'

// Actions
import VideoActions from 'javascript/actions/videos'
import SeriesActions from 'javascript/actions/series'

// Components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'
import PageLoader from 'javascript/components/page-loader'
import { BrightcoveUploadRefreshAlert } from 'javascript/components/brightcove-upload-refresh-alert'
import { UploadStatusMessage } from 'javascript/components/upload-status-message'

// Hoc
import withVideoPageActions from 'javascript/components/hoc/with-video-page-actions'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import { ReorderableList } from 'javascript/components/reorderable-list'

class SeriesVideos extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      resources: false,
      series: false,
      modal: () => {},
    }
  }

  componentWillMount() {
    ResourceStore.on('save', this.fetchResources)
    ResourceStore.on('change', this.getResources)
    SeriesStore.on('change', this.getSeries)
  }

  componentWillUnmount() {
    ResourceStore.removeListener('save', this.fetchResources)
    ResourceStore.removeListener('change', this.getResources)
    SeriesStore.removeListener('change', this.getSeries)
  }

  componentDidMount() {
    this.fetchResources()
    SeriesActions.getResource(this.props.match.params.series, {
      include: 'programme,programme.series,episodes',
      fields: {
        programmes: 'title,title-with-genre,series',
        series: 'programme,name,episodes',
        episodes: 'name',
      },
    })
  }

  fetchResources = () => {
    const { theme } = this.props
    const { wistia, brightcove, knox, jwplayer, comcast } = this.props.videoProviders
    const easytrack = theme.features.rightsManagement.includes('easytrack')
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

    VideoActions.getResources({
      sort: 'position',
      filter: {
        parent_type: 'series',
        parent_id: this.props.match.params.series,
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
        languages: 'name',
      },
      page: {
        size: 200,
      },
    })
  }

  getResources = () => {
    this.setState(
      {
        resources: ResourceStore.getResources(),
      },
      this.isLoaded,
    )
    this.unsetModal()
  }

  getSeries = () => {
    this.setState(
      {
        series: SeriesStore.getResource(),
      },
      this.isLoaded,
    )
    this.unsetModal()
  }

  isLoaded = () => {
    if (this.state.resources && this.state.series) {
      this.finishedLoading()
    }
  }
  newResource = () => {
    this.props.newVideoResource({
      programme: this.state.series.programme,
      series: this.state.series,
      onSave: () => {
        this.props.modalState.hideModal()
        this.fetchResources()
      },
    })
  }

  editResource = resource => {
    this.props.editVideoResource({
      resource,
      programme: this.state.series.programme,
      series: this.state.series,
      onSave: () => {
        this.props.modalState.hideModal()
        this.fetchResources()
      },
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
                VideoActions.updateResourcePosition({
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
                          <span className="count count--warning">Restricted</span>
                        )}
                        {resource['public-video'] && (
                          <span className="count count--success">Public</span>
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
              There are currently no videos for this{' '}
              {theme.localisation.series.lower}, try creating some!
            </p>
          </div>
        </div>
      )
    }
  }

  renderBackLink() {
    const { theme } = this.props
    if (this.props.location.search === '?videos') {
      return (
        <NavLink
          to={`/admin/${theme.localisation.video.path}/`}
          className="button"
        >
          <Icon
            width="8"
            height="13"
            id="i-admin-back"
            classes="button__icon"
          />
          Back to {pluralize(theme.localisation.video.upper)}
        </NavLink>
      )
    } else if (this.props.location.state?.backUrl) {
      return (
        <NavLink
          to={this.props.location.state.backUrl + this.props.location.search}
          className="button"
        >
          <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
          {this.state.series &&
            `Back to ${pluralize(theme.localisation.series.upper)}`}
        </NavLink>
      )
    }
    return (
      <NavLink
        to={`/admin/${theme.localisation.programme.path}/${this.props.match.params.programme}/${theme.localisation.series.path}`}
        className="button"
      >
        <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
        {this.state.series &&
          `Back to ${this.state.series.programme.title} ${pluralize(
            theme.localisation.series.upper,
          )}`}
      </NavLink>
    )
  }

  render() {
    const { theme } = this.props
    const { series } = this.state
    const pageTitle = series
      ? `Manage ${pluralize(theme.localisation.video.upper)} for ${
          this.state.series.programme.title
        } ${this.state.series.name}`
      : ''

    const hasPendingResources =
      theme.features.videos.brightcoveUploader &&
      (this.state.resources || []).some(v => v['upload-status'] === 'pending')

      const hasRecentPendingResources =
      theme.features.videos.brightcoveUploader &&
      (this.state.resources || []).some(v => (v['upload-status'] === 'pending') && (moment(v['created-at']).isAfter(moment().subtract(12, 'hours'))))

    return (
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
                  to={{
                    pathname: `/admin/${theme.localisation.programme.path}/${this.props.match.params.programme}/${theme.localisation.series.path}/${this.props.match.params.series}/${theme.localisation.video.path}/multiple`,
                    state: this.props.location.state,
                  }}
                  className="button"
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
            <div className="page-actions">{this.renderBackLink()}</div>
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
    )
  }
}

const enhance = compose(withVideoProviders, withVideoPageActions)

export default enhance(SeriesVideos)
