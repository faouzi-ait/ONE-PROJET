import React from 'react'
import TabbedConfigForm, {
  INPUT_TYPES,
  BORDER_WIDTH_INPUT,
  SHADOW_TYPE_INPUT,
} from 'javascript/components/tabbed-config-form'
import { HeaderType } from 'javascript/utils/theme/types/ApiStylesType'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const makeSelectors = (key: keyof HeaderType) => {
  return {
    selector: theme => theme.styles.header[key],
    reverseSelector: value => ({
      styles: {
        header: {
          [key]: value,
        },
      },
    }),
  }
}

const HeaderForm = () => {
  return (
    <TabbedConfigForm
      title="Header"
      images={[
        {
          title: 'Setting a background colour and border below the header.',
          path: require('images/theme/styling/header1.png')
        },
        {
          title: 'Setting a shadow underneath the header.',
          path: require('images/theme/styling/header2.png')
        },
        {
          title: 'Setting the colour of text in the header.',
          path: require('images/theme/styling/header3.png')
        },
        {
          title: 'Setting the colour of icons in the header. If unset, these will be determind by the brand colour.',
          path: require('images/theme/styling/header4.png')
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
            shadowType: {
              ...makeSelectors('shadowType'),
              ...SHADOW_TYPE_INPUT,
            },
            shadowColor: {
              ...makeSelectors('shadowColor'),
              label: 'Shadow Colour',
              type: INPUT_TYPES['color-picker'],
            },
          },
        },
        {
          title: 'Text',
          inputs: {
            linksColor: {
              ...makeSelectors('linksColor'),
              label: 'Text Colour',
              type: INPUT_TYPES['color-picker'],
            },
            linksColorHover: {
              ...makeSelectors('linksColorHover'),
              label: 'Links Text Hover Colour',
              type: INPUT_TYPES['color-picker'],
            },
            iconColor: {
              ...makeSelectors('iconColor'),
              label: 'Icon Colour',
              type: INPUT_TYPES['color-picker'],
            },
            iconColorHover: {
              ...makeSelectors('iconColorHover'),
              label: 'Icon Hover Colour',
              type: INPUT_TYPES['color-picker'],
            },
          },
        },
      ]}
      handleSubmit={values => useConfiguration('styles').save(values)}
    ></TabbedConfigForm>
  )
}

export default HeaderForm
