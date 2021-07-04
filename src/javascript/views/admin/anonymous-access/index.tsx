import React, { useEffect, useState } from 'react'
import moment from 'moment'
import pluralize from 'pluralize'
import styled from 'styled-components'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

import Button from 'javascript/components/button'
import DefaultDeleteForm from 'javascript/components/index-helpers/delete-form'
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Paginator from 'javascript/components/paginator'
import Resource from 'javascript/components/admin/resource'
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'

interface Props extends WithPageHelperType {
  history: any
  theme: CustomThemeType
}

const AnonymousAccess:  React.FC<Props> = ({
  history,
  modalState,
  pageIsLoading,
  theme,
}) => {

  const [pageNumber, setPageNumber] = useState(1)
  const [resources, setResources] = useState([])

  const anonAccessResource = useResource('anonymous-access')
  const getAnonymousAccesses = () => {
    anonAccessResource.findAll({
      fields: {
        'anonymous-access': 'name,emails,expires-after,view-count-sum,view-count-limit',
      },
      'page[number]': pageNumber,
      'page[size]': 20,
    })
    .then((response) => {
      pageIsLoading(false)
      setResources(response)
    })
  }

  useEffect(() => {
    getAnonymousAccesses()
  }, [pageNumber])

  const deleteResource = (resource) => (e) => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={ hideModal }
          title="Warning" modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn'}}
        >
          <div className="cms-modal__content">
            <DefaultDeleteForm
              resource={ resource }
              closeEvent={ hideModal }
              resourceName={theme.localisation.anonymousAccess.upper}
              deleteResource={() => {
                anonAccessResource.deleteResource(resource)
                  .then((response) => {
                    hideModal()
                    getAnonymousAccesses()
                  })
              }}
            />
          </div>
        </Modal>
      )
    })
  }

  const expireResource = (resource) => (e) => {
    anonAccessResource.updateResource({
      id: resource.id,
      'expires-after': moment().utc().toDate().toUTCString()
    })
    .then((response) => {
      getAnonymousAccesses()
    })
  }

  const renderResources = () => {
    const renderResourceFields = (resource) => {
      let currentViews = resource['view-count-sum']
      if (resource['emails'].length > 1 && resource['view-count-limit']) {
        const allUsersTotal = resource['emails'].length * resource['view-count-limit']
        currentViews = `${resource['view-count-sum'] || 0} (${allUsersTotal})`
      }
      const expiryDate = resource['expires-after']
        ? (
          <span className="count count--success">{
            moment(resource['expires-after']).format(theme.features.formats.shortDate)
          }</span>
        )
        : ''
      return (
        <>
          <CenteredTableCell>
            { resource['isExpired']
              ? <span className="count count--warning">Expired</span>
              : expiryDate
            }
          </CenteredTableCell>
          <CenteredTableCell>{ resource['view-count-limit'] || '' }</CenteredTableCell>
          <CenteredTableCell>{ currentViews || '' }</CenteredTableCell>
        </>
      )
    }

    const resourceItems = (resources).map((resource) => {
      const resourceIsExpired = moment(resource['expires-after']).isBefore()
      resource['isExpired'] = resourceIsExpired
      return (
        <Resource key={ resource.id } name={ resource.name } fields={() => renderResourceFields(resource)} >
          <ActionMenu name="Actions">
            {!resourceIsExpired && (
              <ActionMenuItem label="Expire Access" onClick={expireResource(resource)} />
            )}
            <ActionMenuItem label="Delete" onClick={deleteResource(resource)} />
            <ActionMenuItem label="View" onClick={() => history.push(`/admin/${theme.localisation.anonymousAccess.path}/${resource.id}`)} />
          </ActionMenu>
        </Resource>
      )
    })
    if (resourceItems.length === 0) {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>There are currently no {pluralize(theme.localisation.anonymousAccess.upper)}, try creating some!</p>
          </div>
        </div>
      )
    }
    return (
      <div className="container">
        <table className="cms-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Expiry</th>
              <th>View Limit</th>
              <th>Total Views</th>
              <th/>
            </tr>
          </thead>
          <tbody>
            { resourceItems.length > 0 ? resourceItems : null }
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <Meta
      title={`${theme.localisation.client} :: ${theme.localisation.anonymousAccess.upper}`}
      meta={{
        description: `Edit and Create ${theme.localisation.anonymousAccess.upper}`
      }}
    >
      <main>
        <PageHeader title={`Manage ${theme.localisation.anonymousAccess.upper}`}>
          <Button className="button" onClick={() => history.push(`/admin/${theme.localisation.anonymousAccess.path}/new`) }>
            <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
            New {theme.localisation.anonymousAccess.upper}
          </Button>
        </PageHeader>
        { renderResources() }
        <Paginator currentPage={ pageNumber } totalPages={ anonAccessResource.getDataAsArray()?.meta['page-count'] } onChange={ setPageNumber }/>
      </main>
    </Meta>
  )
}

const enhance = compose(
  withPageHelper
)

export default enhance(AnonymousAccess)


const CenteredTableCell = styled.td`
  text-align: center
`