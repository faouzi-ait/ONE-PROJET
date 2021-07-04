import React from 'react'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import { Localisation, Features } from 'javascript/config/features' //not one-lite
import EventService from 'javascript/services/events'
import moment from 'moment'

import Schedule from 'javascript/views/reporting/events/reports/schedule'
import Resource from 'javascript/views/reporting/events/reports/resource'
import Overview from 'javascript/views/reporting/events/reports/overview'
import Notes from 'javascript/views/reporting/events/reports/notes'

import EventStore from 'javascript/stores/events'
import EventActions from 'javascript/actions/events'

const reports = {
  'schedule': Schedule,
  'resource-usage': Resource,
  'event-overview': Overview,
  'event-notes': Notes
}

export default class Report extends PageHelper {

  constructor(props) {
    super(props)
    this.id = props.match.params.id,
    this.type = props.match.params.type,
    this.state = {
      report: null,
      loaded: false
    }
  }

  componentWillMount() {
    EventStore.on('dataChange', this.setEvent)
    EventActions.getDataResource(this.id, {
      fields: {
        'calendar-events': 'title,start-time,end-time'
      }
    })
    EventService.generateReport(this.id, this.type).then(({data}) => {
      this.setState({
        report: data.data,
        loaded: true
      })
    })
  }
  componentWillUnmount() {
    EventStore.removeListener('dataChange', this.setEvent)
  }

  setEvent = () => {
    this.setState({
      event: EventStore.getDataResource(this.id)
    })

  }
  render() {
    const { report, event } = this.state
    const View = reports[this.type]
    return (
      <PageLoader { ...this.state }>
        { report &&
          <div className="event-report">
            <h3 className="event-report__title">{event.title}</h3>
            <p className="event-report__dates">{moment(event['start-time']).format(Features.formats.mediumDate)} - {moment(event['end-time']).format(Features.formats.mediumDate)}</p>
            <View report={report} />
          </div>
        }
      </PageLoader>
    )
  }
}