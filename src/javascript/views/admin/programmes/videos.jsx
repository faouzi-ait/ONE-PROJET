// React
import React, { useEffect, useState } from 'react'
import PageHelper from 'javascript/views/page-helper'
import pluralize from 'pluralize'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'

// Store
import ResourceStore from 'javascript/stores/videos'
import ProgrammeStore from 'javascript/stores/programmes'

// Actions
import ResourceActions from 'javascript/actions/videos'
import ProgrammeActions from 'javascript/actions/programmes'

// Components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'
import PageLoader from 'javascript/components/page-loader'

import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import withVideoPageActions from 'javascript/components/hoc/with-video-page-actions'
import { UploadStatusMessage } from 'javascript/components/upload-status-message'
import { BrightcoveUploadRefreshAlert } from 'javascript/components/brightcove-upload-refresh-alert'
import { ReorderableList } from 'javascript/components/reorderable-list'
import { findAllByModel } from 'javascript/utils/apiMethods'

class ProgrammeVideos extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      resources: false,
      programme: false,
      modal: () => {},
    }
  }

  componentWillMount() {
    ResourceStore.on('save', this.getResources)
    ResourceStore.on('change', this.setResources)
    ProgrammeStore.on('change', this.setProgramme)
  }

  componentWillUnmount() {
    ResourceStore.removeListener('save', this.getResources)
    ResourceStore.removeListener('change', this.setResources)
    ProgrammeStore.removeListener('change', this.setProgramme)
  }

  componentDidMount() {
    this.getResources()
    ProgrammeActions.getResource(this.props.match.params.programme, {
      include: 'series',
      fields: {
        programmes: 'title,title-with-genre,series',
        series: 'name',
      },
    })
  }

  getResources = () => {
    const { theme } = this.props
    const { wistia, brightcove, knox, jwplayer, comcast } = this.props.videoProviders
    const easytrack = theme.features.rightsManagement.includes('easytrack')
    const videos = [
      'public-video,poster,parent,parent-type,parent-id,name,position,mp4-url,restricted',
      'restricted-users,restricted-companies,downloadable,visibility',
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
        'programme-id': this.props.match.params.programme,
        'parent-type': 'programme',
        all: true
      },
      include: [
        'parent,restricted-users,restricted-companies,languages',
        theme.features.videos.types && 'video-type',
      ].filter(Boolean).join(','),
      fields: {
        videos,
        languages: 'name',
        users: 'first-name,last-name',
        companies: 'name',
      },
      page: {
        size: 200,
      },
    })
  }

  setResources = () => {
    const resources = ResourceStore.getResources()
    this.setState({
      resources
    }, this.isLoaded)
    this.unsetModal()
  }

  setProgramme = () => {
    this.setState({
      programme: ProgrammeStore.getResource(),
    }, this.isLoaded)
    this.unsetModal()
  }

  isLoaded = () => {
    if (this.state.resources && this.state.programme) {
      this.finishedLoading()
    }
  }

  newResource = () => {
    this.props.newVideoResource({
      programme: this.state.programme,
      onSave: () => {
        this.props.modalState.hideModal()
        this.getResources()
      }
    })
  }

  editResource = resource => {
    this.props.editVideoResource({
      resource,
      programme: this.state.programme,
      onSave: () => {
        this.props.modalState.hideModal()
        this.getResources()
      }
    })
  }

  renderResources() {
    const { theme } = this.props

    return (
      <div className="container">
        <h3>
          {theme.localisation.programme.upper}{' '}
          {pluralize(theme.localisation.video.lower)}
        </h3>
        {this.state.resources?.length > 0 ? (
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
                              this.getResources,
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
        ) : (
          <div className="panel u-align-center">
            <p>
              {theme.localisation.programme.upper} level (0{' '}
              {pluralize(theme.localisation.video.lower)})
            </p>
          </div>
        )}
      </div>
    )
  }

  renderAdditionalResources() {
    const { theme, seriesWithVideos, episodesWithVideos } = this.props
    const { programme } = this.state

    const seriesToRender = (programme.series || []).reduce((acc, series) => {
      const update = [...acc]
      if (seriesWithVideos[series.id]) {
        update.push(seriesWithVideos[series.id])
      } else if (episodesWithVideos[series.id]) {
        update.push(series)
      }
      return update
    }, [])
    const resources = seriesToRender.map((series) => {
      const videoCount = series['videos-count']
      const episodesForThisSeries = episodesWithVideos[series.id] || []
      return (
        <>
          <tr
            key={series.id}
            className={'cms-table__row'}
          >
            <td>{series.name} {videoCount > 0 && `(${videoCount} ${videoCount === 1 ? theme.localisation.video.lower : pluralize(theme.localisation.video.lower)})`}</td>
            <td className="cms-table__actions">
              {!!series['videos-count'] && videoCount > 0 &&
                <NavLink
                  to={`/admin/${theme.localisation.programme.path}/${programme.id}/${theme.localisation.series.path}/${series.id}/${theme.localisation.video.path}`}
                  className="button button--small"
                >
                  {`View ${pluralize(theme.localisation.video.upper)}`}
                </NavLink>
              }
            </td>
          </tr>

          {episodesForThisSeries.map((episode) => {
            const epVideoCount = episode['videos-count']
            return (
              <tr
                key={episode.id}
                className={'cms-table__row sub'}
              >
                <td>{episode.name} {epVideoCount > 0 && `(${epVideoCount} ${epVideoCount === 1 ? theme.localisation.video.lower : pluralize(theme.localisation.video.lower)})`}</td>
                <td className="cms-table__actions">

                  <NavLink
                    to={`/admin/${theme.localisation.programme.path}/${programme.id}/${theme.localisation.series.path}/${series.id}/${pluralize(theme.localisation.episodes.lower)}/${episode.id}/${theme.localisation.video.path}`}
                    className="button button--small"
                  >
                    {`View ${pluralize(theme.localisation.video.upper)}`}
                  </NavLink>
                </td>
              </tr>
            )
          })}
        </>
      )
    })

    if (resources.length > 0) {
      return (
        <div className="container" style={{marginTop: '40px'}}>
          <h3>Other {pluralize(theme.localisation.video.lower)} available for this {theme.localisation.programme.lower}</h3>
          <table className="cms-table">
            <tbody>{resources}</tbody>
          </table>
        </div>
      )
    }
  }

  renderBackLink() {
    const { theme } = this.props
    if (this.props.location.search == '?videos') {
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
    } else {
      return (
        <NavLink
          to={`/admin/${theme.localisation.programme.path}/`}
          className="button"
        >
          <Icon
            width="8"
            height="13"
            id="i-admin-back"
            classes="button__icon"
          />
          Back to {pluralize(theme.localisation.programme.upper)}
        </NavLink>
      )
    }
  }

  render() {
    const { theme } = this.props

    const hasPendingResources =
      theme.features.videos.brightcoveUploader &&
      (this.state.resources || []).some(v => v['upload-status'] === 'pending')

    const hasRecentPendingResources =
      theme.features.videos.brightcoveUploader &&
      (this.state.resources || []).some(v => (v['upload-status'] === 'pending') && (moment(v['created-at']).isAfter(moment().subtract(12, 'hours'))))
      
    return (
      <PageLoader {...this.state}>
        <main>
          <PageHeader title={`Upload ${pluralize(theme.localisation.video.upper)} for ${this.state.programme.title}`}>
            <div className="page-header__actions">
              <Button className="button" onClick={this.newResource}>
                <Icon
                  width="14"
                  height="14"
                  id="i-admin-add"
                  classes="button__icon"
                />
                New {pluralize.singular(theme.localisation.video.upper)}
              </Button>
              {theme.features.videos.multipleUpload && (
                <NavLink
                  to={{
                    pathname: `/admin/${
                      theme.localisation.programme.path
                    }/${this.props.match.params.programme}/${
                      theme.localisation.video.path
                    }/multiple`,
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
                  this.getResources()
                }}
              />
            )}
          </div>
          {this.renderResources()}
          {this.renderAdditionalResources()}
          {this.state.modal()}
        </main>
      </PageLoader>
    )
  }
}

const enhance = compose(
  withVideoProviders,
  withVideoPageActions,
  withHooks((props) => {
    const programmeId = props.match.params.programme
    const [seriesWithVideos, setSeriesWithVideos] = useState({})
    const [episodesWithVideos, setEpisodesWithVideos] = useState({})

    useEffect(() => {
      if (programmeId) {
        findAllByModel('series', {
          fields: ['name', 'videos-count'],
          filter: {
            'programme-id': programmeId,
            'with-videos': true
          }
        }).then((response) => {
          setSeriesWithVideos(response.reduce((acc, series) => ({
            ...acc,
            [series.id]: series
          }), {}))
        })
        findAllByModel('episodes', {
          fields: ['name', 'videos-count', 'series-id'],
          filter: {
            'programme-id': programmeId,
            'with-videos': true
          }
        }).then((response) => {
          const episodesBySeriesId = response.reduce((acc, ep) => {
            const update = {...acc}
            const seriesId = ep['series-id']
            if (!update[seriesId]) update[seriesId] = []
            update[seriesId].push(ep)
            return update
          }, {})
          setEpisodesWithVideos(episodesBySeriesId)
        })
      }
    }, [programmeId])

    return {
      seriesWithVideos,
      episodesWithVideos
    }
  })
)

export default enhance(ProgrammeVideos)
