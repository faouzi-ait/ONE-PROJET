import React from 'react'
import TabbedConfigForm, {
  DEFAULT_FONT_WEIGHT_OPTIONS,
  DEFAULT_SHADOW_TYPE_OPTIONS,
  BORDER_WIDTH_INPUT,
  INPUT_TYPES,
  FONT_FAMILY_INPUT,
} from 'javascript/components/tabbed-config-form'
import {
  ThemeType,
  CustomThemeType,
} from 'javascript/utils/theme/types/ThemeType'
import { CardType } from 'javascript/utils/theme/types/ApiStylesType'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const makeSelectors = (key: keyof CardType) => ({
  selector: (theme: ThemeType) => theme.styles.cards[key],
  reverseSelector: (value): CustomThemeType => ({
    styles: {
      cards: {
        [key]: value,
      },
    },
  }),
})

const CardsForm = () => {
  return (
    <TabbedConfigForm
      images={[
        {
          title: 'Setting the font family, font weight and font size for the heading on the cards. If unset these will be determined by the default typography settings.',
          path: require('images/theme/styling/cards3.png')
        },
        {
          title: 'Setting a background colour and border around the cards. The border radius determines how curved the corners will be.',
          path: require('images/theme/styling/cards1.png')
        },
        {
          title: 'Setting a shadow around the cards. This can be different when hovering over the card.',
          path: require('images/theme/styling/cards2.png')
        }
      ]}
      tabs={[
        {
          title: 'Headings',
          inputs: {
            headingsColor: {
              ...makeSelectors('headingsColor'),
              label: 'Color',
              type: 'color-picker',
            },
            headingsFontFamily: {
              ...makeSelectors('headingsFontFamily'),
              ...FONT_FAMILY_INPUT,
            },
            headingsFontWeight: {
              ...makeSelectors('headingsFontWeight'),
              type: 'select',
              options: DEFAULT_FONT_WEIGHT_OPTIONS,
              label: 'Font Weight',
            },
            headingsFontSize: {
              ...makeSelectors('headingsFontSize'),
              type: 'range-slider-with-extension',
              label: 'Font Size',
              minLimit: 16,
              maxLimit: 30,
            },
            headingsUppercase: {
              ...makeSelectors('headingsUppercase'),
              type: 'checkbox',
              label: 'Text Uppercase',
            },
          },
        },
        {
          title: 'Background',
          inputs: {
            bgColor: {
              ...makeSelectors('bgColor'),
              label: 'Background Colour',
              type: 'color-picker',
            },
            radius: {
              ...makeSelectors('radius'),
              type: INPUT_TYPES['range-slider-with-extension'],
              label: 'Border Radius',
              minLimit: 0,
              maxLimit: 20,
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
          }
        },
        {
          title: 'Shadows',
          inputs: {
            shadowType: {
              ...makeSelectors('shadowType'),
              type: 'select',
              options: DEFAULT_SHADOW_TYPE_OPTIONS,
              label: 'Shadow Type',
            },
            shadowTypeHover: {
              ...makeSelectors('shadowTypeHover'),
              type: 'select',
              options: DEFAULT_SHADOW_TYPE_OPTIONS,
              label: 'Shadow Hover Type',
            },
            shadowColor: {
              ...makeSelectors('shadowColor'),
              type: 'color-picker',
              label: 'Shadow Colour',
            },
            shadowColorHover: {
              ...makeSelectors('shadowColorHover'),
              type: 'color-picker',
              label: 'Shadow Hover Colour',
            },
          },
        },
      ]}
      title="Cards"
      handleSubmit={values => useConfiguration('styles').save(values)}
    ></TabbedConfigForm>
  )
}

export default CardsForm
