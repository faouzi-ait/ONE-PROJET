import React from 'react'
import Meta from 'react-document-meta'
import pluralize from 'pluralize'

import PageHelper from 'javascript/views/page-helper'
import TalentsStore from 'javascript/stores/talents'
import TalentsActions from 'javascript/actions/talents'
import TalentTypesStore from 'javascript/stores/talent-types'
import TalentTypesActions from 'javascript/actions/talent-types'

import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import NewTalentForm from 'javascript/views/admin/talents/new-talent-form'
import NewTalentTypeForm from 'javascript/views/admin/talents/new-type-form'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Resource from 'javascript/components/admin/resource'
import NavLink from 'javascript/components/nav-link'
import Modal from 'javascript/components/modal'
import Paginator from 'javascript/components/paginator'

import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'

export default class TalentsIndex extends PageHelper {

  constructor(props) {
    super(props)
    this.resourceName = props.theme.localisation.talent.upper
    this.state = {
      types: [],
      talents: [],
      query: {
        'page[number]': 1,
        'page[size]': 50,
        'fields[talents]': 'firstname,surname,programme-talents-count,series-talents-count'
      }
    }
    this.meta = {
      title: `${props.theme.localisation.client} :: ${props.theme.localisation.talent.upper}`,
      meta: {
        description: `Manage ${props.theme.localisation.talent.upper}`
      }
    }
  }

  componentWillMount(){
    TalentTypesStore.on('change', this.setTypes)
    TalentsStore.on('change', this.setTalents)
  }

  componentWillUnmount() {
    TalentTypesStore.removeListener('change', this.setTypes)
    TalentsStore.removeListener('change', this.setTalents)
  }

  componentDidMount(){
    this.getTalentTypes()
    this.getTalents()
  }

  getTalentTypes = () => {
    TalentTypesActions.getResources({
      page: {
        size: '48'
      },
      fields: {
        'talent-types': 'name,programme-talents-count,series-talents-count,position'
      }
    })
  }

  getTalents = () => {
    TalentsActions.getResources(this.state.query)
  }

  setTypes = () => {
    this.setState({
      types: TalentTypesStore.getResources().sort((a, b) => a.position - b.position)
    }, this.unsetModal)
  }

  setTalents = () => {
    this.setState({
      talents: TalentsStore.getResources()
    }, this.unsetModal)
    if(this.state.talents){
      this.setState({
        totalPages: this.state.talents.meta['page-count']
      })
    }
  }

  updatePage = (page, size) => {
    const update = this.state.query
    if(size) {
      update['page[size]'] = parseInt(page)
      update['page[number]'] = 1
    } else {
      update['page[number]'] = parseInt(page)
    }
    this.setState({
      query: update
    })
    this.getTalents()
  }

  dragStart = (e, index) => {
    this.state.dragged = index
    e.dataTransfer.setData('text', e.currentTarget.getAttribute('key'))
  }

  dragEnd = (index) => {
    let resource = this.state.types[this.state.dragged]
    TalentTypesActions.updateResource({
      id: resource.id,
      position: resource.position
    })
    this.setState({
      dragged: false
    })
  }

  dragOver = (e, index) => {
    e.preventDefault()
    let {types, dragged} = this.state
    types[dragged].position = index + 1
    types.splice(index, 0, types.splice(dragged, 1)[0])
    this.setState({
      types,
      dragged: index
    })
  }

  drop = (e) => {
    e.preventDefault()
  }

  openForm = (Form) => (method, type, resource = {}) => () => {
    const { theme } = this.props
    const formResource = resource
    const ResourceForm = () => <Form method={method} resource={formResource} closeEvent={this.unsetModal} {...this.state} />
    if (method === 'deleteResource') {
      if (resource['programme-talents-count'] > 0 || resource['series-talents-count'] > 0) {
        return this.setState({
          modal: () => (
            <Modal ref="modal" title="Warning" modifiers={['warning']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} closeEvent={this.unsetModal}>
              <div className="cms-modal__content">
                <div className="u-align-center">
                  {resource['programme-talents-count'] > 0 &&
                    <p>There { resource['programme-talents-count'] === 1 ? 'is' : 'are' } { resource['programme-talents-count'] }&nbsp;
                    { resource['programme-talents-count'] === 1 ? theme.localisation.programme.lower : pluralize(theme.localisation.programme.lower) } with this {type.toLowerCase()} tag. Please remove this tag from all <NavLink to={ { pathname: `/admin/${theme.localisation.programme.path}/`} }>{ pluralize(theme.localisation.programme.lower) }</NavLink> first.</p>
                  }
                  {resource['series-talents-count'] > 0 &&
                    <p>There { resource['series-talents-count'] === 1 ? 'is' : 'are' } { resource['series-talents-count'] }&nbsp;
                    { resource['series-talents-count'] === 1 ? theme.localisation.series.lower : pluralize(theme.localisation.series.lower) } with this {type.toLowerCase()} tag. Please remove this tag from all {pluralize(theme.localisation.series.lower)} first.</p>
                  }
                  <Button type="button" className="button button--reversed" onClick={this.unsetModal}>Cancel</Button>
                </div>
              </div>
            </Modal>
          )
        })
      }
      return this.setState({
        modal: () => (
          <Modal ref="modal" title="Warning" modifiers={['warning']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} closeEvent={this.unsetModal}>
            <div className="cms-modal__content">
              <ResourceForm />
            </div>
          </Modal>
        )
      })
    }

    delete formResource['programme-talents-count']
    delete formResource['series-talents-count']

    this.setState({
      modal: () => (
        <Modal ref="modal" title={`${method === 'createResource' ? 'Create' : 'Edit'} ${type}`} closeEvent={this.unsetModal}>
          <div className="cms-modal__content">
            <ResourceForm />
          </div>
        </Modal>
      )
    })
  }

  renderResources = () => {
    const { theme } = this.props
    return (
      <div className="container">
        <table className="cms-table">
          <thead>
            <tr>
              <th colSpan={2}>{pluralize(theme.localisation.talent.upper)}</th>
              <th>
                <Button onClick={this.openForm(NewTalentForm)('createResource', theme.localisation.talent.upper)} className="button button--small">
                  <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
                  New {theme.localisation.talent.upper}
                </Button>
              </th>
            </tr>
            <tr>
              <th>First name</th>
              <th colSpan="2">Last name</th>
            </tr>
          </thead>
          <tbody>
            {this.state.talents.map((resource) => (
              <tr key={ resource.id } className="with-action">
                <td>{ resource.firstname}</td>
                <td>{ resource.surname}</td>
                <td className="cms-table__actions">
                  <ActionMenu name="Actions">
                    <ActionMenuItem label="Edit" onClick={this.openForm(NewTalentForm)('updateResource', theme.localisation.talent.upper, resource)} />
                    <ActionMenuItem label="Delete" onClick={this.openForm(NewTalentForm)('deleteResource', theme.localisation.talent.upper, resource)} />
                  </ActionMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Paginator currentPage={ parseInt(this.state.query['page[number]']) } totalPages={ this.state.totalPages } onChange={ this.updatePage } onPageSizeChange={(page) => this.updatePage(page, true)} currentPageSize={parseInt(this.state.query['page[size]'])}/>
      </div>
    )
  }

  render = () => {
    const { theme } = this.props
    return (
      <Meta
        title={`${theme.localisation.client} :: ${pluralize(theme.localisation.talent.upper)}`}
        meta={{
          description: `Edit and Create ${theme.localisation.talent.upper}`
        }}>
        <main>
          <PageHeader title={`Manage ${pluralize(theme.localisation.talent.upper)}`} />
          <div className="container">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>{`${theme.localisation.talent.upper} Types`}</th>
                  <th>
                    <Button onClick={this.openForm(NewTalentTypeForm)('createResource', `${theme.localisation.talent.upper} Type`)} className="button button--small">
                      <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
                      New Type
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                { (this.state.types || []).map((resource, index) => (
                  <tr
                    key={resource.id}
                    draggable="true"
                    onDragStart={(e) => { this.dragStart(e, index) }}
                    onDragEnd={() => { this.dragEnd(index) }}
                    onDragOver={(e) => { this.dragOver(e, index) }}
                    onDrop={this.drop}
                    className={['cms-table__row', 'draggable', index === this.state.dragged && 'hidden'].join(' cms-table__row--') + ' with-action'}>
                    <td>{resource.name}</td>
                    <td className="cms-table__actions">
                      <ActionMenu name="Actions">
                        <ActionMenuItem label="Edit" onClick={this.openForm(NewTalentTypeForm)('updateResource', `${theme.localisation.talent.upper} Type`, resource)} />
                        <ActionMenuItem label="Delete" onClick={this.openForm(NewTalentTypeForm)('deleteResource', `${theme.localisation.talent.upper} Type`, resource)} />
                      </ActionMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {this.renderResources()}
          {this.state.modal && this.state.modal()}
        </main>
      </Meta>
    )
  }

}

