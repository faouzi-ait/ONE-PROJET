import React from 'react'
import TabbedConfigForm, {
  INPUT_TYPES,
} from 'javascript/components/tabbed-config-form'
import {
  ThemeType,
  CustomThemeType,
} from 'javascript/utils/theme/types/ThemeType'
import { NavigationType } from 'javascript/utils/theme/types/ApiStylesType'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const makeSelectors = (key: keyof NavigationType) => ({
  selector: (theme: ThemeType) => theme.styles.navigation[key],
  reverseSelector: (value): CustomThemeType => ({
    styles: {
      navigation: {
        [key]: value,
      },
    },
  }),
})

const NavigationForm = () => {
  return (
    <TabbedConfigForm
      title="Navigation"
      images={[
        {
          title: 'Setting the background colour and the divider lines of the navigation menu.',
          path: require('images/theme/styling/navigation1.png')
        },
        {
          title: 'Setting the colour of the links. This can be different when hovering over the link. The spacing between links can be adjusted.',
          path: require('images/theme/styling/navigation1.png')
        }
      ]}
      tabs={[
        {
          title: 'Colors',
          inputs: {
            bgColor: {
              ...makeSelectors('bgColor'),
              label: 'Background Color',
              type: INPUT_TYPES['color-picker'],
            },
            dividerColor: {
              ...makeSelectors('dividerColor'),
              label: 'Divider Color',
              type: INPUT_TYPES['color-picker'],
            },
          },
        },
        {
          title: 'Links',
          inputs: {
            linksFontSize: {
              ...makeSelectors('linksFontSize'),
              label: 'Font Size',
              type: INPUT_TYPES['range-slider-with-extension'],
              minLimit: 12,
              maxLimit: 30,
            },
            linksSpacing: {
              ...makeSelectors('linksSpacing'),
              label: 'Link Spacing',
              type: INPUT_TYPES['range-slider-with-extension'],
              minLimit: 2,
              maxLimit: 20,
            },
            linksColor: {
              ...makeSelectors('linksColor'),
              label: 'Link Color',
              type: 'color-picker',
            },
            linksColorHover: {
              ...makeSelectors('linksColorHover'),
              label: 'Link Color Hover',
              type: 'color-picker',
            }
          },
        },
      ]}
      handleSubmit={values => useConfiguration('styles').save(values)}
    ></TabbedConfigForm>
  )
}

export default NavigationForm
