import { css } from 'styled-components'
import { darken, lighten, tint } from 'polished'

import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import getBoxShadowSnippetFromShadowType from 'javascript/utils/helper-functions/get-box-shadow-snippet-from-shadow-type'

const formStyles = makeLiteStyles(styles => {

  const arrowZoneMargin = (styles.forms.inputBorderWidth + 7) * -1 // 7 is padding around input

  return css`

    .form.panel {
      background: transparent
    }

    .form__label,
    .programme-filters__label {
      color: ${styles.forms.labelColor};
      font-size: ${styles.forms.labelFontSize}px;
      ${styles.forms.labelUppercase &&
        css`
          text-transform: uppercase;
      `}
    }
    .form__input {
      background-color: ${styles.forms.inputBgColor};
      border-color: ${styles.forms.inputBorderColor};
      border-radius: ${styles.forms.inputRadius}px;
      border-width: ${styles.forms.inputBorderWidth}px;
      color: ${styles.forms.inputColor};
      font-size: ${styles.forms.inputFontSize}px;
      ${styles.forms.inputUppercase &&
        css`
          text-transform: uppercase;
      `}
    }

    .form__input--phone {
      padding: ${phoneInputPadding(styles.forms.inputFontSize)} 15px;
    }


    /*
    *
    *         DatePicker
    *
    */

    .react-datepicker__input-container {
      input {
        background-color: ${styles.forms.inputBgColor};
        color: ${styles.forms.inputColor};
        border-radius: ${styles.forms.inputRadius}px;
        border-width: ${styles.forms.inputBorderWidth}px;
        border-color: ${styles.forms.inputBorderColor};
        font-size: ${styles.forms.inputFontSize}px;
        min-height: ${selectHeights(styles.forms.inputFontSize)};
        ${styles.forms.inputUppercase &&
          css`
            text-transform: uppercase;
        `}
      }
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        right: 0;
        height: 100%;
        width: 40px;
        text-align: right;
        border-top-right-radius: ${styles.forms.inputRadius}px;
        border-bottom-right-radius: ${styles.forms.inputRadius}px;
        background-color: ${styles.forms.selectArrowColor};
        pointer-events: none;
      }
    }

    /*
    *
    *         Checkboxes
    *
    */

    .custom-checkbox__label {
      background-color: ${styles.forms.inputBgColor};
      color: ${styles.forms.inputColor};
      &::before {
        border: 2px solid ${styles.forms.inputBorderColor};
      }
    }

    .checkbox-filters__header {
      background-color: ${styles.buttons.primaryBgColor};
      .custom-checkbox__label {
        background-color: ${styles.buttons.primaryBgColor};
        color: ${styles.buttons.primaryColor}
      }
    }

    .custom-checkbox--toggle {
      .custom-checkbox__label {
        border: ${styles.tags.borderWidth}px solid ${styles.tags.borderColor};
      }
      .custom-checkbox__input:checked + .custom-checkbox__label {
        color: ${styles.tags.color};
        background-color: ${styles.tags.bgColor};
      }
    }

    /*
    *
    *         Selects
    *
    */

    /* Programme Search */

    .programme-search {
      background-color: ${styles.colors.shaded};
      border-color: ${darken(0.2, styles.colors.background)};
      &__input,
      &__clear {
        background-color: ${styles.forms.inputBgColor};
        border: ${styles.forms.inputBorderWidth}px solid ${styles.forms.inputBorderColor};
      }

      &__input {
        border-radius: ${styles.forms.inputRadius}px 0 0 ${styles.forms.inputRadius}px;
        border-right: none;
        color: ${styles.forms.inputColor};
        font-size: ${styles.forms.inputFontSize}px;
      }

      &__clear {
        border-right: none;
        border-left: none;
        svg {
          fill: ${darken(0.2, styles.forms.inputColor)};
        }
        &:hover {
          svg {
            fill: ${lighten(0.1, styles.forms.inputColor)};
          }
        }
      }

      .button {
        border-radius: 0 ${styles.forms.inputRadius}px ${styles.forms.inputRadius}px 0;
      }
    }

    .react-autosuggest {
      &__section-title {
        background-color: ${styles.forms.inputBgColor};
        border-bottom: 2px solid ${styles.forms.inputBorderColor};
      }

      &__suggestions-container {
        background-color: ${styles.forms.inputBgColor};
        border-radius: 0
        &--open {
          border: 2px solid ${styles.forms.inputBorderColor};
        }
      }

      &__suggestion--highlighted {
        background: ${lighten(0.3, styles.forms.inputBgColor)};
      }

      &__suggestion {
        color: ${styles.forms.inputColor}
      }
    }

    /* React Select */

    .Select.Select--single {
      .Select-value {
        background-color: transparent;
        color: ${styles.forms.inputColor};
        font-size: ${styles.forms.inputFontSize}px;
      }

      .Select-placeholder {
        color: ${styles.forms.inputColor};
        font-size: ${styles.forms.inputFontSize}px;
      }

      .Select-arrow-zone {
        background-color: ${styles.forms.selectArrowColor}
        padding: 0 0 0 45px;
        margin: ${arrowZoneMargin}px ${arrowZoneMargin}px ${arrowZoneMargin}px 0;
        border-top-right-radius: ${styles.forms.inputRadius}px;
        border-bottom-right-radius: ${styles.forms.inputRadius}px;
      }
    }
    .Select-placeholder {
      color: ${styles.forms.inputColor};
    }
    .Select-value {
      background-color: ${styles.tags.bgColor};
      border-radius: ${styles.tags.radius}px;
      color: ${styles.tags.color};
    }

    .Select-value-icon {
      color: ${styles.tags.color};
    }

    .Select-control {
      background-color: ${styles.forms.inputBgColor};
      border: ${styles.forms.inputBorderWidth}px solid ${styles.forms.inputBorderColor};
      border-radius: ${styles.forms.inputRadius}px;

    }

    .Select-menu-outer {
      font-size: ${styles.forms.inputFontSize}px;
      background-color: ${styles.forms.inputBgColor};
    }

    .Select-option {
      color: ${styles.forms.inputColor};
    }

    .Select-option.is-focused {
      background-color: ${tint(0.3, styles.forms.inputBgColor)};
    }

    .Select.is-focused {
      .Select-control {
        border-color: ${styles.colors.brand};
      }
    }

    .SelectV3 {
      .Select {
        &__control {
          background-color: ${styles.forms.inputBgColor};
        }

        &__single-value,
        &__multi-value,
        &__input {
          color: ${styles.forms.inputColor};
        }
      }
    }

    /* Custom Select */

    .custom-select {
      min-height: ${selectHeights(styles.forms.inputFontSize)};
      background-color: ${styles.forms.inputBgColor};
      border-radius: ${styles.forms.inputRadius}px;
      border-color: ${styles.forms.inputBorderColor};
      border-width: ${styles.forms.inputBorderWidth}px;
      ${styles.forms.inputUppercase &&
        css`
          text-transform: uppercase;
      `}
      .custom-select__select {
        color: ${styles.forms.inputColor};
        font-size: ${styles.forms.inputFontSize}px;
      }
      .custom-select__icon {
        fill: white;
        right: 14px
        z-index: 1;
      }
      &::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        width: 45px;
        margin: -${styles.forms.inputBorderWidth}px;
        border-top-right-radius: ${styles.forms.inputRadius}px;
        border-bottom-right-radius: ${styles.forms.inputRadius}px;
        background-color: ${styles.forms.selectArrowColor};
        pointer-events: none;
      }
    }

    /* Create form */

    .create-form {
      &__input {
        background-color: ${styles.forms.inputBgColor};
        border-color: ${styles.forms.inputBorderColor};
        border-width: ${styles.forms.inputBorderWidth}px;
        border-right: none;
        color: ${styles.forms.inputColor};
        font-size: ${styles.forms.inputFontSize}px;
      }
      &__button {
        background-color: ${styles.buttons.primaryBgColor};
        color: ${styles.buttons.primaryColor};
        font-family: ${styles.buttons.primaryFontFamily};
        font-weight: ${styles.buttons.primaryFontWeight};
        font-size: ${styles.buttons.primaryFontSize}px;
        ${getBoxShadowSnippetFromShadowType(
          styles.buttons.primaryShadowType,
          styles.buttons.primaryShadowColor,
        )};
        &:focus, &:hover {
          background-color: ${styles.buttons.primaryBgColorHover};
          border-color: ${styles.buttons.primaryBorderColorHover};
          color: ${styles.buttons.primaryColorHover};
          ${getBoxShadowSnippetFromShadowType(
            styles.buttons.primaryShadowTypeHover,
            styles.buttons.primaryShadowColorHover,
          )};
        }
      }
    }

    /* Virtual Asset Search */
    .virtual-asset-search {
      .programme-search {
        color: white;
        border: none;
        background-color: transparent;

        &__input,
        &__clear {
          background-color: transparent;
          border: none;
        }

        &__input {
          border: 1px solid #6e6d6d;
          border-radius: 6px;
          background-color: transparent;
          color: white;
          font-size: 16px;
          height: unset;
          &:focus {
            border-color: ${styles.colors.brand};
          }
        }

        .react-autosuggest__container {
          color: black;
        }

        &__clear {
          right: 10px;
          border: none;
          svg {
            fill: grey;
          }
          &:hover {
            svg {
              fill: white;
            }
          }
        }
      }
    }
  `
})

const selectHeights = (fontSize) => {
  return `${2.5 * fontSize}px`
}

const phoneInputPadding = (fontSize) => {
  const modifier = fontSize > 20 ? 2.5 : 3.5
  return `${Math.floor(fontSize / modifier)}px`
}

export default formStyles
