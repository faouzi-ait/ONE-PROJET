import React, { useEffect } from 'react'
import moment from 'moment'
import pluralize from 'pluralize'
import { RouteComponentProps } from 'react-router'
import NavLink from 'javascript/components/nav-link'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withLoader from 'javascript/components/hoc/with-loader'

// Components
import PageHeader from 'javascript/components/admin/layout/page-header'
import Meta from 'react-document-meta'
import Icon from 'javascript/components/icon'
import ListItem from 'javascript/views/admin/anonymous-access/list-item'

import { ThemeType } from 'javascript/utils/theme/types/ThemeType'


interface MatchParams {
  id: string
}

interface Props extends RouteComponentProps<MatchParams> {
  pageIsLoading: (state: boolean) => void
  theme: ThemeType
}

const AnonymousAccessShow: React.FC<Props> = ({
  match,
  pageIsLoading,
  theme
}) => {

  const anonAccessId = match.params.id
  const anonAccessResource = useResource('anonymous-access')
  const getAnonymousAccess = () => {
    if (anonAccessId) {
      anonAccessResource.findOne(anonAccessId, {
        include: 'list,programmes,series,videos',
        fields: {
          'anonymous-access': 'name,expires-after,view-count-sum,view-count-limit,list,programmes,series,videos',
          'lists': 'name',
          'programmes': 'title-with-genre,restricted,active',
          'series': 'name,programme-id,programme-name,restricted,active',
          'videos': 'name,programme-id,programme-name,programme-title-with-genre,series-id,series-name,episode-id,episode-name,restricted,public-video'
        }
      })
      .then((response) => {
        pageIsLoading(false)
      })
    }
  }

  useEffect(() => {
    getAnonymousAccess()
  }, [])

  const resource = anonAccessResource.getDataById(anonAccessId) || {}
  const renderResource = () => {
    return (
      <table className="cms-table cms-table--programme">
        <tbody>
          <tr>
            <td><strong>Name</strong></td>
            <td>{resource['name']}</td>
          </tr>
          <tr>
            <td><strong>Recipients</strong></td>
            <td>{(resource['emails'] || []).join(', ')}</td>
          </tr>
          <tr>
            <td><strong>Message</strong></td>
            <td>{resource['message']}</td>
          </tr>
          <tr>
            <td><strong>Expires After</strong></td>
            <td>{resource['expires-after']
              ? moment(resource['expires-after']).format(theme.features.formats.shortDate)
              : ''
            }</td>
          </tr>
          <tr>
            <td><strong>View Limit (per email)</strong></td>
            <td>{resource['view-count-limit']}</td>
          </tr>
          <tr>
            <td><strong>List</strong></td>
            <td>{resource.list?.name}</td>
          </tr>
        </tbody>
      </table>
    )
  }

  const renderListItems = (listItems = []) => {
    return (
      <table className="cms-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Type</th>
            <th>
              {theme.localisation.programme.upper} / {theme.localisation.series.upper} / {pluralize.singular(theme.localisation.episodes.upper)}
            </th>
          </tr>
        </thead>
        <tbody>
          {listItems.map((listResource) =>
            <ListItem key={`${listResource.type}_${listResource.id}`} resource={listResource} viewOnly={true} />
          )}
        </tbody>
      </table>
    )
  }

  return (
    <Meta
      title={`${theme.localisation.client} :: View ${theme.localisation.anonymousAccess.upper}`}
      meta={{
        description: `View ${theme.localisation.anonymousAccess.upper}`
      }}
    >
      <main>
        <PageHeader title={`View ${theme.localisation.anonymousAccess.upper}`}>
          <NavLink to={`/admin/${theme.localisation.anonymousAccess.path}`} className="button">
            <Icon id="i-admin-back" classes="button__icon" />
            Back to {theme.localisation.anonymousAccess.upper}
          </NavLink>
        </PageHeader>
        <div className="container">
          <h3>Details</h3>
          {renderResource()}
        </div>
        <div className="container">
          <h3>List Items</h3>
          {renderListItems([
              ...(resource['programmes'] || []),
              ...(resource['series'] || []),
              ...(resource['videos'] || []),
            ]
            .map((listItem) => ({
              ...listItem,
              isSelected: true,
            }))
          )}
        </div>
      </main>
    </Meta>
  )
}

const enhance = compose(
  withLoader
)

export default enhance(AnonymousAccessShow)
