// React
import React from 'react'

import { SketchPicker } from 'react-color'

import CustomCheckbox from 'javascript/components/custom-checkbox'
import RangeSlider from 'javascript/components/range-slider'
import styled from 'styled-components'
import { ColorType } from 'javascript/utils/theme/types/ApiStylesType'
import Icon from 'javascript/components/icon'

type Props = {
  error?: string
  label?: string
  required?: boolean
  name?: string
  placeholder?: string
  ref?: any
  defaultValue?: any
  value?: any
  onChange?: (newValue?: any) => void
  onBlur?: () => void
  onFocus?: () => void
  autofocus?: boolean
  modifiers?: string[]
  resetToDefault: (e: any) => void
} & (
  | {
      type?: 'text'
      draggable?: boolean
      readonly?: boolean
    }
  | {
      type?: 'color-picker'
      active?: boolean
      onColorChange: (newColor: { hex: string }) => void
      readonly?: boolean
      draggable?: boolean
      colors?: ColorType
    }
  | {
      type?: 'checkbox'
      /** True if the checkbox has no label */
      checkboxLabeless?: boolean
    }
  | {
      type?: 'range-slider'
      minLimit: number
      maxLimit: number
      step?: number
      extension?: string
    }
  |  {
      type?: 'file'
    })

interface State {}

export default class ConfigFormControl extends React.Component<Props, State> {
  pickerTimeout: any
  constructor(props) {
    super(props)
    this.pickerTimeout = false
    this.state = {
      showPicker: false,
    }
  }

  isHexValid(str) {
    return str.match(/^#[a-f0-9]{6}$/i) !== null;
  }

  renderError = () => {
    const { error } = this.props
    if (error) {
      return (
        <div>
          <span className="config-form__error">{error}</span>
        </div>
      )
    }
  }

  renderLabel = () => {
    const control = this.props
    if (control.label) {
      let required = control.required ? '*' : ''
      return (
        <label className="config-form__label">
          {control.label} {required}
        </label>
      )
    }
  }
  renderInput = () => {
    const control = this.props

    switch (control.type) {
      case 'text': {
        return (
          <input
            type="text"
            placeholder={control.placeholder}
            name={control.name}
            ref={control.ref}
            className="config-form__input"
            defaultValue={control.defaultValue}
            value={control.value || ''}
            required={control.required}
            onChange={e => {
              control.onChange
            }}
            onFocus={control.onFocus}
            onBlur={control.onBlur}
            autoFocus={control.autofocus}
            onDragStart={e => {
              e.preventDefault()
            }}
            draggable={control.draggable}
            readOnly={control.readonly}
          />
        )
      }
      case 'color-picker': {        
        return (
          <PositionRelative>
            {control.value &&
              <Swatch
                className="config-form__swatch"
                style={{ backgroundColor: control.value }}
                onClick={control.onFocus}
                onFocus={control.onFocus}
              ></Swatch>
            }
            <ColorInputField
              type="text"
              placeholder={control.placeholder}
              name={control.name}
              className="config-form__input"
              defaultValue={control.defaultValue}
              value={control.value || ''}
              required={control.required}
              onFocus={control.onFocus}
              onChange={e => {
                if(this.isHexValid(e.target.value)) {
                  control.onColorChange({ hex: e.target.value })
                }
              }}
              onKeyDown={(e) => {
                let ctrlKey = e.ctrlKey || e.metaKey;
                let copyPasteKey = ctrlKey && e.key === "c" || ctrlKey && e.key === "v";

                if (!copyPasteKey) {
                  e.preventDefault()
                }
              }}
              autoFocus={control.autofocus}
              onDragStart={e => {
                e.preventDefault()
              }}
              draggable={control.draggable}
            />
            <ResetConfigButton onClick={this.props.resetToDefault} wrapperStyles={{top: '5px'}} />
            {control.active && (
              <SketchPickerWrapper>
                <SketchPicker
                  color={control.value || ''}
                  onChange={control.onChange}
                  onChangeComplete={control.onColorChange}
                  disableAlpha={true}
                  presetColors={Object.values(control.colors || {})}
                />
              </SketchPickerWrapper>
            )}
            <HelperMessage>Valid format must be: #ffffff or #FFFFFF</HelperMessage>
          </PositionRelative>
        )
      }
      case 'checkbox': {
        return (
          <>
            <CustomCheckbox
              {...control}
              label={''}
              labeless
              data-parent={control['data-parent']}
            />
            <ResetConfigButton onClick={this.props.resetToDefault} />
          </>
        )
      }
      case 'range-slider': {
        return (
          <>
            <ResetConfigButton onClick={this.props.resetToDefault} wrapperStyles={{top: '45px'}} />
            <div style={{ width: '95%'}}>
              <RangeSlider {...control}
                value={typeof control.value === 'string' ? Number.parseFloat(control.value) : control.value}
                onChange={({value}) => control.onChange(Number.parseFloat(value))}
                hideInput
              />
            </div>
          </>
        )
      }
      case 'file': {
        return (
          <>
            {control.value &&
              <FileValue>{control.value}</FileValue>
            }
            <input
              type="file"
              placeholder={control.placeholder}
              id={control.name}
              className="config-form__file"
              accept="image/png, image/jpeg, image/svg"
              required={control.required}
              onChange={control.onChange}
              onFocus={control.onFocus}
              onBlur={control.onBlur}
            />
            <label
              htmlFor={control.name}
              className="config-form__button"
            >
              Select
            </label>
            <ResetConfigButton onClick={this.props.resetToDefault} />
          </>
        )
      }
    }
  }


  render() {
    const control = this.props
    let classes = [
      'config-form__control',
      this.props.error && 'error',
      ...(control.modifiers || []),
      this.props.type === 'range-slider' && 'range',
    ]
      .filter(Boolean)
      .join(' config-form__control--')
    return (
      <div className={classes}>
        {this.renderLabel()}
        {this.renderInput()}
        {this.props.children}
        {this.props.children && <ResetConfigButton onClick={this.props.resetToDefault} /> }
        {this.renderError()}
      </div>
    )
  }
}

interface ResetProps {
  onClick: (e?: any) => void
  wrapperStyles?: any
}

const ResetConfigButton = ({
  onClick,
  wrapperStyles = {},
}: ResetProps) => {
  return (
    <div className="config-form__reset" onClick={onClick} style={wrapperStyles}>
      <Icon width="15" height="15" id="i-reset" viewBox="0 0 200 200" className="config-form__reset-icon" />
    </div>
  )
}

const HelperMessage = styled.div`
  color: #fff; 
  font-size: 10px; 
  margin-top: 4px;
`

const SketchPickerWrapper = styled.div`
  position: absolute;
  left: calc(100% + 8px);
  top: 0;
`

const PositionRelative = styled.div`
  position: relative;
`

const ColorInputField = styled.input`
  padding-left: 48px !important;
`

const Swatch = styled.span`
  border-radius: 50%;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.2) inset;
  margin-right: 6px;
  height: 20px;
  pointer-events: none;
  position: absolute;
  left: 10px;
  top: 7px;
  width: 20px;
`

const FileValue = styled.span`
  color: #fff
  font-size: 12px
  margin: 0 5px
`

