import React from 'react'
import TabbedConfigForm, {
  BORDER_WIDTH_INPUT,
  FONT_FAMILY_INPUT,
  FONT_SIZE_INPUT,
  INPUT_TYPES,
} from 'javascript/components/tabbed-config-form'
import { TabType } from 'javascript/utils/theme/types/ApiStylesType'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const makeSelectors = (key: keyof TabType) => ({
  selector: theme => theme.styles.tabs[key],
  reverseSelector: value => ({
    styles: {
      tabs: {
        [key]: value,
      },
    },
  }),
})

const TabsForm = () => {
  return (
    <>
      <TabbedConfigForm
        title="Tabs"
        images={[
          {
            title: 'Setting the background colour and text colour of the tabs. This is different for the selected tab.',
            path: require('images/theme/styling/tabs1.png')
          },
          {
            title: 'Setting a border around the tabs. The border radius determines how curved the corners will be.',
            path: require('images/theme/styling/tabs2.png')
          }
        ]}
        tabs={[
          {
            title: 'Colors',
            inputs: {
              color: {
                ...makeSelectors('color'),
                label: 'Text Colour',
                type: INPUT_TYPES['color-picker'],
              },
              bgColor: {
                ...makeSelectors('bgColor'),
                label: 'Background Colour',
                type: INPUT_TYPES['color-picker'],
              },
              colorActive: {
                ...makeSelectors('colorActive'),
                label: 'Active Text Colour',
                type: INPUT_TYPES['color-picker'],
              },
              bgColorActive: {
                ...makeSelectors('bgColorActive'),
                label: 'Active Background Colour',
                type: INPUT_TYPES['color-picker'],
              },
            },
          },
          {
            title: 'Border',
            inputs: {
              borderColor: {
                ...makeSelectors('borderColor'),
                label: 'Border Color',
                type: INPUT_TYPES['color-picker'],
              },
              borderWidth: {
                ...makeSelectors('borderWidth'),
                ...BORDER_WIDTH_INPUT,
              },
              radius: {
                ...makeSelectors('radius'),
                type: INPUT_TYPES['range-slider-with-extension'],
                label: 'Border Radius',
                minLimit: 0,
                maxLimit: 20,
              },
            },
          },
          {
            title: 'Text',
            inputs: {
              uppercase: {
                ...makeSelectors('uppercase'),
                label: 'Text Uppercase',
                type: INPUT_TYPES.checkbox,
              },
              fontSize: {
                ...makeSelectors('fontSize'),
                ...FONT_SIZE_INPUT,
              },
              fontFamily: {
                ...makeSelectors('fontFamily'),
                ...FONT_FAMILY_INPUT,
              },
            },
          },
        ]}
        handleSubmit={values => useConfiguration('styles').save(values)}
      ></TabbedConfigForm>
    </>
  )
}

export default TabsForm
