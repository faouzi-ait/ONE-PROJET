import { Formik } from 'formik'
import ActivityIndicator from 'javascript/components/activity-indicator'
import FormControl from 'javascript/components/form-control'
import Button from 'javascript/components/button'
import { WistiaAccountType } from 'javascript/types/ModelTypes'
import {
  createOneByModel,
  deleteOneByModel,
  updateOneByModel,
} from 'javascript/utils/apiMethods'
import { makeFormInputsFromModel } from 'javascript/utils/helper-functions/make-form-inputs-from-model'
import { withSuspense } from 'javascript/utils/hoc/withSuspense'
import { useTrackPromise } from 'javascript/utils/hooks/use-track-promise'
import React from 'react'
import { useGetWistia } from './hooks'

export const WistiaForm: React.FC<{ closeEvent: () => void }> = withSuspense(
  ({ closeEvent }) => {
    const { data, revalidate } = useGetWistia()
    const isInUpdateMode = Boolean(data)

    const updateAction = useTrackPromise()
    const createAction = useTrackPromise()
    const deleteAction = useTrackPromise()

    const onSubmitCreate = (values: Omit<WistiaAccountType, 'id'>) => {
      const promise = createOneByModel('wistia-account', {
        ...values,
      })
      createAction.trackPromise(promise).then(revalidate)
    }

    const onSubmitUpdate = (values: WistiaAccountType) => {
      const promise = updateOneByModel('wistia-account', values)
      updateAction.trackPromise(promise).then(revalidate)
    }

    const onSubmitDelete = () => {
      const promise = deleteOneByModel('wistia-account', data.id)
      deleteAction.trackPromise(promise).then(() => {
        revalidate()
        closeEvent()
      })
    }

    return (
      <div>
        <h2>{isInUpdateMode ? 'Update' : 'Add'} Wistia Account</h2>
        <Formik
          onSubmit={isInUpdateMode ? onSubmitUpdate : onSubmitCreate}
          initialValues={data}
        >
          {({ values, handleChange, handleSubmit, errors }) => {
            return (
              <form className="cms-form cms-form--large" onSubmit={handleSubmit}>
                {makeFormInputsFromModel({
                  modelKey: 'wistia-accounts',
                  blacklist: ['id', 'wistia-enabled'],
                  required: ['wistia-project', 'wistia-password'],
                  propsMap: {
                    'wistia-password': {
                      description:
                        'This is kept hidden from ONE users, but can be updated here.',
                    },
                  },
                  typeMap: {
                    'wistia-password': 'password',
                  },
                  order: ['wistia-project', 'wistia-password'],
                }).map(({ label, name, type, required, props }) => {
                  return (
                    <FormControl
                      {...props}
                      type={type}
                      error={errors[name]}
                      value={values[name]}
                      onChange={handleChange}
                      label={label}
                      name={name}
                      required={required}
                    ></FormControl>
                  )
                })}
                <Button sizeModifier="small" type="submit">
                  Submit
                </Button>
                {isInUpdateMode && (
                  <Button
                    sizeModifier="small"
                    type="button"
                    color="error"
                    onClick={onSubmitDelete}
                    style={{ marginLeft: '0.75rem' }}
                  >
                    Delete Wistia
                  </Button>
                )}
                <div>
                  <ActivityIndicator
                    style={{ marginTop: '1.75rem' }}
                    status={updateAction.status}
                    successLabel={'Updated successfully'}
                  ></ActivityIndicator>
                  <ActivityIndicator
                    style={{ marginTop: '1.75rem' }}
                    status={createAction.status}
                    successLabel={'Updated successfully'}
                  ></ActivityIndicator>
                </div>
              </form>
            )
          }}
        </Formik>
      </div>
    )
  },
)
