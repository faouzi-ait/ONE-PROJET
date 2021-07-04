import { Formik } from 'formik'
import ActivityIndicator from 'javascript/components/activity-indicator'
import FormControl from 'javascript/components/form-control'
import Button from 'javascript/components/button'
import { KnoxAccountType } from 'javascript/types/ModelTypes'
import {
  createOneByModel,
  deleteOneByModel,
  updateOneByModel,
} from 'javascript/utils/apiMethods'
import { makeFormInputsFromModel } from 'javascript/utils/helper-functions/make-form-inputs-from-model'
import { withSuspense } from 'javascript/utils/hoc/withSuspense'
import { useTrackPromise } from 'javascript/utils/hooks/use-track-promise'
import React from 'react'
import { useGetKnox } from './hooks'

export const KnoxForm: React.FC<{ closeEvent: () => void }> = withSuspense(
  ({ closeEvent }) => {
    const { data, revalidate } = useGetKnox()
    const isInUpdateMode = Boolean(data)

    const updateAction = useTrackPromise()
    const createAction = useTrackPromise()
    const deleteAction = useTrackPromise()

    const onSubmitCreate = (values: Omit<KnoxAccountType, 'id'>) => {
      const promise = createOneByModel('knox-account', {
        ...values,
      })
      createAction.trackPromise(promise).then(revalidate)
    }

    const onSubmitUpdate = (values: KnoxAccountType) => {
      const promise = updateOneByModel('knox-account', values)
      updateAction.trackPromise(promise).then(revalidate)
    }

    const onSubmitDelete = () => {
      const promise = deleteOneByModel('knox-account', data.id)
      deleteAction.trackPromise(promise).then(() => {
        revalidate()
        closeEvent()
      })
    }

    return (
      <div>
        <h2>{isInUpdateMode ? 'Update' : 'Add'} Knox Account</h2>
        <Formik
          onSubmit={isInUpdateMode ? onSubmitUpdate : onSubmitCreate}
          initialValues={data}
        >
          {({ values, handleChange, handleSubmit, errors }) => {
            return (
              <form className="cms-form cms-form--large" onSubmit={handleSubmit}>
                {makeFormInputsFromModel({
                  modelKey: 'knox-accounts',
                  blacklist: ['id', 'knox-enabled', 'api-key'],
                  required: [
                    'knox-client-id',
                    'knox-client-secret',
                    'password',
                    'username',
                  ],
                  order: [
                    'knox-client-id',
                    'knox-client-secret',
                    'username',
                    'password',
                  ],
                  typeMap: {
                    password: 'password'
                  },
                  propsMap: {
                    'knox-client-secret': {
                      description:
                        'This is kept hidden from ONE users, but can be updated here.',
                    },
                    password: {
                      description:
                        'This is kept hidden from ONE users, but can be updated here.',
                      type: 'password',
                    },
                  },
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
                    Delete Knox
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
