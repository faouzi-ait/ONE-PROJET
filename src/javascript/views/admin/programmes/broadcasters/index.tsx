import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import { RouteComponentProps } from 'react-router'

import { findAllByModel, findOneByModel } from 'javascript/utils/apiMethods'
import compose from 'javascript/utils/compose'
import Icon from 'javascript/components/icon'
import NavLink from 'javascript/components/nav-link'
import OrderableIndex, { OrderableListItem } from 'javascript/components/admin/orderable-index'
import PageHeader from 'javascript/components/admin/layout/page-header'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'
import { WithThemeType } from 'javascript/utils/theme/withTheme'

interface MatchParams {
  programme: string
}

interface Props extends RouteComponentProps<MatchParams>, WithPageHelperType, WithThemeType {}

const ProgrammeBroadcasters: React.FC<Props> = ({
  match,
  pageIsLoading,
  theme,
}) => {

  const [programme, setProgramme] = useState(null)

  useEffect(() => {
    pageIsLoading(!programme)
  }, [programme])

  useEffect(() => {
    findOneByModel('programmes', Number(match.params.programme), {
      fields: ['title']
    }).then(setProgramme)
  }, [])

  return (
    <main>
      <PageHeader
        title={`Manage ${programme?.title || ''} ${pluralize(
          theme.localisation.broadcaster.upper,
        )}`}
      >
        <NavLink
          to={`/admin/${theme.localisation.programme.path}`}
          className="button"
        >
          <Icon
            width="8"
            height="13"
            id="i-admin-back"
            classes="button__icon"
          />
          Back to {pluralize(theme.localisation.programme.upper)}
        </NavLink>
      </PageHeader>
      <OrderableIndex
        searchableName={theme.localisation.broadcaster.upper}
        searchableType={'broadcasters'}
        indexType={'programme-broadcaster'}
        relation={{ programme: { id: match.params.programme } }}
        fetchResources={() => new Promise<OrderableListItem[]>((resolve, reject) => {
          findAllByModel('programme-broadcasters', {
            fields: ['position', 'broadcaster'],
            include: ['broadcaster'],
            includeFields: {
              'broadcasters': ['name'],
              'programme-broadcasters': ['position'],
            },
            filter: {
              programme: match.params.programme
            },
            sort: 'position'
          }).then((response) => {
            resolve(response.map((pb) => ({
              ...pb,
              name: pb.broadcaster.name,
              searchableId: pb.broadcaster.id
            })))
          }).catch(reject)
        })}
      />
    </main>
  )
}

const enhance = compose(
  withPageHelper
)

export default enhance(ProgrammeBroadcasters)
