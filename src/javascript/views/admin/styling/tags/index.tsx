import React from 'react'
import TabbedConfigForm, {
  INPUT_TYPES,
  FONT_FAMILY_INPUT,
} from 'javascript/components/tabbed-config-form'
import { TagType } from 'javascript/utils/theme/types/ApiStylesType'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const makeSelectors = (key: keyof TagType) => ({
  selector: theme => theme.styles.tags[key],
  reverseSelector: value => ({
    styles: {
      tags: {
        [key]: value,
      },
    },
  }),
})

const TagsForm = () => {
  return (
    <TabbedConfigForm
      subtitle={`Displayed on cards and on programme pages for metadata`}
      images={[
        {
          title: 'Setting the colour of the text on tags. This can be different when hovering over the tag.',
          path: require('images/theme/styling/tags1.png')
        },
        {
          title: 'Setting the background colour of the tags. This can be different when hovering over the tag.',
          path: require('images/theme/styling/tags2.png')
        },
        {
          title: 'Setting a border around the tags. This can be different when hovering over the card. The border radius determines how curved the corners will be.',
          path: require('images/theme/styling/tags3.png')
        }
      ]}
      tabs={[
        {
          title: 'Text',
          inputs: {
            color: {
              ...makeSelectors('color'),
              label: 'Text Colour',
              type: INPUT_TYPES['color-picker'],
            },
            colorHover: {
              ...makeSelectors('colorHover'),
              label: 'Text Hover Colour',
              type: INPUT_TYPES['color-picker'],
            },
            fontFamily: {
              ...makeSelectors('fontFamily'),
              ...FONT_FAMILY_INPUT,
            },
            fontSize: {
              ...makeSelectors('fontSize'),
              label: 'Font Size',
              minLimit: 12,
              maxLimit: 20,
              type: INPUT_TYPES['range-slider-with-extension'],
            },
            fontWeight: {
              ...makeSelectors('fontWeight'),
              type: INPUT_TYPES.select,
              label: 'Font Weight',
              options: [
                { label: 'Normal', value: 'normal' },
                { label: 'Bold', value: 'bold' },
              ],
            },
            uppercase: {
              ...makeSelectors('uppercase'),
              type: INPUT_TYPES.checkbox,
              label: 'Uppercase',
            }
          },
        },
        {
          title: 'Background',
          inputs: {
            bgColor: {
              ...makeSelectors('bgColor'),
              label: 'Background Colour',
              type: INPUT_TYPES['color-picker'],
            },
            bgColorHover: {
              ...makeSelectors('bgColorHover'),
              label: 'Background Hover Color',
              type: INPUT_TYPES['color-picker'],
            },
            borderColor: {
              ...makeSelectors('borderColor'),
              type: INPUT_TYPES['color-picker'],
              label: 'Border Colour',
            },
            borderColorHover: {
              ...makeSelectors('borderColorHover'),
              type: INPUT_TYPES['color-picker'],
              label: 'Border Hover Colour',
            },
            borderWidth: {
              ...makeSelectors('borderWidth'),
              type: INPUT_TYPES['range-slider-with-extension'],
              label: 'Border Width',
              minLimit: 0,
              maxLimit: 6,
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
      ]}
      title="Tags"
      handleSubmit={values => useConfiguration('styles').save(values)}
    ></TabbedConfigForm>
  )
}

export default TagsForm
