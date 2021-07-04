// React
import React from 'react'
import pluralize from 'pluralize'

import { pageTypeDisplayName } from 'javascript/utils/hooks/use-system-pages'
import { getPagesToPreventAddingContentBlocksDataTo } from 'javascript/utils/helper-functions/get-pages-to-prevent-adding-content-blocks-to'
import withTheme from 'javascript/utils/theme/withTheme'

import {
  ActionMenu,
  ActionMenuItem,
} from 'javascript/components/admin/action-menu'

import { PageType, CollectionType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import compose from 'javascript/utils/compose'
import withSystemPages, { WithSystemPagesType } from 'javascript/components/hoc/with-system-pages'

interface State {
  open: boolean
}

type Resource = PageType | CollectionType

interface Props extends WithSystemPagesType {
  resource: Resource
  editEvent?: (resource: Resource) => void
  deleteEvent: (resource: Resource) => void
  newEvent?: (type: 'Page', resource: Resource) => void
  classes: string[]
  editMetadata: (resource: Resource) => void
  theme: ThemeType
}

class Page extends React.Component<Props, State> {
  state = {
    open: false,
  }

  toggle = () => {
    this.setState(({ open }) => ({
      open: !open,
    }))
  }

  render() {
    const {
      resource,
      editEvent,
      deleteEvent,
      newEvent,
      classes,
      editMetadata,
      systemPages,
      theme,
    } = this.props

    const isStatic = resource.type === 'pages' && resource['page-type'] !== 'generic'
    const preventAddingContentToTheseSlugs = getPagesToPreventAddingContentBlocksDataTo(theme)
    const isEditable = !resource.slug || (resource.slug !== theme.variables.SystemPages.home.path && resource.slug !== 'kids')
    const shouldPreventAddingContent = preventAddingContentToTheseSlugs.includes(resource.slug)

    const row = () => {
      return (
        <tr className="with-action">
          {resource.type === 'collections' && (
            <th className="cms-table__toggle">
              <button
                className={['cms-table__trigger', this.state.open && 'open'].join(
                  ' cms-table__trigger--',
                )}
                onClick={this.toggle}
              ></button>
            </th>
          )}
          <th>
            {isStatic ? pageTypeDisplayName(resource['page-type']) : resource.title}
          </th>
          {resource.type === 'collections' && (
            <th className="label">
              <span className="count count--disabled">Collection</span>
            </th>
          )}
          {theme.features.pages.private && resource['private-page'] &&
            <th className="label">
              <span className="count count--warning">Private</span>
            </th>
          }
          {isStatic ? (
            <th>
              {resource.title}
            </th>
          ) : (
            <th className="label">
              {resource.published ? (
                <span className="count count--success">Published</span>
              ) : (
                <span className="count count--warning">Unpublished</span>
              )}
            </th>
          )}
          <th className="cms-table__actions">

            <ActionMenu name="Actions">
              {isEditable && (
                <>
                  {editEvent &&
                    <ActionMenuItem
                      label="Edit"
                      onClick={() => {
                        editEvent(resource)
                      }}
                    />
                  }
                  {!isStatic &&
                    <ActionMenuItem
                      label="Delete"
                      onClick={() => {
                        deleteEvent(resource)
                      }}
                    />
                  }
                </>
              )}

              {resource.type === 'pages' && !shouldPreventAddingContent && (
                <ActionMenuItem
                  label="Manage Content"
                  link={`/admin/pages/${resource.id}/edit`}
                  divide
                />
              )}

              {resource.type === 'collections' && !shouldPreventAddingContent && (
                <ActionMenuItem
                  label="Manage Content"
                  link={`/admin/pages/collection/${resource.id}/content`}
                  divide
                />
              )}

              {(!isStatic || resource.slug === theme.variables.SystemPages.home.path) && (
                <ActionMenuItem
                  label="Manage Meta Data"
                  onClick={() => {
                    editMetadata(resource)
                  }}
                />
              )}

              <ActionMenuItem
                label="Manage Images"
                link={`/admin/pages/${pluralize.singular(resource.type)}/${
                  resource.id
                }/images`}
                divide
              />

              {systemPages.isViewablePage(resource.slug) &&
                <ActionMenuItem
                  label="View"
                  href={`/${systemPages.getFullPath(resource.slug)}`}
                  divide
                />
              }

              {newEvent && (
                <ActionMenuItem
                  label="Add New Page"
                  onClick={() => {
                    newEvent('Page', resource)
                  }}
                />
              )}
            </ActionMenu>
          </th>
        </tr>
      )
    }

    if (isStatic) {
      return row()
    }

    return (
      <table
        className={classes.join(' ')}
      >
        <thead>
          {row()}
        </thead>
        {this.state.open && this.props.children}
      </table>
    )
  }
}

const enhance = compose(
  withSystemPages,
  withTheme
)

export default enhance(Page)
