import React from 'react'

import approvalsListClientVariables from 'javascript/views/approvals/list/variables'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withPageHelper from 'javascript/components/hoc/with-page-helper'
import withTheme from 'javascript/utils/theme/withTheme'

// Actions
import ApprovalsActions from 'javascript/actions/approvals'
import RoleActions from 'javascript/actions/roles'
import TerritoryActions from 'javascript/actions/territory'
import UserActions from 'javascript/actions/users'

// Stores
import ApprovalsStore from 'javascript/stores/approvals'
import RoleStore from 'javascript/stores/roles'
import UsersStore from 'javascript/stores/users'
import TerritoryStore from 'javascript/stores/territory'

// Components
import ApprovalsSearch from 'javascript/components/approvals-search'
import Button from 'javascript/components/button'
import DeleteForm from 'javascript/views/admin/users/delete'
import Form from 'javascript/views/approvals/form'
import Modal from 'javascript/components/modal'
import Paginator from 'javascript/components/paginator'
import { UseCompanyForm } from 'javascript/views/admin/companies/form'


class ApprovalsList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      resources: [],
      territories: [],
      query: {
        'page[number]': 1,
        'page[size]': 50,
        'filter[status]': props.status
      }
    }
  }

  componentWillMount() {
    ApprovalsStore.on('change', this.setResources)
    RoleStore.on('change', this.setResources)
    TerritoryStore.on('change', this.setTerritories)
    ApprovalsStore.on('save', this.getResources)
    UsersStore.on('delete', this.getResources)
  }

  componentWillUnmount() {
    ApprovalsStore.removeListener('change', this.setResources)
    RoleStore.removeListener('change', this.setResources)
    TerritoryStore.removeListener('change', this.setTerritories)
    ApprovalsStore.removeListener('save', this.getResources)
    UsersStore.removeListener('delete', this.getResources)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.page !== this.props.page || prevProps.status !== this.props.status) {
      this.setState({
        query: {
          ...this.state.query,
          'page[number]': this.props.page,
          'filter[status]': this.props.status
        }
      }, this.getResources)
    }
  }

  setResources = () => {
    const resources = ApprovalsStore.getResources()
    this.setState(() => ({
      loading: false,
      resources,
      roles: RoleStore.getResources()
    }), () => {
      if (this.state.resources) {
        this.setState({
          totalPages: this.state.resources.meta['page-count']
        })
      }
      if (this.state.roles && this.state.resources) {
        this.setState({
          am_role: this.state.roles.find(r => r.name === 'account_manager').id
        })
        this.props.pageIsLoading(false)
      }
    })
    this.props.modalState.hideModal()
  }

  setTerritories = () => {
    this.setState({
      territories: TerritoryStore.getResources()
    })
  }

  getResources = () => {
    const users = [
      'first-name,last-name,email,telephone-number,company-name,job-title,account-manager,company,territories,user-type',
      this.props.approvalsListCV.showBuyerType && 'buyer-type'
    ].filter(Boolean).join(',')
    const approvals = [
      'status,external-user,updated-at,created-at',
      this.props.theme.features.mailingListSubscriptions.addToMailingListCheckbox && 'add-to-mailing-lists'
    ].filter(Boolean).join(',')
    ApprovalsActions.getResources(Object.assign({
      include: 'external-user,external-user.account-manager,external-user.company,external-user.territories',
      fields: {
        approvals,
        users,
        companies: 'name'
      }
    }, this.state.query))
    RoleActions.getResources({
      fields: {
        roles: 'name'
      }
    })
    this.props.modalState.hideModal()
  }

  componentDidMount = () => {
    this.getResources()
    TerritoryActions.getResources({
      fields: {
        territories: 'name'
      }
    })
  }

  reviewApplication = (resource) => {
    this.props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal title="Review Application" closeEvent={hideModal} modifiers={['large']}>
          <div className="cms-modal__content">
            <Form resource={resource}
              amRole={this.state.am_role}
              territories={this.state.territories}
              tab={this.props.status}
              user={this.props.user}
              createCompany={this.createCompany}
            />
          </div>
        </Modal>
      )
    })
  }

  createCompany = (approvalResource) => {
    const closeCreateCompanyModal = (newlyCreatedCompany) => {
      const updatedResource = {...approvalResource}
      if ( newlyCreatedCompany ) {
        const company = {
          id: newlyCreatedCompany.id,
          name: newlyCreatedCompany.name,
          type: newlyCreatedCompany.type,
        }
        updatedResource['external-user'].company = company
        UserActions.updateResource({
          id: updatedResource['external-user'].id,
          company
        })
      }
      this.reviewApplication(updatedResource)
    }
    this.props.modalState.showModal(() => {
      return (
        <Modal
          closeEvent={closeCreateCompanyModal}
          title={'New Company'}
          titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}>
          <div className="cms-modal__content">
            <UseCompanyForm resource={{}} method="createResource" onChange={closeCreateCompanyModal} />
          </div>
        </Modal>
      )
    })
  }

  updatePage = (page, size = false) => {
    const update = this.state.query
    if (size) {
      update['page[size]'] = parseInt(page)
      update['page[number]'] = 1
    } else {
      update['page[number]'] = parseInt(page)
    }
    this.setState({
      query: update
    })
    this.getResources()
  }

  updateSearch = (query) => {
    const update = {...query}
    update['page[number]'] = 1
    this.setState({
      query: update
    })
    this.getResources()
  }

  deleteUser = (resource) => {
    this.props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title="Warning"
          modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
          <div className="cms-modal__content">
            <DeleteForm deleteResource={resource} closeEvent={hideModal} />
          </div>
        </Modal>
      )
    })
  }

  render() {
    const { status } = this.props
    return (
      <div>
        <p>{this.state.resources && this.state.resources.meta && this.state.resources.meta['record-count']} {status.charAt(0).toUpperCase() + status.slice(1)} Approvals</p>
        <table className="cms-table cms-table--approvals">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th className="no-border" colSpan={status === 'rejected' ? 2 : 1}>
                <ApprovalsSearch onChange={this.updateSearch} query={this.state.query} />
              </th>
            </tr>
          </thead>
          <tbody>
            {this.state.resources && this.state.resources.map((resource, key) => (
              <tr key={key} className="with-action">
                <td>{resource['external-user']['first-name']} {resource['external-user']['last-name']}</td>
                <td>{resource['external-user']['email']}</td>
                <td className="cms-table__actions">
                  <Button className="button button--filled button--small" onClick={() => { this.reviewApplication(resource) }}>Review Application</Button>
                </td>
                {status === 'rejected' &&
                  <td className="cms-table__actions">
                    <Button className="button button--error button--small"
                      onClick={() => { this.deleteUser(resource['external-user']) }}>
                      Delete User
                    </Button>
                  </td>
                }
              </tr>
            ))}
          </tbody>
        </table>
        <Paginator currentPage={parseInt(this.state.query['page[number]'])} totalPages={this.state.totalPages} onChange={this.updatePage} onPageSizeChange={(page) => this.updatePage(page, true)} currentPageSize={parseInt(this.state.query['page[size]'])} />
      </div>
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('approvalsListCV', approvalsListClientVariables),
  withPageHelper,
)

export default enhance(ApprovalsList)