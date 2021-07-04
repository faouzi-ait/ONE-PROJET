/*
* withIndexHelper needs to be combined with at least withModalRenderer HOC - or alternatively withPageHelper
*
* Props you can overide/inject into withIndexHelper
*
* meta: if rendering with renderPageIndex() - this is an object that spreads into <Meta> component
* resourceName: Used to render title and button text
* renderCreateResource: if you prefer to use a custom createResource component or redirect
* renderUpdateResource: if you prefer to use a custom updateResource component or redirect
* renderDeleteResource: if you prefer to use a custom deleteResource component or redirect
*                       default version uses defaultDeleteForm - 'javascript/components/index-helpers/delete-form'
* deleteWarningMsg: This is injected into defaultDeleteForm - adds a paragraph of extra information
* renderSubHeading: function to add a subHeading to top of index. Adds a row with heading titles in bold
* renderResourceFields: function to map resource data for extra columns of data, other than just .name property
*                       This is provided to <Resource> component
* renderTableHeadings: function to display extra columns of data, other than just name heading
* resources: Array of all your data
* renderResources: if you prefer to use a custom renderResources
* children: if rendering with renderPageIndex() - This provides children to be inserted below index rows.
* viewOnly: will not render any <ActionMenu> components
* editOnly: will stop renderTableIndex() from having a top level 'Add {resourceName}' <ActionMenu>
* withSearch: object to map properties to optional search input
* withSort: object to map properties to optional select for sorting
*
*/

import React from 'react'
import pluralize from 'pluralize'
import Select from 'react-select'

import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import BulkCheckbox from 'javascript/components/bulk-selection/selectors/bulk-checkbox'
import BulkToggleButton from 'javascript/components/bulk-selection/bulk-toggle-button'
import Button from 'javascript/components/button'
import DefaultDeleteForm from 'javascript/components/index-helpers/delete-form'
import DefaultInputForm from 'javascript/components/index-helpers/input-form'
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Paginator from 'javascript/components/paginator'
import Resource from 'javascript/components/admin/resource'


interface RenderPageIndexProps {
  meta?: any
  resourceName?: string
  renderCreateResource?: any
  renderUpdateResource?: any
  renderDeleteResource?: any
  deleteWarningMsg?: any
  renderSubHeading?: any
  renderResourceFields?: any
  resources: any[]
  renderResources?: any
  viewOnly?: boolean
  renderPageHeaderActions?: any
  renderAboveIndexContent? :any
}

export type WithIndexHelperType = {
  renderPageIndex: (props: RenderPageIndexProps) => JSX.Element
}

const withIndexHelper = (WrappedComponent) => {
  class WithIndexHelper extends React.Component {

    renderCreateResource = (props) => {
      const { modalState, resourceName, InputForm, createResource } = props
      const Form = InputForm || DefaultInputForm
      modalState.showModal(({ hideModal }) => (
        <Modal
          closeEvent={ hideModal }
          title={`New ${resourceName}`}
          titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}>
          <div className="cms-modal__content">
            <Form resource={null} submitAction={createResource} />
          </div>
        </Modal>
      ))
    }

    renderUpdateResource = (resource, props) => {
      const { modalState, resourceName, InputForm, updateResource } = props
      const Form = InputForm || DefaultInputForm
      modalState.showModal(({ hideModal }) => {
        return (
          <Modal
            closeEvent={ hideModal }
            title={`Edit ${resourceName}`}>
            <div className="cms-modal__content">
              <Form resource={ resource } submitAction={updateResource} />
            </div>
          </Modal>
        )
      })
    }

    renderDeleteResource = (resource, props) => {
      const { modalState, DeleteForm } = props
      const Form = DeleteForm || DefaultDeleteForm
      modalState.showModal(({ hideModal }) => {
        return (
          <Modal
            closeEvent={ hideModal }
            title="Warning" modifiers={['warning']}
            titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
            <div className="cms-modal__content">
              <Form resource={ resource } closeEvent={ hideModal } {...props} />
            </div>
          </Modal>
        )
      })
    }

    renderResources = (props, tableHeading) => {
      const {
        renderActionMenuItems,
        renderBulkActionMenuItems,
        renderDeleteResource,
        renderResourceFields = () => null,
        renderTableHeadings = () => null,
        renderSubHeading = () => null,
        renderUpdateResource,
        resourceName,
        resources,
        tableHeadingName,
        viewOnly,
        withPaginator = false
      } = props
      if (!resources) return null
      const subHeading = renderSubHeading()
      const resourceItems = (resources || []).map((resource) => {
        return (
          <Resource key={ resource.id } name={ resource.name } fields={() => renderResourceFields(resource)} >
            { viewOnly ? ( <div/> ) : (
              <MenuWithConditionalBulkSelector resource={resource} {...props} >
                <ActionMenu name="Actions">
                  <ActionMenuItem label="Edit" onClick={() => { renderUpdateResource(resource, props) }} />
                  <ActionMenuItem label="Delete" onClick={() => { renderDeleteResource(resource, props) }} />
                  {renderActionMenuItems && renderActionMenuItems(resource)}
                </ActionMenu>
              </MenuWithConditionalBulkSelector>
            )}
          </Resource>
        )
      })
      const getHeadingColumns = () => {
        return renderBulkActionMenuItems ? (
          <tr>
            <th>{tableHeadingName || 'Name'}</th>
            <th><BulkToggleButton /></th>
          </tr>
        ) : (
          <tr>
            <th colSpan={!renderTableHeadings() ? 2 : 1}>{tableHeadingName || 'Name'}</th>
            {renderTableHeadings && renderTableHeadings()}
          </tr>
        )
      }
      let defaultHeading = resourceItems.length === 0 ? null : (
        <thead>
          {getHeadingColumns()}
        </thead>
      )
      if (resourceItems.length === 0) {
        return (
          <div className="container">
            {tableHeading && (
               <table className="cms-table">
                { tableHeading }
               </table>
            )}
            <div className="panel u-align-center" style={{marginTop: '1px'}}>
              <p>There are currently no {pluralize(resourceName)}, try creating some!</p>
            </div>
          </div>
        )
      }
      return (
        <div className="container">
          {renderBulkActionMenuItems && renderBulkActionMenuItems()}
          <table className="cms-table">
            { tableHeading ? tableHeading : defaultHeading }
            <tbody>
              { (resourceItems.length > 0 && subHeading) ? subHeading : null }
              { resourceItems.length > 0 ? resourceItems : null }
            </tbody>
          </table>
          { withPaginator && (
            <Paginator currentPage={ withPaginator.pageNumber } totalPages={ withPaginator.totalPages } onChange={ withPaginator.updatePageNumber }/>
          )}
        </div>
      )
    }

    renderPageIndex = (props) => {
      const {
        renderCreateResource,
        meta,
        renderResources,
        resourceName,
        children,
        withSearch,
        withSort,
        renderPageHeaderActions,
        renderAboveIndexContent,
      } = props

      return (
        <Meta {...meta}>
          <main>
            <PageHeader title={`Manage ${pluralize(resourceName)}`}>
              <div className="page-header__actions grid--end grid--center">
                { renderPageHeaderActions && renderPageHeaderActions() }
                <Button className="button" onClick={ () => renderCreateResource(props) }>
                  <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
                  New {resourceName}
                </Button>
              </div>
            </PageHeader>
            {(withSearch || withSort) &&
              <div className="container">
                <div className="page-actions">
                  {withSearch &&
                    <div className="cms-form__control">
                      <input
                        type="text"
                        className="cms-form__input"
                        placeholder={withSearch.placeholder || 'Keywords'}
                        value={withSearch.currentQuery || ''}
                        onChange={(e) => withSearch.updateSearchQuery(e.target.value)} />
                    </div>
                  }
                  {withSort &&
                    <div className="cms-form__control" style={{maxWidth: '300px'}}>
                      <Select
                        style={{minHeight: '46px', minWidth: '235px'}}
                        clearable={false} simpleValue={true}
                        searchable={false} backspaceRemoves={false}
                        placeholder="Sort by"
                        options={withSort.options}
                        value={withSort.currentSort || ''}
                        onChange={(val) => withSort.updateSort(val)} />
                    </div>
                  }
                </div>
              </div>
            }
            { renderAboveIndexContent && renderAboveIndexContent() }
            { renderResources(props) }
            { children }
          </main>
        </Meta>
      )
    }

    renderTableIndex = (props, headingSpan = 1) => {
      const {
        renderCreateResource,
        renderResources,
        resourceName,
        viewOnly,
        editOnly
      } = props

      const tableHeading = (
        <thead>
          <tr>
            <th colSpan={headingSpan} >
              { pluralize(resourceName) }
            </th>
            <th className="cms-table__actions">
              { viewOnly || editOnly ? ( <div/> ) : (
                  <ActionMenu name="Actions">
                    <ActionMenuItem
                      label={`Add ${resourceName}`}
                      onClick={() => renderCreateResource(props)} />
                  </ActionMenu>
                )
              }
            </th>
          </tr>
        </thead>
      )
      return renderResources(props, tableHeading)
    }

    render() {
      return (
        <WrappedComponent {...this.props}
          renderCreateResource={this.renderCreateResource}
          renderDeleteResource={this.renderDeleteResource}
          renderUpdateResource={this.renderUpdateResource}
          renderPageIndex={this.renderPageIndex}
          renderTableIndex={this.renderTableIndex}
          renderResources={this.renderResources}
        />
      )
    }
  }
  //@ts-ignore
  WithIndexHelper.displayName = `WithIndexHelper(${getDisplayName(WrappedComponent)})`
  return WithIndexHelper
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withIndexHelper


const MenuWithConditionalBulkSelector = ({
  children,
  resource,
  renderBulkActionMenuItems,
}) => {

  if (renderBulkActionMenuItems) {
    return (
      <BulkCheckbox id={resource.id} >
        {children}
      </BulkCheckbox>
    )
  }
  return (
    <>
      {children}
    </>
  )
}
