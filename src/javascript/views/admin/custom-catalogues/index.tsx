import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'

import PageStore from 'javascript/stores/pages'
import { checkPermissions } from 'javascript/services/user-permissions'

// Components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import CustomCatalogueMetaData from 'javascript/views/admin/custom-catalogues/metadata'
import Page from 'javascript/views/admin/pages/page'
import PagesMetaData from 'javascript/views/admin/pages/metadata-form'
import DeleteForm from 'javascript/components/admin/delete-form-confirm'
import InputForm from 'javascript/views/admin/custom-catalogues/form'
import Modal from 'javascript/components/modal'
import UpgradeModal from 'javascript/components/upgrade-modal'

import { useHistory } from 'react-router-dom'
import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'
import withIndexHelper, { WithIndexHelperType } from 'javascript/components/hoc/with-index-helper'
import withModalRenderer, { WithModalType } from 'javascript/components/hoc/with-modal-renderer'

import { WithThemeType } from 'javascript/utils/theme/withTheme'
import { findAllByModel } from 'javascript/utils/apiMethods'
import { WithUserType } from 'javascript/components/hoc/with-user'

interface Props extends WithModalType, WithThemeType, WithUserType, WithIndexHelperType {}

const CustomCataloguesIndex: React.FC<Props> = (props) => {
  const {
    theme: { localisation, features },
    modalState,
    user
  } = props

  const customCataloguesEnabled = features.customCatalogues.enabled && checkPermissions(user, { permissions: ['manage_catalogues']})

  const meta = {
    title: `${localisation.client} :: ${localisation.catalogue.upper}`,
    meta: {
      description: `Edit and Create ${localisation.catalogue.upper}`
    }
  }
  const cataloguesResource = useResource('catalogue')
  const history = useHistory()

  const [cataloguePage, setCataloguePage] = useState(null)
  const [myProgrammesPage, setMyProgrammesPage] = useState(null)

  const getCatalogues = () => {
    if (customCataloguesEnabled) {
      cataloguesResource.findAll({
        fields: {
          'catalogues': 'name,slug,show-in-nav,programmes-count'
        }
      })
    }
  }

  const getCataloguePageResource = () => {
    findAllByModel('pages', {
      fields: [
        'content-blocks', 'page-images', 'title', 'slug', 'banner-urls',
        'show-in-nav', 'show-in-footer', 'show-in-featured-nav', 'show-in-mega-nav',
        'private-page', 'page-type', 'introduction'
      ],
      include: ['page-images'],
      includeFields: {
        'page-images': ['file', 'filename'],
      },
      filter: {
        'page-type': 'catalogue',
        all: true
      }
    }).then((response) => {
      if (response.length === 0) {
        console.error('CustomCatalogues.index: Cannot find default catalogue page resource.')
      }
      const cataloguePage = response[0] || null
      if (!cataloguePage?.['content-blocks']) cataloguePage['content-blocks'] = []
      setCataloguePage(cataloguePage)
      modalState.hideModal()
    })
  }

  const getMyProgrammesPageResource = () => {
    if (!features.users.limitedAccess) {
      return
    }
    findAllByModel('pages', {
      fields: [
        'title', 'slug', 'show-in-nav', 'show-in-featured-nav', 'show-in-mega-nav',
        'private-page', 'page-type'
      ],
      filter: {
        'page-type': 'my_programmes',
        all: true
      }
    }).then((response) => {
      if (response.length === 0) {
        console.error('CustomCatalogues.index: Cannot find my_programmes page resource.')
      }
      setMyProgrammesPage(response[0] || null)
      modalState.hideModal()
    })
  }

  const fetchPageResources = () => {
    getCataloguePageResource()
    getMyProgrammesPageResource()
  }

  useEffect(() => {
    getCatalogues()
    fetchPageResources()
    PageStore.on('refreshStore', fetchPageResources)
    return () => {
      PageStore.removeListener('refreshStore', fetchPageResources)
    }
  }, [])

  useWatchForTruthy(cataloguesResource.mutationState.succeeded, () => {
    getCatalogues()
    modalState.hideModal()
  })

  const renderDeleteResource = (resource, props) => {
    const programmesCount = resource['programmes-count']
    if (programmesCount === 0) {
      return cataloguesResource.deleteResource(resource)
    }
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={ hideModal }
          title="Warning" modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
          <div className="cms-modal__content">
            <DeleteForm {...props}
              resource={ resource }
              relationCount={resource['programmes-count']}
              relationName={'programme'}
              closeEvent={ hideModal }
              deleteResource={cataloguesResource.deleteResource}
            />
          </div>
        </Modal>
      )
    })
  }

  const editMetadata = (resource) => (e) => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        title={`${resource.name || resource.title} Metadata`}
        closeEvent={hideModal}
      >
        <div className="cms-modal__content">
          { resource.type === 'catalogues' ? (
            <CustomCatalogueMetaData customCatalogue={resource} closeEvent={hideModal} />
          ) : (
            <PagesMetaData resource={resource} closeEvent={hideModal} />
          )}
        </div>
      </Modal>
    ))
  }

  const resources = cataloguesResource.getDataAsArray()

  const renderActionMenuItems = (resource) => [
    <ActionMenuItem key="manage_programmes" label="Manage Programmes" divide onClick={() => history.push(`/admin/${localisation.catalogue.path}/${resource.id}/${localisation.programme.path}`)} />,
    <ActionMenuItem key="manage_content" label="Manage Content" onClick={() => history.push(`/admin/${localisation.catalogue.path}/${resource.id}/content`)} />,
    <ActionMenuItem key="manage_images" label="Manage Images" onClick={() => history.push(`/admin/${localisation.catalogue.path}/${resource.id}/images`)} />,
    <ActionMenuItem key="manage_meta" label="Manage Meta Data" onClick={editMetadata(resource)} />,
    <ActionMenuItem key="view" label="View" href={`/custom-${localisation.catalogue.path}/${resource.slug}`} divide />
  ]

  const updateResource = (resource) => {
    const update = {...resource}
    delete update['programmes-count']
    cataloguesResource.updateResource(update)
  }

  const editPageResource = (resource, isStatic = false) => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          modifiers={['large']}
          closeEvent={hideModal}
          title={`Edit ${localisation.catalogue.upper}`}>
          <div className="cms-modal__content">
            <Page resource={resource} method="updateResource" isStatic={true} />
          </div>
        </Modal>
      )
    })
  }

  const renderDefaultCatalogues = () => {
    if (!(cataloguePage || myProgrammesPage)) return null
    return (
      <div className="container">
        <table className="cms-table">
          <thead>
            <tr>
              <th>{pluralize(localisation.catalogue.upper)}</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            { cataloguePage &&
              <tr className="with-action cms-table-row">
                <td>{cataloguePage?.title}</td>
                <td><span className="tag tag--external">Default</span></td>
                <td className="cms-table__actions">
                  {cataloguePage && (
                    <ActionMenu name="Actions">
                      <ActionMenuItem label="Edit" onClick={() => editPageResource(cataloguePage) } />
                      <ActionMenuItem label="Manage Meta Data" onClick={editMetadata(cataloguePage)} />
                      <ActionMenuItem label="Manage Content" link={`/admin/pages/${cataloguePage.id}/edit`} divide />
                      <ActionMenuItem label="Manage Images" link={`/admin/pages/page/${cataloguePage.id}/images`} />
                      <ActionMenuItem label="View" href={`/${cataloguePage.slug}`} divide />
                    </ActionMenu>
                  )}
                </td>
              </tr>
            }
            { myProgrammesPage &&
              <tr className="with-action cms-table-row">
                <td>{myProgrammesPage?.title}</td>
                <td><span className="tag tag--external">User</span></td>
                <td className="cms-table__actions">
                  {cataloguePage && (
                    <ActionMenu name="Actions">
                      <ActionMenuItem label="Edit" onClick={() => editPageResource(myProgrammesPage) } />
                      <ActionMenuItem label="View" href={`/${myProgrammesPage.slug}`} divide />
                    </ActionMenu>
                  )}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    )
  }

  const renderUpdgradeCataloguesModal = () => {
    if (features.customCatalogues.enabled) {
      modalState.showModal(({ hideModal }) => (
        <Modal
          closeEvent={hideModal}
          title={`Custom ${pluralize(localisation.catalogue.upper)}`}>
          <div className="cms-modal__content">
            <p>Permissions required, please speak to your administrator.</p>
          </div>
        </Modal>
      ))
    } else {
      modalState.showModal((modalProps) => (
        <UpgradeModal {...modalProps} featureName={'Programmes+'} />
      ))
    }
  }

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    ...(!customCataloguesEnabled && {
      renderCreateResource: renderUpdgradeCataloguesModal
    }),
    renderAboveIndexContent: renderDefaultCatalogues,
    createResource: cataloguesResource.createResource,
    InputForm,
    meta,
    renderActionMenuItems,
    renderDeleteResource,
    resourceName: localisation.catalogue.upper,
    tableHeadingName: `Custom ${pluralize(localisation.catalogue.upper)}`,
    resources,
    updateResource,
  }
  return props.renderPageIndex(indexHelperProps)
}

const enhance = compose(
  withModalRenderer,
  withIndexHelper,
)

export default enhance(CustomCataloguesIndex)
