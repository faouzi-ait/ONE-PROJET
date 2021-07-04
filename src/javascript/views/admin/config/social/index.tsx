import React from 'react'
import Meta from 'react-document-meta'

import { ConfigSaveButton } from 'javascript/components/tabbed-config-form'
import FormControl from 'javascript/components/form-control'
import Icon from 'javascript/components/icon'
import PageHeader from 'javascript/components/admin/layout/page-header'

import useConfiguration from 'javascript/utils/hooks/use-configuration'
import useThemeForm from 'javascript/utils/hooks/use-theme-form'

import 'stylesheets/core/components/sharer'
import { ApiFeatureType, ShareIconType } from 'javascript/utils/theme/types/ApiFeaturesType'

const shareOptions: {
  label: string
  value: ApiFeatureType['shareIcons'][0]['name']
}[] = [
  {
    label: 'Facebook',
    value: 'facebook',
  },
  {
    label: 'Twitter',
    value: 'twitter',
  },
  {
    label: 'Instagram',
    value: 'instagram',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin',
  },
]

const ConfigSocialForm = props => {
  const {
    haveChangesBeenMade,
    makeOnChange,
    onSubmit,
    submitStatus,
    values,
  } = useThemeForm<{ shareIcons: ApiFeatureType['shareIcons']}>({
    inputs: {
      shareIcons: {
        selector: theme => theme.features.shareIcons,
        reverseSelector: shareIcons => ({
          features: {
            shareIcons,
          },
        }),
      },
    },
    handleSubmit: values => {
      const iconConfig = {
        facebook: {
          width: 11
        },
      }
      const update = values.features.shareIcons.map((icon) => ({
        ...icon,
        ...iconConfig[icon.name]
      }))
      return useConfiguration('features').save({ features: { shareIcons: update }})
    },
  })

  const onChange = (
    name: ApiFeatureType['shareIcons'][0]['name'],
    newValue,
  ) => {

    const shareIconsArray = values.shareIcons

    if (!newValue) {
      makeOnChange('shareIcons')(
        shareIconsArray.filter(icon => icon.name !== name),
      )
    } else if (!shareIconsArray.some(icon => icon.name === name)) {

      makeOnChange('shareIcons')([
        ...shareIconsArray,
        { name, url: newValue },
      ] as ShareIconType[])
    } else {
      makeOnChange('shareIcons')(
        shareIconsArray.map(icon => {
          if (icon.name !== name) {
            return icon
          }
          return {
            ...icon,
            url: newValue,
          }
        }),
      )
    }
  }

  return (
    <Meta>
      <main>
        <PageHeader title="Social options" />
        <div className="container">
          <form className="cms-form cms-form--large" onSubmit={onSubmit}>
            {shareOptions.map(s => {
              const shareIconUrl = values.shareIcons.find(({ name }) => name === s.value)
              const value = shareIconUrl ? shareIconUrl.url : ''
              return (
                <FormControl
                  type="text"
                  label={s.label}
                  name={s.value}
                  value={value || ''}
                  icon={
                    <span className={`sharer__link sharer__link--${s.value}`}>
                      <Icon
                        classes="sharer__icon"
                        id={`i-${s.value}`}
                        width={s.value === 'facebook' ? '11' : '22'}
                        height="22"
                      />
                    </span>
                  }
                  onChange={e => {
                    onChange(s.value, e.target.value)
                  }}
                />
              )
            })}
            <div className="cms-form__control cms-form__control--actions">
              <ConfigSaveButton
                haveChangesBeenMade={haveChangesBeenMade}
                submitStatus={submitStatus}
                buttonText="Save Config"
              />
            </div>
          </form>
        </div>
      </main>
    </Meta>
  )
}

export default ConfigSocialForm
