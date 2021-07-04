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
}

interface Props extends RouteComponentProps<MatchParams>, WithPageHelperType, WithThemeType {}

const ManageProgrammeProductionCompanies: React.FC<Props> = ({
  match,
  pageIsLoading,
  theme,
}) => {

  const [programme, setProgramme] = useState(null)

  useEffect(() => {
    findOneByModel('programmes', Number(match.params.programme), {
      fields: ['title']
    }).then((response) => {
      pageIsLoading(false)
      setProgramme(response)
    })
  }, [])

  return (
    <main>
      <PageHeader
        title={`Manage ${programme ? programme.title : ''} ${pluralize(theme.localisation.productionCompany.upper)}`}
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
        searchableName={theme.localisation.productionCompany.upper}
        searchableType={'production-companies'}
        indexType={'production-companies-programme'}
        relation={{ programme: { id: match.params.programme } }}
        fetchResources={() => new Promise<OrderableListItem[]>((resolve, reject) => {
          query(`programmes/${match.params.programme}/production-companies-programmes`, 'production-companies-programmes', {
            fields: ['position', 'production-company'],
            include: ['production-company'],
            includeFields: {
              'production-companies': ['name'],
              'production-companies-programmes': ['position'],
            },
            filter: {
              'active-programmes': match.params.programme
            },
            sort: 'position'
          }).then((response) => {
            resolve(response.map((pcp) => ({
              ...pcp,
              name: pcp['production-company'].name,
              searchableId: pcp['production-company'].id
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

export default enhance(ManageProgrammeProductionCompanies)
