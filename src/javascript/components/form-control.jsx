// React
import React from 'react'

import compose from 'javascript/utils/compose'
import withPrefix from 'javascript/components/hoc/with-prefix'
import withTheme from 'javascript/utils/theme/withTheme'

import Checkbox from 'javascript/components/custom-checkbox'
import CountrySelect from 'javascript/components/country-select'
import CurrencyInput from 'react-currency-input';
import CustomSelect from 'javascript/components/custom-select'
import DatePicker from 'javascript/components/datepicker'
import DateTimePicker from 'javascript/components/datetime-picker'
import PhoneInput from 'javascript/components/phone-input'
import Select from 'react-select'

class FormControl extends React.Component {
  constructor(props) {
    super(props)
  }

  renderError = () => {
    const { error, prefix } = this.props
    if (error) {
      return (
        <div>
          <span className={`${prefix}form__error`}>
            {error}
          </span>
        </div>
      )
    }
  }

  renderLabel = () => {
    const { prefix } = this.props
    const control = this.props
    if (control.label) {
      let required = control.required ? '*' : ''
      return (
        <label className={`${prefix}form__label ${control.description ? `${prefix}form__label--with-description` : ''}`}>{control.label} {required}</label>
      )
    }
  }

  renderIcon = () => {
    return this.props.icon
  }

  renderInput = () => {
    const { prefix } = this.props
    const control = {...this.props}

    switch (control.type) {
      case 'text': {
        return (
          <input
            type="text"
            placeholder={control.placeholder}
            name={control.name}
            ref={control.ref}
            aria-label={control.name}
            className={`${prefix}form__input`}
            defaultValue={control.defaultValue}
            value={control.value || ''}
            required={control.required}
            onChange={control.onChange}
            onFocus={control.onFocus}
            onBlur={control.onBlur}
            autoFocus={control.autofocus}
            onDragStart={(e) => { e.preventDefault() }}
            draggable={control.draggable}
            readOnly={control.readonly} />
        )
        break
      }
      case 'password': {
        return (
          <input
            type="password"
            placeholder={control.placeholder}
            name={control.name}
            ref={control.ref}
            className={`${prefix}form__input`}
            defaultValue={control.defaultValue}
            value={control.value || ''}
            required={control.required}
            onChange={control.onChange}
            onFocus={control.onFocus}
            onBlur={control.onBlur}
            autoFocus={control.autofocus}
            onDragStart={(e) => { e.preventDefault() }}
            draggable={control.draggable}
            readOnly={control.readonly} />
        )
        break
      }
      case 'number': {
        return (
          <input
            {...control}
            type="number"
            aria-label={control.name}
            className={`${prefix}form__input`}
            value={control.value || ''}
            onDragStart={(e) => { e.preventDefault() }}
          />
        )
        break
      }
      case 'tel': {
        return (
          <input
            type="tel"
            name={control.name}
            ref={control.ref}
            className={`${prefix}form__input`}
            value={control.value || ''}
            required={control.required}
            onChange={control.onChange}
            onFocus={control.onFocus}
            onBlur={control.onBlur}
            autoFocus={control.autofocus}
            onDragStart={(e) => { e.preventDefault() }}
            draggable={control.draggable} />
        )
        break
      }
      case 'email': {
        const multiControls = {}
        let controlValue = control.value || ''
        if (control.multiple) { // helps control comma delimited email addresses..
          multiControls['onKeyDown'] = (e) => {
            const updatedEvent = {...e}
            const currValue = updatedEvent.target.value.trim()
            const lastChar = currValue[currValue.length - 1]
            if (e.keyCode === 32 && lastChar === ',') return //allow space after a comma
            if (e.keyCode === 188 && lastChar === ',') return //allow comma if last is comma (inserting)
            if ((e.keyCode === 59) || // semicolon
            (e.keyCode === 32) || // space
            (e.keyCode === 188)) { // comma
              e.preventDefault()
              updatedEvent.target.value += ','
              control.onChange(updatedEvent)
            }
          }
          controlValue = controlValue.replace(/(,\s)|,/gm, ', ').replace(/,\s,\s/gm, '  ')
        }
        return (
          <input
            type="email"
            {...control}
            {...multiControls}
            className={`${prefix}form__input`}
            value={controlValue}
            onDragStart={(e) => { e.preventDefault() }}
          />
        )
        break
      }
      case 'textarea': {
        return (
          <textarea
            {...control}
            value={control.value || ''}
            className={`${prefix}form__input ${prefix}form__input--textarea`}
            autoFocus={control.autofocus}
            onDragStart={(e) => { e.preventDefault() }}
            {...(control.maxlength && { maxLength: control.maxlength })}
          ></textarea>
        )
        break
      }
      case 'title': {
        const titleOnChange = (e) => {
          if (!e) {
            return control.onChange({ value: null, input: 'title' })
          }
          return control.onChange(e)
        }
        const controlProps = {
          name: control.name,
          value: control.value || '',
          ref: control.ref,
          'aria-label': control.name,
          required: control.required,
          onChange: titleOnChange,
          clearable: control.clearable || false,
          options: this.props.theme.components.forms.titleOptions.map((t) => {
            return ({
              ...t,
              input: 'title'
            })
          })
        }
        if (control.custom) {
          return (
            <CustomSelect
              {...controlProps}
              classes={control.classes || []}
            />
          )
        } else {
          return (
            <Select
              {...controlProps}
            />
          )
        }
      }
      case 'mobile': {
        const controlProps = {
          ...control,
          value: `${control.countryCode || ''} ${control.mobileNumber || ''}`,
          onChange: (value, data) => {
            const rawPhoneNumber = value.replace(/[^0-9]+/g,'').slice(data.dialCode.length)
            control.onChange(`+${data.dialCode}`, rawPhoneNumber)
          }
        }
        return (
          <PhoneInput { ...controlProps } />
        )
      }
      case 'datetime': {
        return (
          <DateTimePicker {...control} />
        )
      }
      case 'date': {
        return (
          <DatePicker {...control} />
        )
      }
      case 'checkbox': {
        return (
          <Checkbox {...control}
            label={control.checkboxLabel}
            labeless={control.checkboxLabeless}
            data-parent={control['data-parent']}
          />
        )
      }
      case 'currency': {
        return (
          <CurrencyInput {...control}
            className={`${prefix}form__input`}
            prefix={control.currencyPrefix}
            value={control.value}
            onChangeEvent={control.onChange}
            onChange={() => {}} //onChange is deprecated
          />
        )
      }
      case 'country-code': {
        return (
          <CountrySelect {...control}
            className={`${prefix}form__input`}
            value={control.value}
          />
        )
      }
    }
  }

  render() {
    const { prefix } = this.props
    const control = {...this.props}
    let classes = [`${prefix}form__control`, control.type === 'textarea' && 'tall', this.props.error && 'error', ...(control.modifiers || [])].filter(Boolean).join(` ${prefix}form__control--`)
    return (
      <div className={classes} style={control.outerStyle || {}}>
        {this.renderIcon()}
        {this.renderLabel()}
        <div className={`${prefix}form__inner`}>
          {this.renderInput()}
          {control.description && (
            <p className={`${prefix}form__info ${prefix}form__info--left`}>{control.description}</p>
          )}
          {this.props.children}
          {this.renderError()}
        </div>
      </div>
    )
  }
}

const enhance = compose(
  withTheme,
  withPrefix
)

export default enhance(FormControl)