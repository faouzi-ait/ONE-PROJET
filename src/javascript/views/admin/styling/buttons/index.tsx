import React from 'react'
import {
  DEFAULT_FONT_WEIGHT_OPTIONS,
  DEFAULT_SHADOW_TYPE_OPTIONS,
  TabbedConfigFormTab,
  TabbedConfigFormWrapper,
  TabbedConfigFormTabs,
  FONT_FAMILY_INPUT,
} from 'javascript/components/tabbed-config-form'
import { ButtonType }from 'javascript/utils/theme/types/ApiStylesType'
import {
  CustomThemeType,
  ThemeType,
} from 'javascript/utils/theme/types/ThemeType'
import Tabs from 'javascript/components/tabs'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const makeSelectors = (key: keyof ButtonType) => ({
  selector: (theme: ThemeType) => theme.styles.buttons[key],
  reverseSelector: (value): CustomThemeType => ({
    styles: {
      buttons: {
        [key]: value,
      },
    },
  }),
})

const primaryTabs: TabbedConfigFormTab[] = [
  {
    title: 'Colors',
    inputs: {
      primaryColor: {
        ...makeSelectors('primaryColor'),
        type: 'color-picker',
        label: 'Text Colour',
      },
      primaryColorHover: {
        ...makeSelectors('primaryColorHover'),
        type: 'color-picker',
        label: 'Text Hover Colour',
      },

      primaryBgColor: {
        ...makeSelectors('primaryBgColor'),
        type: 'color-picker',
        label: 'Background Colour',
      },
      primaryBgColorHover: {
        ...makeSelectors('primaryBgColorHover'),
        type: 'color-picker',
        label: 'Background Hover Colour',
      },
    },
  },
  {
    title: 'Text',
    inputs: {
      primaryFontFamily: {
        ...makeSelectors('primaryFontFamily'),
        ...FONT_FAMILY_INPUT,
      },
      primaryFontWeight: {
        ...makeSelectors('primaryFontWeight'),
        type: 'select',
        options: DEFAULT_FONT_WEIGHT_OPTIONS,
        label: 'Font Weight',
      },
      primaryFontSize: {
        ...makeSelectors('primaryFontSize'),
        type: 'range-slider-with-extension',
        label: 'Font Size',
        minLimit: 12,
        maxLimit: 30,
      },
      primaryUppercase: {
        ...makeSelectors('primaryUppercase'),
        type: 'checkbox',
        label: 'Text Uppercase',
      },
    },
  },
  {
    title: 'Borders',
    inputs: {
      primaryRadius: {
        ...makeSelectors('primaryRadius'),
        type: 'range-slider-with-extension',
        minLimit: 0,
        maxLimit: 20,
        label: 'Border Radius',
      },
      primaryBorderColor: {
        ...makeSelectors('primaryBorderColor'),
        type: 'color-picker',
        label: 'Border Colour',
      },
      primaryBorderColorHover: {
        ...makeSelectors('primaryBorderColorHover'),
        type: 'color-picker',
        label: 'Border Hover Colour',
      },
      primaryBorderWidth: {
        ...makeSelectors('primaryBorderWidth'),
        type: 'range-slider-with-extension',
        minLimit: 0,
        maxLimit: 5,
        label: 'Border Width',
      },
    },
  },
  {
    title: 'Shadows',
    inputs: {
      primaryShadowType: {
        ...makeSelectors('primaryShadowType'),
        type: 'select',
        options: DEFAULT_SHADOW_TYPE_OPTIONS,
        label: 'Shadow Type',
      },
      primaryShadowTypeHover: {
        ...makeSelectors('primaryShadowTypeHover'),
        type: 'select',
        options: DEFAULT_SHADOW_TYPE_OPTIONS,
        label: 'Shadow Hover Type',
      },
      primaryShadowColor: {
        ...makeSelectors('primaryShadowColor'),
        type: 'color-picker',
        label: 'Shadow Colour',
      },
      primaryShadowColorHover: {
        ...makeSelectors('primaryShadowColorHover'),
        type: 'color-picker',
        label: 'Shadow Hover Colour',
      },
    },
  },
]

const secondaryTabs: TabbedConfigFormTab[] = [
  {
    title: 'Colors',
    inputs: {
      secondaryColor: {
        ...makeSelectors('secondaryColor'),
        type: 'color-picker',
        label: 'Text Colour',
      },
      secondaryColorHover: {
        ...makeSelectors('secondaryColorHover'),
        type: 'color-picker',
        label: 'Text Hover Colour',
      },

      secondaryBgColor: {
        ...makeSelectors('secondaryBgColor'),
        type: 'color-picker',
        label: 'Background Colour',
      },
      secondaryBgColorHover: {
        ...makeSelectors('secondaryBgColorHover'),
        type: 'color-picker',
        label: 'Background Hover Colour',
      },
    },
  },
  {
    title: 'Text',
    inputs: {
      secondaryFontFamily: {
        ...makeSelectors('secondaryFontFamily'),
        ...FONT_FAMILY_INPUT,
      },
      secondaryFontWeight: {
        ...makeSelectors('secondaryFontWeight'),
        type: 'select',
        options: DEFAULT_FONT_WEIGHT_OPTIONS,
        label: 'Font Weight',
      },
      secondaryFontSize: {
        ...makeSelectors('secondaryFontSize'),
        type: 'range-slider-with-extension',
        label: 'Font Size',
        minLimit: 12,
        maxLimit: 30,
      },
      secondaryUppercase: {
        ...makeSelectors('secondaryUppercase'),
        type: 'checkbox',
        label: 'Text Uppercase',
      },
    },
  },
  {
    title: 'Borders',
    inputs: {
      secondaryRadius: {
        ...makeSelectors('secondaryRadius'),
        type: 'range-slider-with-extension',
        minLimit: 0,
        maxLimit: 20,
        label: 'Border Radius',
      },
      secondaryBorderColor: {
        ...makeSelectors('secondaryBorderColor'),
        type: 'color-picker',
        label: 'Border Colour',
      },
      secondaryBorderColorHover: {
        ...makeSelectors('secondaryBorderColorHover'),
        type: 'color-picker',
        label: 'Border Hover Colour',
      },
      secondaryBorderWidth: {
        ...makeSelectors('secondaryBorderWidth'),
        type: 'range-slider-with-extension',
        minLimit: 0,
        maxLimit: 5,
        label: 'Border Width',
      },
    },
  },
  {
    title: 'Shadows',
    inputs: {
      secondaryShadowType: {
        ...makeSelectors('secondaryShadowType'),
        type: 'select',
        options: DEFAULT_SHADOW_TYPE_OPTIONS,
        label: 'Shadow Type',
      },
      secondaryShadowTypeHover: {
        ...makeSelectors('secondaryShadowTypeHover'),
        type: 'select',
        options: DEFAULT_SHADOW_TYPE_OPTIONS,
        label: 'Shadow Hover Type',
      },
      secondaryShadowColor: {
        ...makeSelectors('secondaryShadowColor'),
        type: 'color-picker',
        label: 'Shadow Colour',
      },
      secondaryShadowColorHover: {
        ...makeSelectors('secondaryShadowColorHover'),
        type: 'color-picker',
        label: 'Shadow Hover Colour',
      },
    },
  },
]

const ButtonsForm = () => {
  const updateButtonsConfig = values => useConfiguration('styles').save(values)
  return (
    <TabbedConfigFormWrapper
      title="Buttons"
      images={[
        {
          title: 'Setting the colour of the text on buttons. This can be different when hovering over the button.',
          path: require('images/theme/styling/buttons2.png')
        },
        {
          title: 'Setting the background colour of the buttons. This can be different when hovering over the button.',
          path: require('images/theme/styling/buttons1.png')
        },
        {
          title: 'Setting the border around the buttons. This can be different when hovering over the button. The border radius determines how curved the corners will be.',
          path: require('images/theme/styling/buttons3.png')
        },
        {
          title: 'Setting a shadow around the buttons. This can be different when hovering over the button.',
          path: require('images/theme/styling/buttons4.png')
        },
        {
          title: 'Primary Buttons - These are used on banners, text content blocks, filtering the catalogue, list actions and on forms across the site',
          path: require('images/theme/styling/buttons5.png')
        },
        {
          title: 'Secondary Buttons - These are used on content blocks and meetings',
          path: require('images/theme/styling/buttons6.png')
        },
      ]}>
      <Tabs>
        <div title="Primary">
          <TabbedConfigFormTabs
            tabs={primaryTabs}
            handleSubmit={updateButtonsConfig}
          ></TabbedConfigFormTabs>
        </div>
        <div title="Secondary">
          <TabbedConfigFormTabs
            tabs={secondaryTabs}
            handleSubmit={updateButtonsConfig}
          ></TabbedConfigFormTabs>
        </div>
      </Tabs>
    </TabbedConfigFormWrapper>
  )
}

export default ButtonsForm
