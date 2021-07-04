import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import { RouteComponentProps } from 'react-router'

import { findOneByModel, query } from 'javascript/utils/apiMethods'
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
 backUrl: string
}

interface Props extends RouteComponentProps<MatchParams, any, LocationState>, WithPageHelperType, WithThemeType {}

const ManageSeriesProductionCompanies: React.FC<Props> = ({
  location,
  match,
  pageIsLoading,
  theme,
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

  const backUrl = () => {
    if (location.state?.backUrl) {
      return location.state.backUrl + location.search
    }
    return `/admin/${theme.localisation.programme.path}/${match.params.programme}/${theme.localisation.series.path}`
  }

  return (
    <main>
      <PageHeader
        title={`Manage ${series ? series.name : ''} ${pluralize(
          theme.localisation.productionCompany.upper,
        )}`}
      >
        <NavLink
          to={backUrl()}
          className="button"
        >
          <Icon
            width="8"
            height="13"
            id="i-admin-back"
            classes="button__icon"
          />
          Back to {pluralize(theme.localisation.series.upper)}
        </NavLink>
      </PageHeader>
      <OrderableIndex
        searchableName={theme.localisation.productionCompany.upper}
        searchableType={'production-companies'}
        indexType={'production-companies-sery'}
        relation={{ series: { id: match.params.series } }}
        fetchResources={() => new Promise<OrderableListItem[]>((resolve, reject) => {
          query(`series/${match.params.series}/production-companies-series`, 'production-companies-series', {
            fields: ['position', 'production-company'],
            include: ['production-company'],
            includeFields: {
              'production-companies': ['name'],
              'production-companies-series': ['position'],
            },
            filter: {
              'active-series': match.params.series
            },
            sort: 'position'
          }).then((response) => {
            resolve(response.map((pcs) => ({
              ...pcs,
              name: pcs['production-company'].name,
              searchableId: pcs['production-company'].id
            }) as any))
          }).catch(reject)
        })}
      />
    </main>
  )
}

const enhance = compose(
  withPageHelper
)

export default enhance(ManageSeriesProductionCompanies)
