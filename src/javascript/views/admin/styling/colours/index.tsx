import React from 'react'
import TabbedConfigForm, { INPUT_TYPES } from 'javascript/components/tabbed-config-form'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const ColoursForm = () => {
  return (
    <TabbedConfigForm
      title="Colours"
      images={[
        {
          title: 'Brand Colour - This is used to highlight many actions across the site. It will be used for primary buttons if no button styles are set.',
          path: require('images/theme/styling/colors1.png')
        },
        {
          title: 'Background Colour - This is used for the main background of the site.',
          path: require('images/theme/styling/colors2.png')
        },
        {
          title: 'Light Colour - This is used by default as the background colour for content blocks',
          path: require('images/theme/styling/colors3.png')
        },
        {
          title: 'Shaded Colour - This is used for areas to standout such as the programme search. It can be used as the background colour for content blocks by selecting the shaded background.',
          path: require('images/theme/styling/colors4.png')
        },
        {
          title: 'Error Colour - This is used on forms to highlight errors to the user so it needs to stand out.',
          path: require('images/theme/styling/colors5.png')
        },
        {
          title: 'Success Colour - This is used to highlight a successful action across the site e.g adding to a list.',
          path: require('images/theme/styling/colors6.png')
        }
      ]}
      handleSubmit={values => useConfiguration('styles').save(values)}
      tabs={[
        {
          title: 'Colours',
          inputs: {
            brand: {
              label: 'Brand',
              type: INPUT_TYPES['color-picker'],
              selector: theme => theme.styles.colors.brand,
              reverseSelector: brand => ({
                styles: {
                  colors: {
                    brand,
                  },
                },
              }),
            },
            background: {
              label: 'Background',
              type: INPUT_TYPES['color-picker'],
              selector: theme => theme.styles.colors.background,
              reverseSelector: background => ({
                styles: {
                  colors: {
                    background,
                  },
                },
              }),
            },
            light: {
              label: 'Light',
              type: INPUT_TYPES['color-picker'],
              selector: theme => theme.styles.colors.light,
              reverseSelector: light => ({
                styles: {
                  colors: {
                    light,
                  },
                },
              }),
            },
            shaded: {
              label: 'Shaded',
              type: INPUT_TYPES['color-picker'],
              selector: theme => theme.styles.colors.shaded,
              reverseSelector: shaded => ({
                styles: {
                  colors: {
                    shaded,
                  },
                },
              }),
            },
            error: {
              label: 'Error',
              type: INPUT_TYPES['color-picker'],
              selector: theme => theme.styles.colors.error,
              reverseSelector: error => ({
                styles: {
                  colors: {
                    error,
                  },
                },
              }),
            },
            success: {
              label: 'Success',
              type: INPUT_TYPES['color-picker'],
              selector: theme => theme.styles.colors.success,
              reverseSelector: success => ({
                styles: {
                  colors: {
                    success,
                  },
                },
              }),
            },
          },
        },
      ]}
    ></TabbedConfigForm>
  )
}

export default ColoursForm
