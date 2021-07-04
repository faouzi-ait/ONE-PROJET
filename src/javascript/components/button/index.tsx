import React from 'react'
import { css } from 'styled-components'
import { darken } from 'polished'

import { ApiStyleType } from 'javascript/utils/theme/types/ApiStylesType'
import { RecursiveRequired } from 'javascript/utils/theme/types/ThemeType'
import ApplyPrefixStyles from 'javascript/components/apply-prefix-styles'
import getBoxShadowSnippetFromShadowType from 'javascript/utils/helper-functions/get-box-shadow-snippet-from-shadow-type'
import joinClasses from 'javascript/utils/helper-functions/joinClasses'
import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'

interface Props extends React.HTMLProps<HTMLButtonElement> {
  variant?: 'filled' | 'reversed'
  sizeModifier?: 'small' | 'smallest'
  color?: 'error' | 'success' | 'null' | 'transparent' | 'secondary'
  state?: 'loading' | 'alert'
  loading?: boolean
  containsIcon?: boolean
  ignorePrefixing?: boolean
  classesToPrefix?: string[]
  children: any
}

const Button = React.forwardRef<HTMLButtonElement, Props>(({
  children,
  variant,
  sizeModifier,
  containsIcon,
  state,
  color,
  loading,
  ignorePrefixing,
  classesToPrefix,
  ...props
  }, forwardedRef) => {

  const classesFromProps = [
    'button',
    variant === 'filled' && 'button--filled',
    variant === 'reversed' && 'button--reversed',
    sizeModifier === 'small' && 'button--small',
    color === 'error' && 'button--error',
    color === 'success' && 'button--success',
    color === 'null' && 'button--null',
    color === 'transparent' && 'button--transparent',
    state === 'loading' && 'button--loading',
    state === 'alert' && 'button--alert',
    loading && state !== 'loading' && 'button--loading',
    color === 'secondary' && 'button--secondary',
    containsIcon && 'button--icon',
  ]
  const hasButtonClassRelatedProps = variant || sizeModifier || color || state || loading || containsIcon

  const classes = joinClasses([
    ...(hasButtonClassRelatedProps ? classesFromProps : []),
    ...(props.className || '').split(' '),
    ...(props['class'] || '').split(' '),
  ])

  return (
    <ApplyPrefixStyles
      providedClassNames={classes}
      classesToPrefix={classesToPrefix || ['button']}
      ignorePrefixing={ignorePrefixing}
      renderProp={(classNames) => {
        return (
          //@ts-ignore
          <button
            {...props}
            className={classNames}
            ref={forwardedRef}
          >
            {children}
          </button>
        )
      }}
    />
  )
})

const primaryFontSettings = (styles: RecursiveRequired<ApiStyleType>) => `
  font-family: ${styles.buttons.primaryFontFamily};
  font-weight: ${styles.buttons.primaryFontWeight};
  font-size: ${styles.buttons.primaryFontSize}px;
`

const secondaryFontSettings = (styles: RecursiveRequired<ApiStyleType>) => `
  font-family: ${styles.buttons.secondaryFontFamily};
  font-weight: ${styles.buttons.secondaryFontWeight};
  font-size: ${styles.buttons.secondaryFontSize}px;
`

const nullColor = '#808080'; // This could use javascript/utils/helper-functions/get-text-color-from-background-color.ts
// would allow us to generate light/dark buttons depending on background color. (need to know what background is set to)
// where is it being rendered - can only find it in lists - control buttons - which for now grey is fine

export const buttonStyles = makeLiteStyles(styles => {
  return css`
    .button,
    .wysiwyg__button {
      background-color: ${styles.buttons.secondaryBgColor};
      transition: box-shadow 0.2s;
      border: solid ${styles.buttons.secondaryBorderWidth}px ${styles.buttons.secondaryBorderColor};
      border-radius: ${styles.buttons.secondaryRadius}px;
      color: ${styles.buttons.secondaryColor};
      ${secondaryFontSettings(styles)}
      ${getBoxShadowSnippetFromShadowType(
        styles.buttons.secondaryShadowType,
        styles.buttons.secondaryShadowColor,
      )};
      text-transform: ${styles.buttons.secondaryUppercase ? 'uppercase' : 'none'}
      &__icon{
        fill: ${styles.buttons.secondaryColor};
      }
      &:focus, &:hover {
        background-color: ${styles.buttons.secondaryBgColorHover};
        border-color: ${styles.buttons.secondaryBorderColorHover};
        color: ${styles.buttons.secondaryColorHover};
        ${getBoxShadowSnippetFromShadowType(
          styles.buttons.secondaryShadowTypeHover,
          styles.buttons.secondaryShadowColorHover,
        )};
        .button__icon{
          fill: ${styles.buttons.secondaryColorHover};
        }
      }

      &--icon {
        border-color: ${styles.buttons.iconBgColor};
        background-color: ${styles.buttons.iconBgColor};
        &:hover {
          border-color: ${styles.buttons.iconBgColorHover};
          background-color: ${styles.buttons.iconBgColorHover};
        }
      }

      &--null {
        color: ${styles.buttons.primaryColor};
        ${primaryFontSettings(styles)}
        border-color: ${nullColor};
        background-color: ${nullColor};
        &:focus, &:hover {
          border-color: ${darken(0.1, nullColor)};
          background-color: ${darken(0.1, nullColor)};
          ${getBoxShadowSnippetFromShadowType(
            styles.buttons.primaryShadowTypeHover,
            styles.buttons.primaryShadowColorHover,
          )};
        }
      }

      &--filled,
      &.wysiwyg__button {
        background-color: ${styles.buttons.primaryBgColor};
        border: solid ${styles.buttons.primaryBorderWidth}px ${styles.buttons.primaryBorderColor};
        border-radius: ${styles.buttons.primaryRadius}px;
        color: ${styles.buttons.primaryColor};
        ${primaryFontSettings(styles)}
        ${getBoxShadowSnippetFromShadowType(
          styles.buttons.primaryShadowType,
          styles.buttons.primaryShadowColor,
        )};
        ${styles.buttons.primaryUppercase &&
          css`
            text-transform: uppercase;
        `}
        .button__icon{
          fill: ${styles.buttons.primaryColor};
        }
        &:focus, &:hover {
          background-color: ${styles.buttons.primaryBgColorHover};
          border-color: ${styles.buttons.primaryBorderColorHover};
          color: ${styles.buttons.primaryColorHover};
          ${getBoxShadowSnippetFromShadowType(
            styles.buttons.primaryShadowTypeHover,
            styles.buttons.primaryShadowColorHover,
          )};
          .button__icon{
            fill: ${styles.buttons.primaryColorHover};
          }
        }

        &.button--loading {
          &:after {
            border-color: white;
            border-bottom-color: transparent;
          }
          &:before {
            border-color: white;
            border-bottom-color: transparent;
          }
        }
      }

      &--loading {
        color: transparent;
        &:after {
          border-color: ${styles.buttons.primaryBorderColor};
          border-bottom-color: transparent;
        }
        &:before {
          border-color: ${styles.buttons.primaryBorderColor};
          border-bottom-color: transparent;
        }
      }
      &--error {
        color: ${styles.buttons.primaryColor};
        ${primaryFontSettings(styles)}
        border-color: ${styles.colors.error};
        background-color: ${styles.colors.error};
        ${styles.buttons.primaryUppercase &&
          css`
            text-transform: uppercase;
        `}
        ${getBoxShadowSnippetFromShadowType(
          styles.buttons.primaryShadowType,
          styles.buttons.primaryShadowColor,
        )};
        &:focus, &:hover {
          border-color: ${darken(0.1, styles.colors.error)};
          background-color: ${darken(0.1, styles.colors.error)};
          ${getBoxShadowSnippetFromShadowType(
            styles.buttons.primaryShadowTypeHover,
            styles.buttons.primaryShadowColorHover,
          )};
        }
      }

      &--success {
        color: ${styles.buttons.primaryColor};
        ${primaryFontSettings(styles)}
        border-color: ${styles.colors.success};
        background-color: ${styles.colors.success};
        ${getBoxShadowSnippetFromShadowType(
          styles.buttons.primaryShadowType,
          styles.buttons.primaryShadowColor,
        )};
        ${styles.buttons.primaryUppercase &&
          css`
            text-transform: uppercase;
        `}
        &:focus, &:hover {
          border-color: ${darken(0.1, styles.colors.success)};
          background-color: ${darken(0.1, styles.colors.success)};
          ${getBoxShadowSnippetFromShadowType(
            styles.buttons.primaryShadowTypeHover,
            styles.buttons.primaryShadowColorHover,
          )};
        }
      }
    }

    .text-button {
      color: ${styles.colors.brand};
      ${primaryFontSettings(styles)}
      &:hover {
        color: ${darken(0.1, styles.colors.brand)};
      }
    }

    .icon-button {
      .button__icon, svg {
        fill: ${styles.buttons.primaryBgColor};
      }
    }
  `
})

export default Button
