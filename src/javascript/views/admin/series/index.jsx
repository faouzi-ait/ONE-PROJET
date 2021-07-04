import React, { useEffect } from 'react'
import pluralize from 'pluralize'
import Meta from 'react-document-meta'

import Store from 'javascript/stores/series'
import Actions from 'javascript/actions/series'
import ProgrammeStore from 'javascript/stores/programmes'
import ProgrammeActions from 'javascript/actions/programmes'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import withSeriesPageActions from 'javascript/components/hoc/with-series-page-actions'

import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import { ReorderableList } from 'javascript/components/reorderable-list'
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import IndexHelper from 'javascript/views/admin/index-helper'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'
import PageLoader from 'javascript/components/page-loader'

class SeriesIndex extends IndexHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = props.theme.localisation.series.upper
    this.state.resources = false
    this.state.parent = false
  }

  componentWillMount() {
    this.store.on('change', this.getResources)
    ProgrammeStore.on('change', this.getParent)
  }

  componentWillUnmount() {
    this.store.removeListener('change', this.getResources)
    ProgrammeStore.removeListener('change', this.getParent)
  }

  componentDidMount() {
    this.updateResources()
    ProgrammeActions.getResource(this.props.match.params.programme, { fields: { programmes: 'title' } })
  }

  getResources = () => {
    this.setState({
      resources: this.store.getResources(),
    }, this.isLoaded)
    this.props.modalState.hideModal()
  }

  getParent = () => {
    this.setState({
      parent: ProgrammeStore.getResource()
    }, this.isLoaded)
    this.props.modalState.hideModal()
  }

  isLoaded = () => {
    if (this.state.resources && this.state.parent) {
      this.finishedLoading()
    }
  }

  updateResources = () => {
    const { theme } = this.props
    this.actions.getResources(Object.assign({
      fields: {
        series: 'name,active,restricted,position,episodes-count,videos-count,programme-id,programme-name'
      },
      filter: {
        programme_id: this.props.match.params.programme,
        all: true
      },
      page: {
        size: 200
      }
    }, this.state.query))
  }

  renderResources = () => {
    const { theme: { features, localisation } } = this.props
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
              this.actions.updateResourcePosition({
                id: item.id,
                position: newPosition
              })
              }
              droppableTag="tbody"
              draggableTag="tr"
              renderItem={({ item: resource, index }) => {
                const episodesLink = `/admin/${localisation.programme.path}/${this.props.match.params.programme}/${localisation.series.path}/${resource.id}/episodes`
                const imagesLink = `/admin/${localisation.programme.path}/${this.props.match.params.programme}/${localisation.series.path}/${resource.id}/images`
                const videoLink = `/admin/${localisation.programme.path}/${this.props.match.params.programme}/${localisation.series.path}/${resource.id}/${localisation.video.path}`
                const productionCompanyLink = `/admin/${localisation.programme.path}/${this.props.match.params.programme}/${localisation.series.path}/${resource.id}/${localisation.productionCompany.path}`
                const broadcastersLink = `/admin/${localisation.programme.path}/${this.props.match.params.programme}/${localisation.series.path}/${resource.id}/${localisation.broadcaster.path}`
                return (
                  <>
                    <td>{ resource.name}</td>
                    <td>
                      {resource.active ? (
                        <span class="count count--success">Active</span>
                      ) : (
                          <span class="count count--disabled">Inactive</span>
                        )}
                      {resource.restricted &&
                        <span class="count count--warning">Restricted</span>
                      }
                    </td>
                    <td className="cms-table__actions">
                      <ActionMenu name="Actions">
                        <ActionMenuItem label="Manage Episodes" link={episodesLink} />
                        {features.programmeOverview.seriesImages && <ActionMenuItem label={`Manage ${localisation.series.upper} Images`} link={imagesLink} />}
                        <ActionMenuItem label={`Manage ${localisation.series.upper} Videos`} link={videoLink} />
                        <ActionMenuItem label={`Manage ${pluralize(localisation.productionCompany.upper)}`} link={productionCompanyLink} />
                        {features.programmeOverview.broadcasters.series &&
                          <ActionMenuItem label={`Manage ${pluralize(localisation.broadcaster.upper)}`} link={broadcastersLink} />
                        }
                        <ActionMenuItem
                          label="Edit"
                          divide
                          onClick={() => this.props.editSeriesResource({
                            resource,
                            programmeId: this.props.match.params.programme,
                            onSave: (r) => new Promise((resolve, reject) => {
                              this.props.seriesResource.updateResource(r).then((res) => {
                                this.updateResources()
                                return resolve(res)
                              }).catch(reject)
                            }),
                          })}
                        />
                        <ActionMenuItem
                          label="Delete"
                          onClick={() => this.props.deleteSeriesResource({
                            resource,
                            programmeId: this.props.match.params.programme,
                            onSave: (r) => new Promise((resolve, reject) => {
                              this.props.seriesResource.deleteResource(r).then((res) => {
                                this.updateResources()
                                return resolve(res)
                              }).catch(reject)
                            }),
                          }) }
                        />
                        <ActionMenuItem label="Permissions" divide onClick={() => this.props.editSeriesPermissions({
                          resource,
                          onSave: (r) => {
                            this.updateResources()
                            return Promise.resolve()
                          },
                        })}/>
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
            <p>There are currently no {pluralize(this.resourceName)}, try creating some!</p>
          </div>
        </div>
      )
    }
  }

  render() {
    const { theme } = this.props
    return (
      <PageLoader {...this.state}>
        <Meta
          title={`${theme.localisation.client} :: ${pluralize(theme.localisation.series.upper)}`}
          meta={{
            description: `Edit and Create ${pluralize(theme.localisation.series.upper)}`,
          }}
          >
          <main>
            <PageHeader title={`Manage ${pluralize(theme.localisation.series.upper)} for ${this.state.parent.title}`}
              subtitle={`${this.state.resources?.meta?.['record-count']} ${this.state.resources?.meta?.['record-count'] === 1 ? theme.localisation.series.lower : pluralize(theme.localisation.series.lower)}`}>
              <Button className="button" onClick={() => this.props.newSeriesResource({
                onSave: (r) => new Promise((resolve, reject) => {
                  this.props.seriesResource.createResource(r).then((res) => {
                    setTimeout(() => {
                      this.updateResources()
                      return resolve(res)
                    }, 1000)
                  }).catch(reject)
                }),
                programmeId: this.props.match.params.programme,
              })}>
                <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
                New {this.resourceName}
              </Button>
            </PageHeader>
            <div className="container">
              <div className="page-actions">
                <NavLink to={`/admin/${theme.localisation.programme.path}`} className="button">
                  <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
                  Back to {pluralize(theme.localisation.programme.upper)}
                </NavLink>
              </div>
            </div>
            {this.renderResources()}
            {this.state.modal()}
          </main>
        </Meta>
      </PageLoader>
    )
  }
}

const enhance = compose(
  withModalRenderer,
  withSeriesPageActions,
  withHooks(() => {
    const seriesResource = useResource('series')
    return {
      seriesResource
    }
  })
)

export default enhance(SeriesIndex)
