import React from 'react'
import Meta from 'react-document-meta'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Tabs from 'javascript/components/tabs'

import SortableTree from 'javascript/views/admin/navigation/sortable-tree'
import { WithThemeType } from 'javascript/utils/theme/withTheme'

interface Props extends WithThemeType {}

const NavigationIndex: React.FC<Props> = (props) => {

  const { localisation, features, variables } = props.theme
  return (
    <Meta
      title={`${localisation.client} :: Navigation`}
      meta={{ description: `Manage/Sort navigation menus` }}
    >
      <main>
        <PageHeader title={`Manage Navigation`} />
        <Tabs>
          <div title={'Main Navigation'}>
            <SortableTree navigationType={'main'} maxDepth={2} allowChildren={[variables.SystemPages.account.upper]} />
          </div>
          <div title={'Footer'}>
            <SortableTree navigationType={'footer'} />
          </div>
          {features.navigation.centeredNav &&
            <div title={'Centered Navigation'}>
              <SortableTree navigationType={'featured'} />
            </div>
          }
          {features.navigation.megaNav &&
            <div title={'Mega Navigation'}>
              <SortableTree navigationType={'mega'} maxDepth={2} />
            </div>
          }
          {features.navigation.accountNav &&
            <div title={'Account Navigation'}>
              <SortableTree navigationType={'account'} />
            </div>
          }
        </Tabs>
      </main>
    </Meta>
  )


}


export default NavigationIndex
