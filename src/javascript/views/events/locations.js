import React from 'react'
import { Features } from 'javascript/config/features'

import FormControl from 'javascript/components/form-control'
import Icon from 'javascript/components/icon'
import SlideToggle from 'javascript/components/slide-toggle'

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      locations: props.resource['calendar-event-locations'].length ? props.resource['calendar-event-locations'] : [{
        'name': '',
        'nickname': '',
        'max-attendees': '',
        'meal': false,
        'unSaved': true
      }],
      errors: {}
    }
  }
  validate = () => {
    const errors = {}
    let count = 0
    this.state.locations.forEach((l, i) => {
      errors[i] = {}
      if (!l.name.length) {
        errors[i].name = 'Please provide a location name'
        count++
      }
      if (!l['max-attendees'].toString().length) {
        errors[i].attendees = 'Please select the number of attendees'
        count++
      }
    })
    if (count < 1) {
      this.setState({
        errors: {}
      }, this.props.assignLocations(this.state.locations))
    } else {
      this.setState({
        errors
      })
    }
  }
  render() {
    const { locations } = this.state
    return (
      <div className="modal__wrapper">
        <div className="modal__header modal__header--with-action">
          <h3 className="heading--two modal__title">Manage Locations</h3>
          {this.state.locations.length > 0 &&
            <button className="button button--filled button--small" onClick={this.validate}><span className="button__count">{this.state.locations.length}</span>Save locations</button>
          }
        </div>
        <button className="modal__close" type="button" onClick={this.props.closeEvent}>
          <Icon id="i-close" />
          Close
        </button>
        <div className="modal__content modal__content--wide">
          {locations.map((l, i) => (
            <div className="form__group" key={i}>
              <FormControl label="Location Name" type="text" error={this.state.errors[i] ? this.state.errors[i].name : null} value={l.name} onChange={e => {
                locations[i].name = e.target.value
                this.setState({
                  locations
                })
              }} readonly={Features.users.meetings.defaultLunchLocation && l.name === Features.users.meetings.defaultLunchName} required />
              <FormControl label="Location Nickname" type="text" value={l.nickname} onChange={e => {
                locations[i].nickname = e.target.value
                this.setState({
                  locations
                })
              }} />
              <FormControl label="Attendees" type="number" min="2" error={this.state.errors[i] ? this.state.errors[i].attendees : null} value={l['max-attendees']} onChange={e => {
                locations[i]['max-attendees'] = e.target.value
                this.setState({
                  locations
                })
              }} required />
              <SlideToggle identifier={`meal-${i}`} off="Meal Location" disabled={Features.users.meetings.defaultLunchLocation && l.name === Features.users.meetings.defaultLunchName} onChange={e => {
                locations[i].meal = e.target.checked
                this.setState({
                  locations
                })
              }} checked={l.meal} />
            </div>
          ))}
          <div className="form__control form__control--bordered">
            <button className="button button--small" onClick={() => {
              this.setState({
                locations: [...locations, {
                  'name': '',
                  'nickname': '',
                  'max-attendees': '',
                  'meal': false,
                  'unSaved': true
                }]
              })
            }}>Add a new location</button>
          </div>
        </div>
      </div>
    )
  }
}