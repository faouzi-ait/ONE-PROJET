import React, { useEffect, useState } from 'react'
import moment from 'moment'
// stores
import CollectionStore from 'javascript/stores/collections'
import PageStore from 'javascript/stores/pages'

import { findAllByModel, updateOneByModel } from 'javascript/utils/apiMethods'

import compose from 'javascript/utils/compose'
import useSystemPages from 'javascript/utils/hooks/use-system-pages'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'
// components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import { ReorderableList } from 'javascript/components/reorderable-list'
import Button from 'javascript/components/button'
import Collection from 'javascript/views/admin/pages/collection'
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import MetaDataForm from 'javascript/views/admin/pages/metadata-form'
import Modal from 'javascript/components/modal'
import Page from 'javascript/views/admin/pages/page'
import PageHeader from 'javascript/components/admin/layout/page-header'
import PageResource from 'javascript/components/admin/pages/page'
import Tabs from 'javascript/components/tabs'
// types
import { WithThemeType } from 'javascript/utils/theme/withTheme'
import { CollectionType, PageType } from 'javascript/types/ModelTypes'


interface Props extends WithThemeType, WithPageHelperType {}

const PagesIndex: React.FC<Props> = ({
  modalState,
  pageIsLoading,
  theme,
}) => {
  const { features, localisation } = theme

  const { systemPages, fetchSystemPages } = useSystemPages()

  const [pages, setPages] = useState(null)
  const [collections, setCollections] = useState(null)
  const [resources, setResources] = useState([])
  const [systemPageResources, setSystemPageResources] = useState([])

  useEffect(() => {
    pageIsLoading([!pages, !collections])
    modalState.hideModal()
  }, [pages, collections])

  useEffect(() => {
    if (systemPages.length) fetchSystemPageData()
  }, [systemPages])

  useEffect(() => {
    const refreshData = () => {
      fetchSystemPages(true)
      fetchResources()
    }
    fetchResources()
    CollectionStore.on('refreshStore', refreshData)
    PageStore.on('refreshStore', refreshData)
    return () => {
      CollectionStore.removeListener('refreshStore', refreshData)
      PageStore.removeListener('refreshStore', refreshData)
    }
  }, [])

  const pagesFields = [
    'title', 'position', 'introduction', 'redirect-url', 'shareable', 'published', 'slug', 'published-at',
    'banner-text-color', 'show-in-nav', 'show-in-featured-nav', 'show-in-mega-nav', 'show-in-footer', 'updated-at',
    'page-type', 'show-in-collection',
    features.pages.private && 'private-page',
  ].filter(Boolean)

  const getCollections = () => new Promise<CollectionType[]>((resolve) => {
    findAllByModel('collections', {
      include: ['pages'],
      fields: [
        'pages', 'title', 'introduction','shareable', 'sortable', 'published', 'slug', 'pages-count',
        'banner-text-color', 'show-in-nav', 'show-in-featured-nav', 'show-in-mega-nav', 'show-in-footer', 'default-order',
        'updated-at',
      ],
      includeFields: {
        //@ts-ignore
        pages: pagesFields
      },
      filter: {
        all: true
      },
    }).then((response) => {
      setCollections(response)
      resolve(response)
    })
  })

  const getPages = () => new Promise<PageType[]>((resolve) => {
    findAllByModel('pages', {
      //@ts-ignore
      fields: pagesFields,
      filter: {
        all: true,
        parentless: true,
        'system-pages': false
      },
    }).then((response) => {
      setPages(response)
      resolve(response)
    })
  })

  const fetchSystemPageData = () => {
    if (!systemPages.length) return Promise.resolve([])
    const systemPageIds = systemPages
      .filter((pg) => systemPages.includesSlugAndEnabledFeature(pg.slug).enabled)
      .filter((pg) => !systemPages.hasOwnCmsPath(pg.slug))
      .map((pg) => pg.id)
      .join(',')

    return findAllByModel('pages', {
      fields: pagesFields as any,
      filter: {
        'ids': systemPageIds
      },
    }).then((response) => {
      setSystemPageResources(response.sort((a, b) => a?.['page-type']?.localeCompare(b?.['page-type'])))
    })
  }

  const sortByDate = (sortField) => (a, b) => moment(a[sortField]).valueOf() > moment(b[sortField]).valueOf() ? -1 : 1

  const fetchResources = async () => {
    const [collections, pages] = await Promise.all([getCollections(), getPages()])
    setResources([...collections, ...pages].sort(sortByDate('updated-at')))
  }

  const createResource = (type: string, parent?: CollectionType) => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          modifiers={['large']}
          closeEvent={hideModal}
          title={`New ${type}`}
          titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}>
          <div className="cms-modal__content">
            {type === 'Collection' ? (
              <Collection resource={{}} method="createResource" />
            ) : (
              <Page
                resource={{ collection: parent ? parent : null }}
                collections={collections}
                method="createResource"
              />
            )}
          </div>
        </Modal>
      )
    })
  }

  const updateResource = (resource) => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          modifiers={['large']}
          closeEvent={hideModal}
          title={`Edit ${resource.type === 'collections' ? 'Collection' : 'Page'}`}>
          <div className="cms-modal__content">
            {resource.type === 'collections' ? (
              <Collection resource={resource} method="updateResource" />
            ) : (
              <Page resource={resource} collections={collections} method="updateResource" />
            )}
          </div>
        </Modal>
      )
    })
  }

  const deleteResource = (resource) => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title="Warning" modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
          <div className="cms-modal__content">
            {resource.type === 'collections' ? (
              <Collection resource={resource} method="deleteResource" closeEvent={hideModal} />
            ) : (
              <Page resource={resource} method="deleteResource" closeEvent={hideModal} />
            )}
          </div>
        </Modal>
      )
    })
  }

  const editMetadata = (resource) => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        title={`${resource.title} Metadata`}
        closeEvent={hideModal}>
        <div className="cms-modal__content">
          <MetaDataForm resource={resource} closeEvent={hideModal} />
        </div>
      </Modal>
    ))
  }

  const renderCollectionChildren = (resource) => {
    if (!resource) {
      return null
    }
    return (
      <ReorderableList<PageType>
        items={(resource.pages || []).sort((a, b) => a.position - b.position)}
        onChange={({item, newItems, newPosition}) => {
          const update = {...item}
          if (newPosition === 1) {
            update.position = 1
          } else {
            const oldPosition = newItems[newPosition - 1].position
            const prevPagePosition = newItems[newPosition - 2].position
            update.position = oldPosition > prevPagePosition ? prevPagePosition + 1 : prevPagePosition
          }
          updateOneByModel('page', {
            id: update.id,
            position: update.position,
          }).then((response) => {
            fetchResources()
          })
        }}
        droppableTag="tbody"
        draggableTag="tr"
        renderItem={({ item: child  }) => {
          return (
            <>
              <td></td>
              <td colSpan={2}>{ child.title }</td>
              <td className="label">
                { child.published ? (
                    <span className="count count--success">Published</span>
                  ) : (
                    <span className="count count--warning">Unpublished</span>
                  )}
              </td>
              <td className="cms-table__actions">
                <ActionMenu name="Actions">
                  <ActionMenuItem label="Edit" onClick={() => updateResource({...child, collection: resource}) } />
                  <ActionMenuItem label="Delete" onClick={() => deleteResource(child) } />
                  <ActionMenuItem label="Manage Meta Data" onClick={() => editMetadata(child)} />
                  <ActionMenuItem label="Manage Content" link={`/admin/pages/${child.id}/edit`} divide />
                  <ActionMenuItem label="Manage Images" link={`/admin/pages/page/${child.id}/images`} />
                  <ActionMenuItem label="View" href={`/${resource.slug}/${child.slug}`} divide />
                </ActionMenu>
              </td>
            </>
          )
        }}
      />
    )
  }

  const renderResources = () => {
    const rows = resources.map((resource, i) => {
      if (resource.type === 'collections') {
        const children = renderCollectionChildren(resource) || []
        return (
          <PageResource
            key={`${resource.type}-${resource.id}`}
            resource={resource}
            newEvent={createResource}
            editEvent={updateResource}
            deleteEvent={deleteResource}
            editMetadata={editMetadata}
            classes={['cms-table']}
          >
            {children}
          </PageResource>
        )
      } else {
        return (
          <PageResource
            key={resource.id}
            resource={resource}
            editEvent={updateResource}
            deleteEvent={deleteResource}
            editMetadata={editMetadata}
            classes={['cms-table']}
          />
        )
      }
    })
    if (rows.length > 0) {
      return (
        <div className="container">
          {rows}
        </div>
      )
    } else {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>There are currently no pages or collections, try creating some!</p>
          </div>
        </div>
      )
    }
  }

  const renderSystemResources = () => {
    const rows = systemPageResources.map((sPg) => {
      return (
        <PageResource
          key={sPg['page-type']}
          resource={sPg}
          classes={[]}
          editEvent={(resource) => updateResource(resource)}
          deleteEvent={deleteResource}
          editMetadata={editMetadata}
        />
      )
    })
    return (
      <div className="container" style={{marginTop: '80px'}}>
        <table className="cms-table">
          <thead>
            <tr>
              <th>Name</th>
              <th colSpan={3}>Display Name <br /><small>This is the name that will appear on your site</small></th>
            </tr>
            <tr style={{height: '3px'}}></tr>
            </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <Meta
      title={`${localisation.client} :: Pages`}
      meta={{
        description: 'Edit and Create Pages'
      }}>
      <main>
        <PageHeader title="Manage Pages">
          <div className="page-header__actions">
            <Button className="button" onClick={() => createResource('Collection', null)}>
              <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
              New Collection
            </Button>
            <Button className="button" onClick={() => createResource('Page', null)}>
              <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
              New Page
            </Button>
          </div>
        </PageHeader>
        <Tabs>
          <div title="Custom Pages">
            {renderResources()}
          </div>
          <div title="System Pages">
            {renderSystemResources()}
          </div>
        </Tabs>
      </main>
    </Meta>
  )
}

const enhance = compose(
  withPageHelper,
)

export default enhance(PagesIndex)
