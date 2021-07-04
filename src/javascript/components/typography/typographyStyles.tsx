import { css } from 'styled-components'
import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import getTextColorBasedOnBgColor from 'javascript/utils/helper-functions/get-text-color-from-background-color'
import { ApiStyleType } from 'javascript/utils/theme/types/ApiStylesType'
import breakpoint from 'javascript/utils/theme/breakpoint'
import { darken } from 'polished'

const typographyStyles = makeLiteStyles(
  styles => css`

    #app,
    #app .app {
      background: ${styles.colors.background};
    }

    #app,
    #app .app,
    #admin .mock-page {
      color: ${styles.typography.bodyColor};
      font-family: ${styles.typography.bodyFontFamily};
      font-size: ${styles.typography.bodyFontSize}px;
      font-weight: ${styles.typography.bodyFontWeight};
      line-height: ${styles.typography.bodyLineHeight};
      ${styles.typography.bodyUppercase &&
        css`
          text-transform: uppercase;
        `}

      .breadcrumbs {
        background: ${styles.colors.background};

        &__item {
          color: ${styles.typography.bodyColor}
          &:after {
            background: none;
            border: solid ${styles.typography.bodyColor};
            border-width: 1px 1px 0 0;
            height: 6px;
            transform: translateY(-50%) rotate(45deg);
          }
        }
        &__link {
          color: ${styles.typography.linksColor}
        }
        &--bordered .breadcrumbs__list {
          border-color: ${darken(0.1, styles.colors.background)};
        }
      }

      .page__title {
        color: ${styles.typography.bodyColor}
      }

      .actions,
      .meetings__wrapper {
        background: ${styles.colors.background};
      }

      .meetings__controls {
        background: ${darken(0.1, styles.colors.background)};
      }

      .meeting__title {
        color: white;
      }

      .breadcrumbs__item,
      .featured-content-grid__title,
      .list-navigator__title,
      .member__title,
      .paginator__arrow,
      .section__copy,
      .tweet__copy,
      {
        font-size: ${styles.typography.bodyFontSize}px;
      }

      .meeting-summary__label,
      .notes__text,
      .table > td,
      .section__copy {
        font-weight: ${styles.typography.bodyFontWeight};
      }

      .quote-card__name {
        font-size: ${styles.typography.bodyFontSize - 1}px;
      }

      .action-menu__action,
      .action-menu__trigger,
      .asset,
      .asset__input,
      .attributes,
      .calendar__day,
      .calendar__time,
      .carousel__group,
      .chart__message,
      .checkbox-filters__toggle,
      .contact__jobtitle,
      .gallery__caption,
      .like__button,
      .list-navigator__item,
      .list-navigator__no-results,
      .meeting,
      .meeting__title,
      .member__copy,
      .slide-toggle__label,
      .table__sort,
      {
        font-size: ${styles.typography.bodyFontSize - 2}px;
      }

      .asset__file,
      .link__menu,
      .meeting__room,
      .meeting__list,
      .meeting-summary__copy,
      .meeting-summary__label,
      .quote-card__author,
      .slide-toggle__hint,
      .tweet__handle,
      .tweet__date,
      .notes__date,
      .meetings__filters > .form__label,
      {
        font-size: ${styles.typography.bodyFontSize - 4}px;
      }

      .asset__size {
        font-size: ${styles.typography.bodyFontSize - 6}px;
      }

      .sharer {
        font-size: ${styles.typography.bodyFontSize + 2}px;
      }

      .checkbox-filters__header > .custom-checkbox__label,
      .tweet__title,
      {
        font-size: ${styles.typography.bodyFontSize + 4}px;
      }

      .table--small > td {
        font-size: ${Math.floor(styles.typography.bodyFontSize / 1.1)}px;
      }

      .checkbox-filters__header > .custom-checkbox__label {
        ${breakpoint('large')`
          font-size: ${styles.typography.bodyFontSize}px;
        `}
      }

      /* HEADING TYPOGRAPHY */

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: ${styles.typography.headingsColor};
        font-family: ${styles.typography.headingsFontFamily};
        font-weight: ${styles.typography.headingsFontWeight};
        ${styles.typography.headingsUppercase &&
          css`
            text-transform: uppercase;
          `
        }
      }

      .wysiwyg {
        h1 {
          ${headingFontSizeCss(1, styles)}
          ${headingLineHeightCss(1, styles)}
        }
        h2 {
          ${headingFontSizeCss(2, styles)}
          ${headingLineHeightCss(2, styles)}
        }
        h3 {
          ${headingFontSizeCss(3, styles)}
          ${headingLineHeightCss(3, styles)}
        }
        h4 {
          ${headingFontSizeCss(4, styles)}
          ${headingLineHeightCss(4, styles)}
        }
        p, ul, ol {
          font-size: ${styles.typography.bodyFontSize}px;
        }
        a {
          color: ${styles.typography.linksColor};
          font-weight: ${styles.typography.linksFontWeight};
          ${styles.typography.linksUnderlined &&
            css`
              text-decoration: underline;
            `
          }
          &:hover {
            color: ${styles.typography.linksColorHover};
          }

        }
      }

      .heading--one {
        ${headingFontSizeCss(1, styles)}
      }
      .heading--two {
        ${headingFontSizeCss(2, styles)}
      }
      .heading--three {
        ${headingFontSizeCss(3, styles)}
      }

      .promo__title {
        font-size: ${Math.floor(styles.typography.headingsFontSize * 1.8)}px;
      }

      .table {
        td, th {
          background-color: ${darken(0.1, styles.colors.background)};
          border-color: ${styles.colors.background};
          color: ${styles.typography.bodyColor};
        }
      }

      .table > th {
        ${headingFontSizeCss(5, styles)}
      }

      .table--small > th {
        font-size: ${Math.floor(headingModifier(5, styles.typography.headingsFontSize) / 1.3)}px;
      }

      .like__trigger--love_it,
      .like__button--love::before {
        background-color: ${styles.colors.success}
      }

      .like__trigger--not_interested,
      .like__button--not_interested::before {
        background-color: ${styles.colors.error}
      }

      .toggle--active:not(.toggle--loading) {
        background-color: ${styles.colors.success};
        border-color: ${styles.colors.success};
      }
      .carousel--2-items {
        .banner__title {
          ${headingFontSizeCss(2, styles)}
        }
      },
      .carousel--3-items {
        .banner__title {
          ${headingFontSizeCss(3, styles)}
        }
      }

      .panel-section__panel {
        background-color: ${styles.colors.light};
        color: ${getTextColorBasedOnBgColor(styles.colors.light)};
        .form__label {
          color: ${getTextColorBasedOnBgColor(styles.colors.light)};
        }
      }
    }
  `,
)

const fontModifiers = [2.4, 1.5, 1, 0.9, 0.8, 0.7]

const headingModifier = (headingSize: number, value: number, floor = true) : number => {
  const modifier = headingSize > 0 && headingSize < fontModifiers.length ? fontModifiers[headingSize - 1] : 1 // default to 1 - incorrect size provided
  return floor ? Math.floor(value * modifier) : value * modifier
}

const headingFontSizeCss = (headingSize: number, styles: ApiStyleType) : string => {
  return `font-size: ${headingModifier(headingSize, styles.typography.headingsFontSize)}px;`
}

const headingLineHeightCss = (headingSize: number, styles: ApiStyleType) : string => {
  return `line-height: ${headingModifier(headingSize, styles.typography.headingsLineHeight, false)};`
}

export default typographyStyles
