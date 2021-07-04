import React, { useEffect } from 'react'

import compose from 'javascript/utils/compose'
import Modal from 'javascript/components/modal'
import PermissionsForm from 'javascript/components/admin/series/series-permissions'
import SeriesForm from 'javascript/components/admin/series/form'
import useResource from 'javascript/utils/hooks/use-resource'
import withModalRenderer, { WithModalType } from 'javascript/components/hoc/with-modal-renderer'
import withTheme, { WithThemeType } from 'javascript/utils/theme/withTheme'

// Types
import { SeriesType } from 'javascript/types/ModelTypes'

interface FormPropsType {
  onSave: (r: SeriesType) => void
  resource?: SeriesType
  programmeId?: string | null
}

export type WithSeriesPageActionsType = {
  deleteSeriesResource: (formProps: FormPropsType) => void
  editSeriesResource: (formProps: FormPropsType) => void
  editSeriesPermissions: (formProps: FormPropsType) => void
  fetchSeriesFormData: () => void
  newSeriesResource: (formProps: FormPropsType) => void
}

interface Props extends WithThemeType, WithModalType {
  component: any
}

const SeriesPageActions: React.FC<Props> = (props) => {

  const { theme } = props
  const customAttributesResource = useResource('custom-attribute-type')
  const talentTypesResource = useResource('talent-type')

  const fetchSeriesFormData = () => {
    customAttributesResource.findAll({
      filter: {
        related_type: 'Series'
      },
      page: {
        size: 200
      }
    })
    if (theme.features.talents) {
      talentTypesResource.findAll({
        page: {
          size: '48'
        },
        fields: {
          'talent-types': 'name'
        }
      })
    }
  }

  useEffect(() => {
    fetchSeriesFormData()
  }, [])

  const newSeriesResource = (formProps: FormPropsType) => {
    editSeriesResource(formProps, false)
  }

  const editSeriesResource = (formProps: FormPropsType, isEdit = true) => {
    if (!formProps.onSave) {
      // default js error is not obvious in development
      console.error('Edit/New Series Resource, must provide onSave method to with-series-actions - formProps')
    }
    const seriesFormProps = {
      types: customAttributesResource.getDataAsArray() || [],
      talentTypes: talentTypesResource.getDataAsArray() || [],
      fetchSeriesFormData,
    }
    props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          title={`${isEdit ? 'Edit' : 'New'} ${theme.localisation.series.upper}`}
          modifiers={['large']}
          closeEvent={hideModal}
          {...(!isEdit && {titleIcon: { id: 'i-admin-add', width: 14, height: 14 }})}
        >
          <div className="cms-modal__content">
            <SeriesForm { ...formProps } {...seriesFormProps} hideModal={hideModal} isEdit={isEdit} />
          </div>
        </Modal>
      )
    })
  }

  const deleteSeriesResource = (formProps) => {
    if (!formProps.onSave) {
      // default js error is not obvious in development
      console.error('Delete Series Resource, must provide onSave method to with-series-actions - formProps')
    }
    props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title="Warning"
          modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}
        >
          <div className="cms-modal__content">
            <SeriesForm {...formProps} hideModal={hideModal} isDelete={true} />
          </div>
        </Modal>
      )
    })
  }

  const editSeriesPermissions = ({ resource, onSave }) => {
    const modalModifiers = []
    if (theme.features.restrictions.expiring) {
      modalModifiers.push('large')
    }
    props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          title={`${resource.name} Permissions`}
          modifiers={modalModifiers}
          closeEvent={() => {
            hideModal()
            onSave()
          }}>
          <div className="cms-modal__content">
            <PermissionsForm resource={resource} />
          </div>
        </Modal>
      )
    })
  }

  const seriesActions = {
    deleteSeriesResource,
    editSeriesResource,
    editSeriesPermissions,
    fetchSeriesFormData,
    newSeriesResource,
  }

  return <props.component {...props} {...seriesActions} />
}

const enhance = compose(
  withModalRenderer,
  withTheme,
)

const EnhancedSeriesPageActions = enhance(SeriesPageActions)

const withSeriesPageActions = (Component) => (props) => {
  return <EnhancedSeriesPageActions {...props} component={Component} />
}

export default withSeriesPageActions
