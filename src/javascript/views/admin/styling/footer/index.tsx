import React from 'react'
import TabbedConfigForm, {
  BORDER_WIDTH_INPUT,
  FONT_SIZE_INPUT,
  INPUT_TYPES,
} from 'javascript/components/tabbed-config-form'
import { FooterType } from 'javascript/utils/theme/types/ApiStylesType'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const makeSelectors = (key: keyof FooterType) => {
  return {
    selector: (theme) => theme.styles.footer[key],
    reverseSelector: (value) => ({
      styles: {
        footer: {
          [key]: value,
        }
      }
    }),
  }
}

const FooterForm = () => {
  return (
    <TabbedConfigForm
      title="Footer"
      images={[
        {
          title: 'Setting a background colour and border above the footer.',
          path: require('images/theme/styling/footer1.png')
        },
        {
          title: 'Setting the colour of text and links in the footer.',
          path: require('images/theme/styling/footer2.png')
        }
      ]}
      tabs={[
        {
          title: 'Background',
          inputs: {
            bgColor: {
              ...makeSelectors('bgColor'),
              label: 'Background Colour',
              type: INPUT_TYPES['color-picker'],
            },
            borderColor: {
              ...makeSelectors('borderColor'),
              label: 'Border Colour',
              type: INPUT_TYPES['color-picker'],
            },
            borderWidth: {
              ...makeSelectors('borderWidth'),
              ...BORDER_WIDTH_INPUT,
            },
          },
        },
        {
          title: 'Text',
          inputs: {
            copyColor: {
              ...makeSelectors('copyColor'),
              label: 'Text Colour',
              type: INPUT_TYPES['color-picker'],
            },
            copyFontSize: {
              ...makeSelectors('copyFontSize'),
              ...FONT_SIZE_INPUT,
              label: 'Text Font Size',
            },
            linksColor: {
              ...makeSelectors('linksColor'),
              label: 'Links Text Colour',
              type: INPUT_TYPES['color-picker'],
            },
            linksColorHover: {
              ...makeSelectors('linksColorHover'),
              label: 'Links Text Hover Colour',
              type: INPUT_TYPES['color-picker'],
            },
          },
        },
      ]}
      handleSubmit={values => useConfiguration('styles').save(values)}
    ></TabbedConfigForm>
  )
}

export default FooterForm
