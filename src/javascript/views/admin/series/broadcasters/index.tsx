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
  series: string
}

interface LocationState {
  backUrl? : string
}

interface Props extends RouteComponentProps<MatchParams, any, LocationState>, WithPageHelperType, WithThemeType {}

const SeriesBroadcasters: React.FC<Props> = ({
  location,
  match,
  pageIsLoading,
  theme: { localisation },
}) => {

  const [series, setSeries] = useState(null)

  useEffect(() => {
    findOneByModel('series', Number(match.params.series), {
      fields: ['name']
    }).then((response) => {
      pageIsLoading(false)
      setSeries(response)
    })
  }, [])

  const backUrl = location.state?.backUrl || `/admin/${localisation.programme.path}/${match.params.programme}/${localisation.series.path}`

  return (
    <main>
      <PageHeader
        title={`Manage ${series?.name || ''} ${pluralize(
          localisation.broadcaster.upper,
        )}`}
      >
        <NavLink
          to={backUrl}
          className="button"
        >
          <Icon
            width="8"
            height="13"
            id="i-admin-back"
            classes="button__icon"
          />
          Back to {pluralize(localisation.series.upper)}
        </NavLink>
      </PageHeader>
      <OrderableIndex
        searchableName={localisation.broadcaster.upper}
        searchableType={'broadcasters'}
        indexType={'series-broadcaster'}
        relation={{ series: { id: match.params.series } }}
        fetchResources={() => new Promise<OrderableListItem[]>((resolve, reject) => {
          findAllByModel('series-broadcasters', {
            fields: ['position', 'broadcaster'],
            include: ['broadcaster'],
            includeFields: {
              'broadcasters': ['name'],
              'series-broadcasters': ['position'],
            },
            filter: {
              series: match.params.series
            },
            sort: 'position'
          }).then((response) => {
            resolve(response.map((pb) => ({
              ...pb,
              name: pb.broadcaster.name,
              searchableId: pb.broadcaster.id,
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

export default enhance(SeriesBroadcasters)
