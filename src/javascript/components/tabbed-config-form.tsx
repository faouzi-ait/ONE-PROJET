import React from 'react'
import Meta from 'react-document-meta'
import Select from 'react-select'
import { useHistory } from 'react-router-dom'

import PageHeader from 'javascript/components/admin/layout/page-header'
import Tabs from 'javascript/components/tabs'
import Icon from 'javascript/components/icon'
import useThemeForm from 'javascript/utils/hooks/use-theme-form'
import {
  CustomThemeType,
  ThemeType,
} from 'javascript/utils/theme/types/ThemeType'
import styled, { css } from 'styled-components'
import ConfigFormControl from './admin/config/config-form-control'
import Button from 'javascript/components/button'
import useTheme from 'javascript/utils/theme/useTheme'
import 'stylesheets/admin/components/page-section'
import 'stylesheets/admin/components/config-form'

export interface TabbedConfigFormTab {
  title: string
  inputs: {
    [index: string]: Input
  }
}

export interface TabbedConfigImages {
  path: string,
  title: string
}

type InputType =
  | 'color-picker'
  | 'text'
  | 'select'
  | 'range-slider'
  | 'range-slider-with-extension'
  | 'checkbox'
  | 'file'

export const INPUT_TYPES: { [K in InputType]: InputType } = {
  'color-picker': 'color-picker',
  'range-slider': 'range-slider',
  'range-slider-with-extension': 'range-slider-with-extension',
  checkbox: 'checkbox',
  select: 'select',
  text: 'text',
  file: 'file',
}

type Input = {
  selector: (theme: ThemeType) => any
  reverseSelector: (value: any) => CustomThemeType
} & {
  type: InputType
  label: string
  name?: string
  minLimit?: number
  useFontFamilyWrapper?: boolean
  maxLimit?: number
  step?: number
  extension?: 'px'
  options?: { value: any; label: string }[]
}

interface TabbedConfigFormProps {
  tabs: TabbedConfigFormTab[]
  title: string
  /**
   * Receives all of the inputs
   * as one flattened object, so that you can
   * perform API actions
   */
  handleSubmit: (values: any) => Promise<any>
  images?: TabbedConfigImages[]
  subtitle?: string
}

const TabbedConfigForm: React.FC<TabbedConfigFormProps> = ({
  tabs,
  handleSubmit,
  title,
  images,
  subtitle
}) => {
  return (
    <TabbedConfigFormWrapper title={title} images={images || []} subtitle={subtitle || ''}>
      <TabbedConfigFormTabs
        tabs={tabs}
        handleSubmit={handleSubmit}
      ></TabbedConfigFormTabs>
    </TabbedConfigFormWrapper>
  )
}

export const TabbedConfigFormWrapper: React.FC<{
  title: string,
  images?: TabbedConfigImages[],
  subtitle?: string
}> = ({
  title,
  children,
  images,
  subtitle
}) => {
  const history = useHistory()
  return (
    <Meta>
      <main>
        <FadeInWrapper className="sub-navigation sub-navigation--with-sub">
          <ul className="sub-navigation__list">
            <li key="back" className="sub-navigation__item">
              <Icon
                id="i-left-arrow"
                classes="sub-navigation__arrow"
              />
              <span
                className="sub-navigation__link sub-navigation__link--with-icon"
                onClick={() => history.push('/admin')}
              >
                Back
              </span>
            </li>
          </ul>
          <div className="sub-navigation__content">
            <h4 className="sub-navigation__link sub-navigation__link--is-active">
              {title}
            </h4>
            {children}
          </div>
        </FadeInWrapper>
        <PageHeader title={title} subtitle={subtitle} />
        <div className="container">
          {images?.map((i) => {
            const source = i.path
            return (
              <div className="page-section">
                <img className="page-section__image" src={source} />
                <p className="page-section__caption">{i.title}</p>
              </div>
            )
          })}
        </div>
      </main>
    </Meta>
  )
}


export const FadeInWrapper = styled.div`
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  animation: fadeIn 0.3s;
  animation-delay: 0.3s;
  opacity: 0;
  animation-fill-mode: forwards;
`

export const TabbedConfigFormTabs: React.FC<Pick<
  TabbedConfigFormProps,
  'handleSubmit' | 'tabs'
>> = ({ handleSubmit, tabs }) => {
  const {
    makeInputProps,
    makeColorInputProps,
    makeCheckboxInputProps,
    onSubmit,
    haveChangesBeenMade,
    submitStatus,
    resetToDefault,
  } = useThemeForm<any>({
    inputs: tabs.reduce((obj, tab) => ({ ...obj, ...tab.inputs }), {}),
    handleSubmit,
  })

  const {
    styles: { colors },
  } = useTheme()

  const tabContent = tabs.map(tab => (
    <div key={tab.title} title={tab.title}>
      {Object.keys(tab.inputs).map(key => {
        const input = tab.inputs[key]
        if (input.type === 'color-picker') {
          return (
            <ConfigFormControl
              key={key}
              type="color-picker"
              label={input.label}
              colors={colors}
              {...makeColorInputProps(key)}
              resetToDefault={() => resetToDefault(key)}
            />
          )
        } else if (input.type === 'text') {
          return (
            <ConfigFormControl
              key={key}
              type="text"
              label={input.label}
              {...makeInputProps(key)}
              resetToDefault={() => resetToDefault(key)}
            />
          )
        } else if (input.type === 'range-slider') {
          return (
            <ConfigFormControl
              key={key}
              type="range-slider"
              minLimit={input.minLimit}
              maxLimit={input.maxLimit}
              step={input.step}
              {...makeInputProps(key)}
              label={input.label}
              resetToDefault={() => resetToDefault(key)}
            />
          )
        } else if (input.type === 'range-slider-with-extension') {
          return (
            <ConfigFormControl
              key={key}
              type="range-slider"
              minLimit={input.minLimit}
              maxLimit={input.maxLimit}
              extension={input.extension || 'px'}
              label={input.label}
              {...makeInputProps(key)}
              resetToDefault={() => resetToDefault(key)}
            />
          )
        } else if (input.type === 'checkbox') {
          return (
            <ConfigFormControl
              key={key}
              type="checkbox"
              {...makeCheckboxInputProps(key)}
              label={input.label}
              resetToDefault={() => resetToDefault(key)}
            />
          )
        } else if (input.type === 'select') {
          const Wrapper: React.FC = input.useFontFamilyWrapper
            ? ({ children }) => (
                <FontFamilyWrapper fontChosen={makeInputProps(key).value}>
                  {children}
                </FontFamilyWrapper>
              )
            : React.Fragment
          return (
            <>
              <SelectLabel className="config-form__label">
                {input.label}
              </SelectLabel>
              <ConfigFormControl
                key={key}
                resetToDefault={() => resetToDefault(key)}
              >
                <Wrapper>
                  <Select
                    options={input.options}
                    clearable={false}
                    {...makeInputProps(key)}
                  ></Select>
                </Wrapper>
              </ConfigFormControl>
            </>
          )
        } else if (input.type === 'file') {
          return (
            <ConfigFormControl
              key={key}
              type="file"
              name={input.name}
              label={input.label}
              {...makeInputProps(key)}
              resetToDefault={() => resetToDefault(key)}
            />
          )
        }
      })}
    </div>
  ))

  return (
    <form className="config-form" onSubmit={onSubmit}>
      {tabs.length > 1 ? <Tabs>{tabContent}</Tabs> : tabContent}
      <ConfigSaveButton
        haveChangesBeenMade={haveChangesBeenMade}
        submitStatus={submitStatus}
      />
    </form>
  )
}

interface ConfigButtonProps {
  haveChangesBeenMade: boolean
  submitStatus: string
  buttonText?: string
}

export const ConfigSaveButton: React.FC<ConfigButtonProps> = ({
  haveChangesBeenMade,
  submitStatus,
  buttonText = 'Save',
}) => {
  return (
    <ButtonWrapper
      shouldShow={haveChangesBeenMade}
      hasSucceeded={submitStatus === 'fulfilled'}
    >
      <Button
        type="submit"
        variant="filled"
        state={submitStatus === 'loading' ? 'loading' : undefined}
        color={submitStatus === 'errored' ? 'error' : undefined}
        containsIcon={submitStatus === 'fulfilled'}
        sizeModifier="small"
      >
        {submitStatus === 'fulfilled' ? 'Saved Successfully' : buttonText}
      </Button>
    </ButtonWrapper>
  )
}

const ButtonWrapper = styled.div<{
  shouldShow: boolean
  hasSucceeded: boolean
}>`
  opacity: ${props => (props.shouldShow ? 1 : 0)};
  transform: ${props =>
    props.shouldShow ? 'translateX(0px)' : 'translateX(-10px)'};
  pointer-events: ${props => {
    return props.shouldShow ? 'default' : 'none'
  }};
  transition: opacity 0.3s, transform 0.3s;
  padding: 8px 20px;

  @keyframes fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  ${props =>
    props.hasSucceeded &&
    css`
      pointer-events: none;
      animation: fade-out 1.5s;
      animation-delay: 1s;
      animation-fill-mode: forwards;
    `}
`

const SelectLabel = styled.label`
  color: white;
  display: block;
  margin-left: 20px;
  margin-bottom: 5px;
`

export default TabbedConfigForm

export const DEFAULT_FONT_WEIGHT_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
]

export const DEFAULT_LINE_HEIGHT_OPTIONS = [
  { value: 1, label: 'Small' },
  { value: 1.5, label: 'Medium' },
  { value: 2, label: 'Large' },
]

export const DEFAULT_SHADOW_TYPE_OPTIONS: {
  value: string
  label: string
}[] = [
  {
    value: 'none',
    label: 'None',
  },
  {
    value: 'light',
    label: 'Light',
  },
  {
    value: 'medium',
    label: 'Medium',
  },
  {
    value: 'heavy',
    label: 'Heavy',
  },
]

export const BORDER_WIDTH_INPUT = {
  type: INPUT_TYPES['range-slider-with-extension'],
  minLimit: 0,
  maxLimit: 5,
  label: 'Border Width',
}

export const SHADOW_TYPE_INPUT = {
  type: INPUT_TYPES.select,
  options: DEFAULT_SHADOW_TYPE_OPTIONS,
  label: 'Shadow Type',
}

export const FONT_SIZE_INPUT = {
  type: INPUT_TYPES['range-slider-with-extension'],
  minLimit: 12,
  maxLimit: 32,
  label: 'Font Size',
}

export const FONT_FAMILY_INPUT = {
  type: INPUT_TYPES['select'],
  label: 'Font Family',
  useFontFamilyWrapper: true,
  options: [
    'Roboto',
    'Open Sans',
    'Lato',
    'Slabo',
    'Oswald',
    'Source Sans Pro',
    'Montserrat',
    'Raleway',
    'PT Sans',
    'Lora',
  ].map(f => ({ value: f, label: f })),
}

const FontFamilyWrapper = styled.div<{ fontChosen: string }>`
  width: 100%;
  ${props => {
    if (props.fontChosen) {
      return css`
        font-family: ${props.fontChosen};
      `
    }
    return ''
  }}
`
