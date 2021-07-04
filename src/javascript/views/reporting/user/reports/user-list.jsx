import React, { useEffect } from 'react'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withQueryControls from 'javascript/components/hoc/reporting/with-query-controls'
import withTheme from 'javascript/utils/theme/withTheme'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

import Card from 'javascript/components/card'
import ReportSection from 'javascript/components/reporting/section'
import Tabs from 'javascript/components/tabs'
import TitleHeader from 'javascript/components/reporting/title-header'
import Icon from 'javascript/components/icon'

const UserLists = (props) => {
  const { resources, user, query, theme } = props
  const tabs = ['created-by', 'shared-by', 'shared-with']

  const onTabChange = ({value}) => {
    props.searchApi(tabs[value])
  }

  return (
    <ReportSection bg={props.bg}>
      <TitleHeader>{pluralize(theme.localisation.list.upper)}</TitleHeader>
      <Tabs onChange={onTabChange}>
        <div title={`Created by ${user['first-name']}`}></div>
        <div title={`Shared by ${user['first-name']}`}></div>
        <div title={`Shared with ${user['first-name']}`}></div>
      </Tabs>
      <div className="grid grid--six">
        {resources.map(r => (
          <Card
            key={r.id}
            title={r.listName}
            modifiers={['small']}
            image={{src: r.thumbnail}}
            classes={['small', 'list']}
            url={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.reporting.path}/users/${user.id}/lists/${r.id}`}>
            {query.filter && query.filter.tab !== tabs[0] &&
              <p className="card__copy">Shared {query.filter.tab === tabs[1] ? `with ${r['shared-with']}` : `by ${r['shared-by']}`}</p>
            }
            <p className="card__count">
              {theme.variables.ListFolderIcon ?
                <>
                  <Icon id="i-folder" />
                  <span>
                  { r.programmesCount }
                  </span>
                </>
              : r.programmesCount}
            </p>
          </Card>
        ))}
      </div>
    </ReportSection>
  )
}

export default compose(
  withTheme,
  withQueryControls(['tab']),
  withHooks((props) => {
    const relation = {
      'name': 'user-lists',
      'id': props.user.id
    }

    const reduxResource = useReduxResource('reports-user', 'reports/users', relation)
    const searchApi = (tab = 'created-by') => {
      props.query.filter = {tab}
      reduxResource.findOneAndAllRelations(relation, props.query)
    }
    useEffect(searchApi, [
      props.query['filter[tab]'],
      props.user.id,
    ])
    return {
      searchApi,
      resources: reduxResource.queryState.data || []
    }
  })
)(UserLists)