import React from 'react'
import pluralize from 'pluralize'
import PageHelper from 'javascript/views/page-helper'
import moment from 'moment'

// Actions
import DataImportActions from 'javascript/actions/data-imports'

// Stores
import DataImportStore from 'javascript/stores/data-imports'

// Components
import Button from 'javascript/components/button'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Meta from 'react-document-meta'
import Select from 'react-select'
import Resource from 'javascript/components/admin/resource'
import Toggle from 'javascript/components/toggle'

import withTheme from 'javascript/utils/theme/withTheme'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import importClientVariables from './variables'
import compose from 'javascript/utils/compose'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

class ImportIndex extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      resources: null
    }
  }

  componentWillMount() {
    DataImportStore.on('change', this.getResources)
  }

  componentWillUnmount() {
    DataImportStore.removeListener('change', this.getResources)
    clearInterval(this.interval)
  }

  componentDidMount() {
    if(!this.props.importCV.allowTypes){
      DataImportActions.getResources()

      this.interval = setInterval(() => {
        if(this.state.resources.filter((r) => r.status === 'started').length > 0) {
          DataImportActions.getResources()
        }
      }, 20000)
    }
  }

  getResources = () => {
    this.setState({
      resources: DataImportStore.getResources(),
    })
  }

  startImport = e => {
    e.preventDefault()
    this.setState(
      {
        inProgress: true,
      },
      () => {
        {this.props.importCV.allowTypes ? (
          DataImportActions.startImportType(this.state.type)
        ) : (
          DataImportActions.createResource({
            type: 'data-imports',
          })
        )}
      },
    )
  }

  updateType = item => {
    this.setState({ type: item.value })
  }

  renderResources = () => {
    const resources = this.state.resources.map((resource, i) => {
      const classes = `${resource.status === 'failed' && 'count--warning'} ${resource.status === 'finished' && 'count--success'}`
      return (
        <Resource
          key={i}
          name={moment(resource['created-at']).format(this.props.theme.features.formats.longDate)}
          fields={() => (
            <>
              <td>{moment(resource['created-at']).format('HH:mm')}</td>
              <td>{resource.summary}</td>
              <td>
                <span className={`count ${classes}`}>{resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}</span>
              </td>
            </>
          )}
        ></Resource>
      )
    })
    if (resources.length > 0) {
      return (
        <table className="cms-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Summary</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>{resources}</tbody>
        </table>
      )
    } else {
      return (
        <div className="panel u-align-center">
          <p>There are currently no imports</p>
        </div>
      )
    }
  }

  render() {
    const { theme } = this.props
    const disabled = (this.state.resources && this.state.resources.filter(({status}) => {return status === 'started'}).length > 0) || false
    return (
      <Meta
        title={`${theme.localisation.client} :: Import`}
        meta={{
          description: 'Run Import',
        }}
      >
        <main>
          <PageHeader title="Data Import" />
          <div className="container">
            <p>Use the button below to run a manual data import to the site</p>
            {this.state.inProgress && (
              <p style={{fontStyle: 'italic', fontWeight: 'bold', fontSize: '14px'}}>
                Import in progress, changes may take a few minutes to reflect
                across the website.
              </p>
            )}
            {!this.state.inProgress && (
              <form onSubmit={this.startImport} className="cms-form cms-form--large">
                <div className="grid grid--center grid--stretch">
                  {this.props.importCV.allowTypes &&
                    <div>
                      <Select
                        clearable={false}
                        onChange={this.updateType}
                        value={this.state.type}
                        options={[
                          {
                            value: 'programmes_import',
                            label: 'Import Programmes',
                          },
                          {
                            value: 'ancillaries_import',
                            label: `Import ${pluralize(theme.localisation.material.upper)}`,
                          },
                          {
                            value: 'image_import',
                            label: `Import ${pluralize(theme.localisation.image.upper)}`,
                          },
                        ]}
                      />
                    </div>
                  }
                  <div>
                    <Button disabled={disabled} className="button" type="submit">
                      Run Import
                    </Button>
                  </div>
                </div>
              </form>
            )}
            {this.state.resources && this.renderResources()}
          </div>
        </main>
      </Meta>
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('importCV', importClientVariables)
)

export default enhance(ImportIndex)