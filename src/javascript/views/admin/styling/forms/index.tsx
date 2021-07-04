import React from 'react'
import {
	TabbedConfigFormTab,
  TabbedConfigFormWrapper,
	TabbedConfigFormTabs,
	BORDER_WIDTH_INPUT,
  INPUT_TYPES,
} from 'javascript/components/tabbed-config-form'
import {
  ThemeType,
  CustomThemeType,
} from 'javascript/utils/theme/types/ThemeType'
import { FormType } from 'javascript/utils/theme/types/ApiStylesType'
import Tabs from 'javascript/components/tabs'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const makeSelectors = (key: keyof FormType) => ({
  selector: (theme: ThemeType) => theme.styles.forms[key],
  reverseSelector: (value): CustomThemeType => ({
    styles: {
      forms: {
        [key]: value,
      },
    },
  }),
})

const labelsTab: TabbedConfigFormTab[] = [
	{
		title: 'Labels',
		inputs: {
			labelFontSize: {
				...makeSelectors('labelFontSize'),
				label: 'Font Size',
				type: INPUT_TYPES['range-slider-with-extension'],
				minLimit: 12,
				maxLimit: 18,
			},
			labelColor: {
				...makeSelectors('labelColor'),
				label: 'Color',
				type: 'color-picker',
			},
			labelUppercase: {
				...makeSelectors('labelUppercase'),
				label: 'Text Uppercase',
				type: INPUT_TYPES.checkbox,
			},
		},
}]

const inputsTab: TabbedConfigFormTab[] = [
	{
		title: 'Text',
		inputs: {
			inputFontSize: {
				...makeSelectors('inputFontSize'),
				label: 'Font Size',
				type: INPUT_TYPES['range-slider-with-extension'],
				minLimit: 12,
				maxLimit: 18,
			},
			inputColor: {
				...makeSelectors('inputColor'),
				label: 'Text Color',
				type: 'color-picker',
			},
			inputUppercase: {
				...makeSelectors('inputUppercase'),
				label: 'Text Uppercase',
				type: INPUT_TYPES.checkbox,
			},
		},
	},
	{
		title: 'Background',
		inputs: {
			inputBgColor: {
				...makeSelectors('inputBgColor'),
				label: 'Background Color',
				type: 'color-picker',
			},
			inputRadius: {
				...makeSelectors('inputRadius'),
				type: INPUT_TYPES['range-slider-with-extension'],
				label: 'Border Radius',
				minLimit: 0,
				maxLimit: 20,
			},
			borderColor: {
				...makeSelectors('inputBorderColor'),
				label: 'Border Color',
				type: INPUT_TYPES['color-picker'],
			},
			borderWidth: {
				...makeSelectors('inputBorderWidth'),
				...BORDER_WIDTH_INPUT,
			},
		},
	}
]

const FormsForm = () => {
  const updateFormsConfig = values => useConfiguration('styles').save(values)
  return (
    <TabbedConfigFormWrapper title="cms-forms"
		images={[
			{
				title: 'Setting the font size and colour of labels.',
				path: require('images/theme/styling/forms1.png')
			},
			{
				title: 'Setting the font size and colour of form inputs.',
				path: require('images/theme/styling/forms3.png')
			},
			{
				title: 'Setting the background colour and border around the form inputs. The border radius determines how curved the corners will be.',
				path: require('images/theme/styling/forms2.png')
			}
		]}>
      <Tabs>
        <div title="Labels">
          <TabbedConfigFormTabs
            tabs={labelsTab}
            handleSubmit={updateFormsConfig}
          ></TabbedConfigFormTabs>
        </div>
        <div title="Inputs">
          <TabbedConfigFormTabs
            tabs={inputsTab}
            handleSubmit={updateFormsConfig}
          ></TabbedConfigFormTabs>
        </div>
      </Tabs>
    </TabbedConfigFormWrapper>
  )
}

export default FormsForm
