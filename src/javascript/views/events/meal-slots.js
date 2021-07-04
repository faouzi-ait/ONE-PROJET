import React from 'react'

import FormControl from 'javascript/components/form-control'
import CustomSelect from 'javascript/components/custom-select'
import Icon from 'javascript/components/icon'

const times = []
for (let h = 0; h <= 23; h ++) {
  for (let m = 0; m < 60; m += 30) {
    const hour = `0${h}`.slice(-2)
    const minutes = `0${m}`.slice(-2)
    times.push({
      value: `${hour}:${minutes}`,
      label: `${hour}:${minutes}`
    })
  }
}

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      slots: props.resource['calendar-event-meal-slots'].length ? props.resource['calendar-event-meal-slots'] : [{
        'start-hour-and-minute': '',
        'end-hour-and-minute': ''
      }],
      errors: {}
    }
  }
  validate = () => {
    const errors = {}
    let count = 0
    this.state.slots.forEach((s,i) => {
      errors[i] = {}
      if (!s['start-hour-and-minute'].length) {
        errors[i].start = 'Please provide a start time'
        count ++
      }
      if (!s['end-hour-and-minute'].length) {
        errors[i].end = 'Please provide a end time'
        count ++
      }
    })
    if (count < 1) {
      this.setState({
        errors: {}
      }, this.props.assignMealSlots(this.state.slots))
    } else {
      this.setState({
        errors
      })
    }
  }
  render() {
    const { slots } = this.state
    return (
      <div className="modal__wrapper">

        <div className="modal__header modal__header--with-action">
          <h3 className="heading--two modal__title">Manage Meal Slots</h3>
          {this.state.slots.length > 0 &&
            <button className="button button--filled button--small" onClick={this.validate}><span className="button__count">{this.state.slots.length}</span>Assign meal slots</button>
          }
        </div>
        <button className="modal__close" type="button" onClick={ this.props.closeEvent }>
          <Icon id="i-close" />
          Close
        </button>
        <div className="modal__content modal__content--wide">
          {slots.map((s,i) => (
            <div className="form__group" key={i}>
              <h3 style={{margin: '43px 20px 0 0'}}>Meal Slot {i+1}</h3>
              <FormControl label="Start Time" required error={this.state.errors[i] ? this.state.errors[i].start : null}>
                <CustomSelect value={s['start-hour-and-minute']} options={times} onChange={({target}) => {
                  slots[i]['start-hour-and-minute'] = target.value
                  this.setState({
                    slots
                  })
                }} simpleValue={true} clearable={false} required/>
              </FormControl>
              <FormControl label="End Time" required error={this.state.errors[i] ? this.state.errors[i].end : null}>
                <CustomSelect value={s['end-hour-and-minute']} options={times} onChange={({target}) => {
                  slots[i]['end-hour-and-minute'] = target.value
                  this.setState({
                    slots
                  })
                }} simpleValue={true} clearable={false} required/>
              </FormControl>
              <button className="delete" onClick={() => {
                this.setState({
                  slots: slots.filter((s,j) => j!== i)
                })
              }}>
              <Icon id="i-close" classes="delete__icon"/></button>
            </div>
          ))}
          <div className="form__control form__control--bordered">
            <button className="button button--small" onClick={() => {
              this.setState({
                slots: [...slots, {
                  'start-hour-and-minute': '',
                  'end-hour-and-minute': ''
                }]
              })
            }}>Add a new meal slot</button>
          </div>
        </div>
      </div>
    )
  }
}