import React from 'react'
import TabbedConfigForm, {
  INPUT_TYPES,
} from 'javascript/components/tabbed-config-form'
import { ModalType } from 'javascript/utils/theme/types/ApiStylesType'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const makeSelectors = (key: keyof ModalType) => ({
  selector: theme => theme.styles.modals[key],
  reverseSelector: value => ({
    styles: {
      modals: {
        [key]: value,
      },
    },
  }),
})

const ModalsForm = () => {
  return (
    <>
      <TabbedConfigForm
        title="Modals"
        images={[
          {
            title: 'Setting the background colour that the modal sits on. The background can be slightly transparent as above.',
            path: require('images/theme/styling/modals1.png')
          },
          {
            title: 'Setting the background colour that the modal sits on. The background can be opaque as above.',
            path: require('images/theme/styling/modals2.png')
          }
        ]}
        tabs={[
          {
            title: 'Background',
            inputs: {
              backgroundColor: {
                ...makeSelectors('backgroundColor'),
                label: 'Background Color',
                type: INPUT_TYPES['color-picker'],
              },
              backgroundOpacity: {
                ...makeSelectors('backgroundOpacity'),
                label: 'Opacity',
                type: INPUT_TYPES['range-slider'],
                minLimit: 0,
                maxLimit: 100
              },
            },
          },
        ]}
        handleSubmit={values => useConfiguration('styles').save(values)}
      ></TabbedConfigForm>
    </>
  )
}

export default ModalsForm
