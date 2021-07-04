import React from 'react'
import TabbedConfigForm, {
  FONT_SIZE_INPUT,
  INPUT_TYPES,
} from 'javascript/components/tabbed-config-form'
import { BannerType } from 'javascript/utils/theme/types/ApiStylesType'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const makeSelectors = (key: keyof BannerType) => ({
  selector: theme => theme.styles.banners[key],
  reverseSelector: value => ({
    styles: {
      banners: {
        [key]: value,
      },
    },
  }),
})

const BannersForm = () => {
  return (
    <>
      <TabbedConfigForm
        title="Banners"
        images={[
          {
            title: 'Setting the colour and font size for headings and copy for all banners.',
            path: require('images/theme/styling/banners1.png')
          }
        ]}
        tabs={[
          {
            title: 'Overlay',
            inputs: {
              overlayColor: {
                ...makeSelectors('overlayColor'),
                label: 'Overlay Color',
                type: INPUT_TYPES['color-picker'],
              },
              overlayOpacity: {
                ...makeSelectors('overlayOpacity'),
                label: 'Overlay Opacity',
                type: INPUT_TYPES['range-slider'],
                minLimit: 0,
                maxLimit: 100
              },
            },
          },
          {
            title: 'Headings',
            inputs: {
              headingsFontSize: {
                ...makeSelectors('headingsFontSize'),
                ...FONT_SIZE_INPUT,
              },
              headingsColor: {
                ...makeSelectors('headingsColor'),
                label: 'Text Color',
                type: INPUT_TYPES['color-picker'],
              },
            },
          },
          {
            title: 'Copy',
            inputs: {
              copyFontSize: {
                ...makeSelectors('copyFontSize'),
                ...FONT_SIZE_INPUT,
              },
              copyColor: {
                ...makeSelectors('copyColor'),
                label: 'Text Color',
                type: INPUT_TYPES['color-picker'],
              },
            },
          }
        ]}
        handleSubmit={values => useConfiguration('styles').save(values)}
      ></TabbedConfigForm>
    </>
  )
}

export default BannersForm
