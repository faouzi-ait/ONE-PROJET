import React from 'react'
import TabbedConfigForm, {
  DEFAULT_FONT_WEIGHT_OPTIONS,
  INPUT_TYPES,
  FONT_FAMILY_INPUT,
  DEFAULT_LINE_HEIGHT_OPTIONS
} from 'javascript/components/tabbed-config-form'
import { TypographyType } from 'javascript/utils/theme/types/ApiStylesType'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const makeSelectors = (key: keyof TypographyType) => ({
  selector: theme => theme.styles.typography[key],
  reverseSelector: value => ({
    styles: {
      typography: {
        [key]: value,
      },
    },
  }),
})

const bodyInputs = {
  [`bodyColor`]: {
    ...makeSelectors(`bodyColor`),
    label: 'Color',
    type: INPUT_TYPES['color-picker'],
  },
  [`bodyFontFamily`]: {
    ...makeSelectors(`bodyFontFamily`),
    ...FONT_FAMILY_INPUT,
  },
  [`bodyFontSize`]: {
    ...makeSelectors(`bodyFontSize`),
    label: 'Font Size',
    type: INPUT_TYPES['range-slider-with-extension'],
    minLimit: 14,
    maxLimit: 24,
  },
  [`bodyFontWeight`]: {
    ...makeSelectors(`bodyFontWeight`),
    label: 'Font Weight',
    type: INPUT_TYPES['select'],
    options: DEFAULT_FONT_WEIGHT_OPTIONS,
  },
  [`bodyLineHeight`]: {
    ...makeSelectors('bodyLineHeight'),
    label: 'Line Height',
    type: INPUT_TYPES['select'],
    options: DEFAULT_LINE_HEIGHT_OPTIONS,
  },
  [`bodyUppercase`]: {
    ...makeSelectors(`bodyUppercase`),
    label: 'Uppercase',
    type: INPUT_TYPES['checkbox'],
  },
}

const headingsInputs = {
  [`headingsColor`]: {
    ...makeSelectors(`headingsColor`),
    label: 'Color',
    type: INPUT_TYPES['color-picker'],
  },
  [`headingsFontFamily`]: {
    ...makeSelectors(`headingsFontFamily`),
    ...FONT_FAMILY_INPUT,
  },
  [`headingsFontSize`]: {
    ...makeSelectors(`headingsFontSize`),
    label: 'Font Size',
    type: INPUT_TYPES['range-slider-with-extension'],
    minLimit: 14,
    maxLimit: 30,
  },
  [`headingsFontWeight`]: {
    ...makeSelectors(`headingsFontWeight`),
    label: 'Font Weight',
    type: INPUT_TYPES['select'],
    options: DEFAULT_FONT_WEIGHT_OPTIONS,
  },
  [`headingsLineHeight`]: {
    ...makeSelectors(`headingsLineHeight`),
    label: 'Line Height',
    type: INPUT_TYPES['select'],
    options: DEFAULT_LINE_HEIGHT_OPTIONS,
  },
  [`headingsUppercase`]: {
    ...makeSelectors(`headingsUppercase`),
    label: 'Uppercase',
    type: INPUT_TYPES['checkbox'],
  },
}

const TypographyForm = () => {
  return (
    <TabbedConfigForm
      title="Typography"
      images={[
        {
          title: 'Body - These styles are for paragraph content for content blocks and for smaller copy throughout the site.',
          path: require('images/theme/styling/typography1.png')
        },
        {
          title: 'Headings - These styles are used for headings for content blocks and headings throughout the site. Some headings will be relative to the size set here.',
          path: require('images/theme/styling/typography2.png')
        },
        {
          title: 'Links - These styles are used when assigning links within content blocks.',
          path: require('images/theme/styling/typography3.png')
        },
      ]}
      tabs={[
        {
          title: 'Body',
          inputs: bodyInputs,
        },
        {
          title: 'Headings',
          inputs: headingsInputs,
        },
        {
          title: 'Links',
          inputs: {
            linksColor: {
              ...makeSelectors('linksColor'),
              label: 'Color',
              type: INPUT_TYPES['color-picker'],
            },
            linksFontWeight: {
              ...makeSelectors('linksFontWeight'),
              type: INPUT_TYPES.select,
              label: 'Font Weight',
              options: DEFAULT_FONT_WEIGHT_OPTIONS,
            },
            linksUnderlined: {
              ...makeSelectors('linksUnderlined'),
              type: INPUT_TYPES.checkbox,
              label: 'Underlined',
            },
          },
        },
      ]}
      handleSubmit={values => useConfiguration('styles').save(values)}
    ></TabbedConfigForm>
  )
}

export default TypographyForm
