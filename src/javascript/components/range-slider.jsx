import React from 'react'
import InputRange from 'react-input-range'

import 'stylesheets/core/generic/react-input-range'

export default class RangeSlider extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      min: this.props.minValue ? this.props.minValue : 0,
      max: this.props.maxValue ? this.props.maxValue : 0,
      value: this.props.value ? this.props.value : 0,
    }
    this.backPressed = false
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      let value = this.props.value
      if (this.props.maxLimit && value > this.props.maxLimit) {
        value = this.props.maxLimit
      } else if (this.props.minLimit && value < this.props.minLimit) {
        value = this.props.minLimit
      }
      this.setState({
        value
      })
    }
  }

  updateInput = e => {
    const name = e.target.name
    const value =
      e.target.value === '' ? e.target.value : parseInt(e.target.value)
    if (
      (value <= parseInt(this.props.maxLimit) &&
        value >= parseInt(this.props.minLimit)) ||
      value === ''
    ) {
      this.setState(
        () => ({
          [name]: value,
        }),
        () => this.props.onChange(this.state),
      )
      this.backPressed = false
    }
  }

  updateRange = e => {
    if (this.props.onFocus) {
      this.props.onFocus()
    }
    const update = (this.props.minValue === undefined)
      ? {
        value: e.max || e.toFixed(countDecimalPlaces(this.props.step || 1))
      } : {
        min: e.min,
        max: e.max,
      }
    this.setState(() => update, () => this.props.onChange(update))
  }

  showInput = (val, type) => {
    let value = this.state.min
    if (type === 'max') {
      value = this.state.max
    }
    return (
      <input
        type="text"
        name={type}
        value={value}
        className="form__input input-range__input"
        onChange={this.updateInput}
      />
    )
  }

  render() {
    const val = this.props.minValue
      ? { min: parseInt(this.state.min), max: parseInt(this.state.max) }
      : this.state.value
    const { minLimit, maxLimit, step = 1 } = this.props
    return (
      <InputRange
        formatLabel={
          !this.props.hideInput
            ? this.showInput
            : value => `${value}${this.props.ext || ''}`
        }
        maxValue={parseInt(maxLimit)}
        minValue={parseInt(minLimit)}
        step={parseInt(step)}
        value={
          this.props.minValue !== undefined
            ? { min: parseInt(this.state.min), max: parseInt(this.state.max) }
            : this.state.value
        }
        onChange={this.updateRange}
        onChangeComplete={() => {
          if (this.props.onBlur) {
            this.props.onBlur()
          }
        }}
      />
    )
  }
}

const countDecimalPlaces = num => {
  if (Math.floor(num.valueOf()) === num.valueOf()) return 0
  return num.toString().split('.')[1].length || 0
}
