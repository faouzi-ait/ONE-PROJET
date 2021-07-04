import React from 'react'

import Meta from 'react-document-meta'
import NavLink from 'javascript/components/nav-link'

// Components
import PageHeader from 'javascript/components/admin/layout/page-header'
import Icon from 'javascript/components/icon'
import Form from 'javascript/views/admin/anonymous-access/form'

import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  theme: ThemeType
}

const AnonymousAccessNew: React.FC<Props> = ({
  theme
}) => {

  return (
    <Meta
      title={`${theme.localisation.client} :: New ${theme.localisation.anonymousAccess.upper}`}
      meta={{
        description: `Create New ${theme.localisation.anonymousAccess.upper}`
      }}
    >
      <main>
        <PageHeader title={`New ${theme.localisation.anonymousAccess.upper}`}>
          <NavLink to={`/admin/${theme.localisation.anonymousAccess.path}`} className="button">
            <Icon id="i-admin-back" classes="button__icon" />
            Back to {theme.localisation.anonymousAccess.upper}
          </NavLink>
        </PageHeader>
        <Form />
      </main>
    </Meta>
  )
}


export default AnonymousAccessNew