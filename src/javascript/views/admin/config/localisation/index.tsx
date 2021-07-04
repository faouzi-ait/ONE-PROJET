import React, { useState } from 'react'
import Meta from 'react-document-meta'
import upperFirst from 'lodash/upperFirst'
import pluralize from 'pluralize'

import { ConfigSaveButton } from 'javascript/components/tabbed-config-form'
import FormControl from 'javascript/components/form-control'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Icon from 'javascript/components/icon'
import { Localisation } from 'javascript/config/features'
// HOC
import useThemeForm, {
  InputMatrix,
} from 'javascript/utils/hooks/use-theme-form'
import { LocalisationType } from 'javascript/utils/theme/types/LocalisationType'
import useConfiguration from 'javascript/utils/hooks/use-configuration'

const pathAsPlural = ['programme', 'series', 'list', 'productionCompany', 'quality', 'asset', 'genre']
const noPathKey = ['accountManager']

const labelMap: {
  [K in keyof LocalisationType]?: string
} = {
  productionCompany: 'Production Company',
  programmeAlternativeTitle: 'Programme Alternative Title',
  restricted: 'Restricted Access',
  accountManager: 'Account Manager',
  programmeType: 'Programme Type'
}

const makeSelectors = (key: keyof LocalisationType) => ({
  selector: theme => theme.localisation[key],
  reverseSelector: value => ({
    localisation: {
      [key]: value,
    },
  }),
  shouldLiveUpdate: false
})

const ConfigLocalisationForm = props => {

  const [apiErrors, setApiErrors] = useState({})

  const {
    haveChangesBeenMade,
    makeInputProps,
    makeOnChange,
    onSubmit,
    resetToDefault,
    submitStatus,
    values,
  } = useThemeForm<LocalisationType>({
    inputs: Object.keys(Localisation).reduce(
      (obj, key: keyof typeof Localisation) => ({
        ...obj,
        [key]: makeSelectors(key),
      }),
      {} as InputMatrix<LocalisationType>,
    ),
    handleSubmit: (values) => new Promise(async (resolve, reject) => {
      const apiErrorUpdate = {}
      try {
        const response = await useConfiguration('localisation').save(values)
        resolve(response)
      } catch ({ data: errorMsgs }) {
        const changedLocalisation = values.localisation
        errorMsgs.forEach((error) => {
          if (Array.isArray(error.message)) {
            error.message.forEach((slugUsedErr) => {
              const erroredPath = Object.keys(slugUsedErr)[0]
              Object.keys(changedLocalisation).forEach((formKey) => {
                if (changedLocalisation[formKey].path === erroredPath) {
                  apiErrorUpdate[formKey] = 'Slug is already taken'
                }
              })
            })
          }
        })
      } finally {
        setApiErrors(apiErrorUpdate)
      }
    })
  })

  let whitelist: (keyof LocalisationType)[] = [
    'programme',
    'catalogue',
    'series',
    'genre',
    'list',
    'video',
    'restricted',
    'productionCompany',
    'quality',
  ]
  {props.theme.features.passport.admin && whitelist.push('passport')}
  {props.theme.features.dashboard.admin && whitelist.push('dashboard')}
  {props.theme.features.assets && whitelist.push('asset')}
  {props.theme.features.accountManager && whitelist.push('accountManager')}
  {props.theme.features.programmeTypes.enabled && whitelist.push('programmeType')}
  {props.theme.features.teamMembers && whitelist.push('team')}

  const makeLocalisationOnChange = (key: keyof LocalisationType) => e => {
    const value = pathAsPlural.includes(key) ? pluralize(e.target.value) : e.target.value
    const object = {
      upper: upperFirst(e.target.value),
      lower: `${e.target.value}`.toLowerCase()
    }
    if(!noPathKey.includes(key)) {
      object['path'] = `${value}`.toLowerCase().replace(/[^\w\s]/gi, '').replace(/ /g, '-')
    }
    makeOnChange(key)(object)
  }

  return (
    <Meta>
      <main>
        <PageHeader title="Localisation" />
        <div className="container">
          <form className="cms-form cms-form--large" onSubmit={onSubmit}>
            <div className="grid grid--two">
              {Object.keys(values)
                .filter((key: keyof LocalisationType) =>
                  whitelist.includes(key),
                )
                .filter((key: keyof LocalisationType) => {
                  // @ts-ignore
                  return typeof values[key].upper !== 'undefined'
                })
                .sort((a, b) => a.localeCompare(b))
                .map((key: keyof LocalisationType) => (
                      <FormControl
                        type="text"
                        label={labelMap[key] || upperFirst(key)}
                        {...makeInputProps(key)}
                        // @ts-ignore
                        value={values[key].upper}
                        error={apiErrors[key]}
                        onChange={makeLocalisationOnChange(key)}
                      >
                        <div className="config-form__form-control">
                          <div className="config-form__reset-form-control" onClick={() => resetToDefault(key)}>
                            <Icon width="20" height="20" id="i-reset" viewBox="0 0 200 200" className="config-form__reset-icon--dark" />
                          </div>
                        </div>
                      </FormControl>

                    ))}

            </div>
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

export default ConfigLocalisationForm
