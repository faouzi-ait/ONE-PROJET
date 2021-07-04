import React, {useState, useEffect} from 'react'
import Meta from 'react-document-meta'

import useTheme from 'javascript/utils/theme/useTheme'
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'
import PagesStore from 'javascript/stores/pages'

// Components
import Button from 'javascript/components/button'
import Modal from 'javascript/components/modal'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Icon from 'javascript/components/icon'
import {ActionMenu, ActionMenuItem} from 'javascript/components/admin/action-menu'
import Paginator from 'javascript/components/paginator'
import Tabs from 'javascript/components/tabs'
import MetaDataForm from 'javascript/views/admin/pages/metadata-form'
import Page from 'javascript/views/admin/pages/page'
import { ReorderableList } from 'javascript/components/reorderable-list'

import NewMemberForm from 'javascript/views/admin/team-members/new-member-form'
import DefaultInputForm from 'javascript/components/index-helpers/input-form'
import DeleteForm from 'javascript/components/index-helpers/delete-form'

import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'


import { PageType } from 'javascript/types/ModelTypes'

interface Props extends WithPageHelperType {
}

const TeamManagement: React.FC<Props> = ({
  pageIsLoading,
  modalState
}) => {

  const teamDepartmentsResource = useResource('team-department')
  const teamRegionsResource = useResource('team-region')
  const teamMembersResource = useResource('team-member')
  const pageResource = useResource('page')


  const { localisation, variables } = useTheme()
  const [departments, setDepartments] = useState(null)
  const [regions, setRegions] = useState(null)
  const [members, setMembers] = useState(null)
  const [teamsPageResource, setTeamsPageResource] = useState<Partial<PageType>>({})

  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    getDepartments()
    getRegions()
    getTeamPage()
    PagesStore.on('refreshStore', getTeamPage)
    return () => {
      PagesStore.removeListener('refreshStore', getTeamPage)
    }
  }, [])

  useEffect(() => {
    getTeamMembers()
  }, [pageSize, pageNumber])


  const getDepartments = () => {
    teamDepartmentsResource.findAll({
      fields: {
        'team-departments': 'name'
      },
      'page[size]': 200
    }).then((response) => {
      setDepartments(response)
    })
  }

  const getRegions = () => {
    teamRegionsResource.findAll({
      fields: {
        'team-regions': 'name'
      },
      'page[size]': 200
    }).then((response) => {
      setRegions(response)
    })
  }

  const getTeamMembers = () => {
    teamMembersResource.findAll({
      include: 'team-department,team-region,team',
      fields: {
        'team-members': 'first-name,last-name,job-title,email,phone,bio,team-department,team-region,team,manager,position,producer-hub',
        'team-departments': 'name',
        'team-regions': 'name',
        'teams': 'name'
      },
      'page[number]': pageNumber,
      'page[size]': pageSize,
    }).then((response) => {
        setTotalPages(response.meta['page-count'])
        setMembers(response)
        pageIsLoading(false)
      })
  }

  const getTeamPage = () => {
    pageResource.findAll({
      fields: {
        'pages': 'title,slug,show-in-nav,show-in-footer,show-in-featured-nav,show-in-mega-nav',
      },
      filter: {
        'page-type': 'team',
      }
    }).then((response) => {
      setTeamsPageResource(response[0])
      modalState.hideModal()
    })
  }

  useWatchForTruthy(pageResource.mutationState.succeeded, () => {
    modalState.hideModal()
    getTeamPage()
  })

  const updatePage = (page, size = false) => {
    if (size) {
      setPageSize(parseInt(page))
      setPageNumber(1)
    } else {
      setPageNumber(parseInt(page))
    }
  }

  const renderTeamMembers = () => {
    return (
      <div className = "container" >
        <table className="cms-table">
          <thead>
              <tr>
                <th colSpan={4}>Members</th>
                <th>
                  <Button onClick={newMemberForm()} className="button button--small">
                    <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
                    New Member
                  </Button>
                </th>
              </tr>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th colSpan={2}>Job Title</th>
              </tr>
            </thead>
            <ReorderableList
              items={members || []}
              onChange={({ item, newPosition }) => {
                teamMembersResource.updateResource({
                  id: item.id,
                  position: newPosition
                })
              }}
              droppableTag="tbody"
              draggableTag="tr"
              renderItem={({ item: member, index }) => (
                <>
                  <td>{member['first-name']}</td>
                  <td>{member['last-name']}</td>
                  <td>{member['email']}</td>
                  <td>{member['job-title']}</td>
                  <td className="cms-table__actions">
                    <ActionMenu name="Actions">
                      <ActionMenuItem label="Edit" onClick={newMemberForm(member)} />
                      <ActionMenuItem label="Delete" onClick={deleteResource(deleteMembersResource, 'member', member)} />
                      <ActionMenuItem label="Manage Images" link={`/admin/${localisation.team.path}/${member.id}/images`} />
                    </ActionMenu>
                  </td>
                </>
              )}
            />
        </table>
      </div >
    )
  }

  const renderDepartments = () => {
    const resources = (departments || []).map(department => {
      return (
        <tr className="with-action">
          <td>{department.name}</td>
          <td className="cms-table__actions">
          <ActionMenu name="Actions">
            <ActionMenuItem label="Edit" onClick={updateResource(updateDepartmentsResource, 'department', department)} />
            <ActionMenuItem label="Delete" onClick={deleteResource(deleteDepartmentsResource, 'department', department)} />
            </ActionMenu>
          </td>
        </tr>
      )
    })
    return (
      <div className="container" >
        <table className="cms-table">
          <thead>
            <tr>
              <th>Departments</th>
              <th>
                <Button onClick={updateResource(createDepartmentsResource, 'department')} className="button button--small">
                  <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
                  New Department
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {resources}
          </tbody>
        </table>
      </div >
    )
  }

  const renderRegions = () => {
    const resources = (regions || []).map(department => {
      return (
        <tr className="with-action">
          <td>{department.name}</td>
          <td className="cms-table__actions">
          <ActionMenu name="Actions">
            <ActionMenuItem label="Edit" onClick={updateResource(updateRegionsResource, 'department', department)} />
            <ActionMenuItem label="Delete" onClick={deleteResource(deleteRegionsResource, 'department', department)} />
            </ActionMenu>
          </td>
        </tr>
      )
    })
    return (
      < div className = "container" >
        <table className="cms-table">
          <thead>
            <tr>
              <th>Regions</th>
              <th>
                <Button onClick={updateResource(createRegionsResource, 'department')} className="button button--small">
                  <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
                  New Region
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {resources}
          </tbody>
        </table>
      </div >
    )
  }

  const editTeamPage = (e) => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        title={variables.SystemPages.team.upper}
        closeEvent={hideModal}>
        <div className="cms-modal__content">
          <Page resource={teamsPageResource} method="updateResource" isStatic={true} />
        </div>
      </Modal>
    ))
  }

  const editTeamPageMetadata = () => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        title={`${teamsPageResource?.title} Metadata`}
        closeEvent={hideModal}>
        <div className="cms-modal__content">
          <MetaDataForm resource={teamsPageResource} closeEvent={hideModal} />
        </div>
      </Modal>
    ))
  }

  const deleteResource = (method, name, resource) => () => {
    modalState.showModal(({ hideModal }) => (
      <Modal title="Warning" modifiers={['warning']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} closeEvent={hideModal}>
        <div className="cms-modal__content">
          <DeleteForm
              resource={resource}
              closeEvent={hideModal}
              resourceName={name}
              deleteResource={method}
            />
        </div>
      </Modal>
    ))
  }

  const updateResource = (method, name, resource = {}) => () => {
    modalState.showModal(({ hideModal }) => (
      <Modal title="Create/Edit" closeEvent={hideModal}>
        <div className="cms-modal__content">
          <DefaultInputForm submitAction={method} resource={resource} resourceName={name} />
        </div>
      </Modal>
    ))
  }

  const newMemberForm = (resource = null) => () => {
    modalState.showModal(({ hideModal }) => (
      <Modal title="Create/Edit" closeEvent={hideModal}>
        <div className="cms-modal__content">
          <NewMemberForm
            onSubmitted={() => {
              setTimeout(() => {
                getTeamMembers()
                modalState.hideModal()
              }, 1000)
            }}
            resource={resource}
            departments={departments}
            regions={regions} />
        </div>
      </Modal>
    ))
  }

  const createDepartmentsResource = (resource) => {
    teamDepartmentsResource.createResource(resource)
    .then(() => {
      getDepartments()
      modalState.hideModal()
    })
  }

  const createRegionsResource = (resource) => {
    teamRegionsResource.createResource(resource)
    .then(() => {
      getRegions()
      modalState.hideModal()
    })
  }

  const updateDepartmentsResource = (resource) => {
    teamDepartmentsResource.updateResource(resource)
    .then(() => {
      getDepartments()
      modalState.hideModal()
    })
  }

  const updateRegionsResource = (resource) => {
    teamRegionsResource.updateResource(resource)
    .then(() => {
      getRegions()
      modalState.hideModal()
    })
  }

  const deleteDepartmentsResource = (resource) => {
    teamDepartmentsResource.deleteResource(resource)
    .then(() => {
      getDepartments()
      modalState.hideModal()
    })
  }

  const deleteRegionsResource = (resource) => {
    teamRegionsResource.deleteResource(resource)
    .then(() => {
      getRegions()
      modalState.hideModal()
    })
  }

  const deleteMembersResource = (resource) => {
    teamMembersResource.deleteResource(resource)
    .then(() => {
      getTeamMembers()
      modalState.hideModal()
    })
  }

  return (
    <Meta
      title={`${localisation.client} :: ${localisation.team.upper}`}
      meta={{ description: `View ${localisation.team.upper}` }}
    >
      <main>
      <PageHeader title={`Manage ${localisation.team.upper}`}>
          <div className="page-header__actions grid--end grid--center">
            <ActionMenu name="Actions">
              <ActionMenuItem label="Edit" onClick={editTeamPage} />
              <ActionMenuItem label="Manage Banner" link={`/admin/pages/page/${teamsPageResource?.id}/images`} />
              <ActionMenuItem label="Manage Meta Data" onClick={editTeamPageMetadata} />
              <ActionMenuItem label="View" href={`/${teamsPageResource?.slug}`} divide />
            </ActionMenu>
          </div>
        </PageHeader>

        <Tabs>

          <div title="Members" className="container">
            {renderTeamMembers()}
            {(totalPages > 1 || members?.length >= 50) && (
              <Paginator currentPage={ pageNumber } totalPages={ totalPages } onChange={ updatePage } onPageSizeChange={(page) => updatePage(page, true)} currentPageSize={pageSize}/>
            )}
          </div>

          <div title="Departments" className="container">
            {renderDepartments()}
          </div>

          <div title="Regions" className="container">
            {renderRegions()}
          </div>

        </Tabs>

      </main>
    </Meta>
  )
}

export default withPageHelper(TeamManagement)
