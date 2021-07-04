import React from 'react'
import ReactPhoneInput from 'react-phone-input-2-polyfill'

import withPrefix from 'javascript/components/hoc/with-prefix'

class PhoneInput extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      inFocus: false
    }
    this.hasInitialValue = Boolean(this.props.value && this.props.value.replace(/\D/g, '').length)
  }

  highlightInput = () => {
    this.setState({
      inFocus: !this.state.inFocus
    })
  }

  render() {
    const { prefix } = this.props
    const containerClass = `${prefix}form__input ${prefix}form__input--phone ${this.state.inFocus ? `${prefix}form__input--focus` : ''}`
    const hasInitialValue = Boolean(this.props.value && this.props.value.replace(/\D/g, '').length)
    return (
      <div className={containerClass} onFocus={this.highlightInput} onBlur={this.highlightInput}>
        <ReactPhoneInput
          placeholder={ this.props.placeholder || "Enter phone number" }
          onChange={this.props.onChange}
          value={ hasInitialValue ? this.props.value : '44' }
          disableAreaCodes={true}
          enableSearchField={true}
          preferredCountries={['gb', 'us', 'ca', 'fr', 'de', 'it', 'esp', 'nl']}
          inputClass={`${prefix}form__input`}
        />
      </div>
    )
  }
}

export default withPrefix(PhoneInput)