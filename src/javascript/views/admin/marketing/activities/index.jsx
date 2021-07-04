// React
import React from 'react'
import PageHelper from 'javascript/views/page-helper'
import pluralize from 'pluralize'
import Select from 'react-select'
import moment from 'moment'

// Store
import ProgrammeStore from 'javascript/stores/programmes'
import ProductionCompaniesStore from 'javascript/stores/production-companies'
import MarketingActivitiesStore from 'javascript/stores/marketing-activities'

// Actions
import ProgrammeActions from 'javascript/actions/programmes'
import ProductionCompaniesActions from 'javascript/actions/production-companies'
import MarketingActivitiesActions from 'javascript/actions/marketing-activities'

// Components
import Activity from 'javascript/components/admin/marketing/activity'
import Button from 'javascript/components/button'
import DatePicker from 'javascript/components/datepicker'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'
import PageHeader from 'javascript/components/admin/layout/page-header'
import PageLoader from 'javascript/components/page-loader'
import PdfDownloadButton from 'javascript/components/pdf-download-button'

import DeleteForm from 'javascript/views/admin/marketing/activities/delete'
import Form from 'javascript/views/admin/marketing/activities/form'

import Meta from 'react-document-meta'
import withTheme from 'javascript/utils/theme/withTheme'

class MarketingActivitiesIndex extends PageHelper {

  constructor(props) {
    super(props)
    this.resourceName = "Marketing Activity"
    this.state = {
      activities: null,
      programmes: null,
      productionCompanies: null,
      fromDate: null,
      toDate: null,
      selectedProgrammes: [],
      selectedProductionCompanies: [],
      modal: () => { },
    }
    this.query = {
      include: 'programmes,marketing-category',
      fields: {
        'programmes': 'title',
        'production-companies': 'name',
        'marketing-activities': 'date,description,programmes,marketing-category',
      },
      sort: '-date'
    }
    this.filter = {}
  }

  componentWillMount() {
    ProgrammeStore.on('change', this.getResources)
    ProductionCompaniesStore.on('change', this.getResources)
    MarketingActivitiesStore.on('change', this.getResources)
    MarketingActivitiesStore.on('save', this.updateResources)
    MarketingActivitiesStore.unsetResource()
  }

  componentWillUnmount() {
    ProgrammeStore.removeListener('change', this.getResources)
    ProductionCompaniesStore.removeListener('change', this.getResources)
    MarketingActivitiesStore.removeListener('change', this.getResources)
    MarketingActivitiesStore.removeListener('save', this.updateResources)
  }

  componentDidMount() {
    this.updateResources()
    ProgrammeActions.getResources({
      'page[size]': 'all',
      filter: {
        all: 'true'
      },
      fields: {
        programmes: 'title'
      },
    })
    ProductionCompaniesActions.getResources({
      fields: {
        'production-companies': 'name'
      },
      sort: 'name',
    })
  }

  updateResources = () => {
    MarketingActivitiesActions.getResources(Object.assign({}, this.query, this.filter))
  }

  getResources = () => {
    let programmes = ProgrammeStore.getResources()
    if (programmes) {
      programmes = programmes.map(programme => ({
        ...programme,
        value: programme.id,
        label: programme.title
      }))
    }

    let productionCompanies = ProductionCompaniesStore.getResources()
    if (productionCompanies) {
      productionCompanies = productionCompanies.map(productionCompany => ({
        ...productionCompany,
        value: productionCompany.id,
        label: productionCompany.name
      }))
    }

    this.setState({
      activities: MarketingActivitiesStore.getResources(),
      programmes,
      productionCompanies
    })

    if (this.state.activities && this.state.programmes && this.state.productionCompanies) {
      this.finishedLoading()
    }
    this.unsetModal()
  }

  deleteActivity = (resource) => {
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={this.unsetModal}
            title="Warning"
            modifiers={['warning']}
            titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
            <div className="cms-modal__content">
              <DeleteForm deleteActivity={resource} closeEvent={this.unsetModal} />
            </div>
          </Modal>
        )
      }
    })
  }

  createActivity = (activity) => {
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={this.unsetModal}
            title={`New Marketing Activity`}
            titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}>
            <div className="cms-modal__content">
              <Form programmes={this.state.programmes} activity={activity} closeEvent={this.unsetModal} />
            </div>
          </Modal>
        )
      }
    })
  }

  newActivity = () => {
    this.createActivity(null)
  }

  editActivity = (activity) => {
    this.createActivity(activity)
  }

  handleDateChange = (date, name) => {
    const update = Object.assign({}, this.state)
    if (date) {
      update[name] = date
      if (!update.toDate || !update.fromDate) {
        if (name === 'fromDate') {
          update.toDate = moment(date).add(7, 'days')
        } else {
          update.fromDate = moment(date).subtract(7, 'days')
        }
      }
      this.filter['filter[date-range][start]'] = update.fromDate.toDate().toString()
      this.filter['filter[date-range][end]'] = update.toDate.toDate().toString()
    } else {
      update['fromDate'] = null
      update['toDate'] = null
      delete this.filter['filter[date-range][start]']
      delete this.filter['filter[date-range][end]']
    }
    this.setState(update)
    this.updateResources()
  }

  handleProgrammeSelect = (selections) => {
    const update = Object.assign({}, this.state)
    update.selectedProgrammes = selections
    this.setState(update)
    this.filterSelect(selections, 'filter[programme-ids]')
  }

  handleProductionCompanySelect = (selections) => {
    const update = Object.assign({}, this.state)
    update.selectedProductionCompanies = selections
    this.setState(update)
    this.filterSelect(selections, 'filter[production-company-ids]')
  }

  filterSelect = (selections, inputFilter) => {
    const values = selections.map(selection => selection.value)
    if (!values.length) {
      delete this.filter[inputFilter]
    } else {
      this.filter[inputFilter] = values
    }
    this.updateResources()
  }

  renderActivities = () => {
    const activities = this.state.activities.map((activity) => {
      return <Activity key={`activity_${activity.id}`} activity={activity} editActivity={this.editActivity} deleteActivity={this.deleteActivity} />
    })
    if (activities.length > 0) {
      return  (
        < div className = "container" >
          <table className="cms-table">
            <thead>
              <tr>
                <th>Date</th>
                <th colSpan="3">Title</th>
                <th>Category</th>
                <th colSpan="2">Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activities}
            </tbody>
          </table>
        </div >
      )
    } else {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>There are currently no activities to show.</p>
          </div>
        </div>
      )
    }
  }

  render() {
    const {theme} = this.props
    return (
      <PageLoader {...this.state}>
        <Meta
          title={`${theme.localisation.client} :: Marketing Activities`}
          meta={{
            description: 'Edit and Create Marketing Activities'
          }}>
          <main>
            <PageHeader
              title={`Manage Marketing Activities`}
              subtitle={`${this.state.activities && this.state.activities.meta['record-count']} ${this.state.activities && this.state.activities.meta['record-count'] === 1 ? 'activity' : 'activities' }`} >
              <div class="page-header__actions">
                { !this.state.activities || !this.state.activities.length ? null : (
                    <PdfDownloadButton
                      displayPdf={true}
                      pdfType="marketing"
                      pdfTitle={'Marketing Report'}
                      postData={{
                        filter: this.filter,
                      }}
                    />
                  )
                }
                <Button className="button" onClick={this.newActivity}>
                  <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
                  New Marketing Activity
                </Button>
              </div>
            </PageHeader>
            <div className="container">
              <div className="page-actions">
                { this.state.programmes &&
                  <div className="cms-form__control">
                    <label className="cms-form__label">{pluralize(theme.localisation.programme.upper)}</label>
                    <Select
                      options={this.state.programmes}
                      value={this.state.selectedProgrammes}
                      onChange={this.handleProgrammeSelect}
                      clearable={false}
                      multi={true}
                    />
                  </div>
                }
                {this.state.productionCompanies &&
                  <div className="cms-form__control">
                    <label className="cms-form__label">Production Company</label>
                    <Select
                      options={this.state.productionCompanies}
                      value={this.state.selectedProductionCompanies}
                      onChange={this.handleProductionCompanySelect}
                      clearable={false}
                      multi={true}
                    />
                  </div>
                }
              </div>
              <div className="page-actions">
                {
                  <div className="cms-form__control">
                    <label className="cms-form__label">Start Date</label>
                    <DatePicker selectsStart
                      selected={this.state.fromDate}
                      startDate={this.state.fromDate}
                      endDate={this.state.toDate}
                      onChange={(dt) => this.handleDateChange(dt, 'fromDate')}
                      dateFormat={theme.features.formats.mediumDate}
                      showYearDropdown
                      isClearable={true}
                    />
                  </div>
                }
                {
                  <div className="cms-form__control">
                    <label className="cms-form__label">End Date</label>
                    <DatePicker selectsEnd
                      selected={this.state.toDate}
                      startDate={this.state.fromDate}
                      endDate={this.state.toDate}
                      onChange={(dt) => this.handleDateChange(dt, 'toDate')}
                      dateFormat={theme.features.formats.mediumDate}
                      showYearDropdown
                      isClearable={true}
                    />
                  </div>
                }
              </div>
            </div>
            {this.state.activities && this.renderActivities()}
            {this.state.modal()}
          </main>
        </Meta>
      </PageLoader>
    )
  }
}

export default withTheme(MarketingActivitiesIndex)