import React from 'react'

// Components
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'
import withTheme from 'javascript/utils/theme/withTheme'

const NewPage = (props) => {
  const {
    resourceName,
    backPath,
    backName,
    form,
    formProps,
    actionButtons,
    children,
    theme,
  } = props
  const Form = form
  const { isEditing } = formProps

  let buttonClasses = 'button'
  /* #region  itv */
  buttonClasses += ' button--filled'
  /* #endregion */

  return (
    <Meta
      title={`${theme.localisation.client} :: ${isEditing ? 'Edit' : 'New'} ${resourceName}`}
      meta={{ description: `${isEditing ? 'Updating' : 'Create New'} ${resourceName}`}}
    >
      <main>
        <PageHeader title={`${isEditing ? 'Edit' : 'New'} ${resourceName}`}>
          <div class="page-header__actions">
            { actionButtons ? actionButtons : null}
            <NavLink to={`${backPath}`} className={buttonClasses} styles={{ paddingRight: '8px'}} >
              <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
              Back to {backName}
            </NavLink>
          </div>
        </PageHeader>
        { Form && <Form {...formProps} /> }
        {children}
      </main>
    </Meta>
  )
}

export default withTheme(NewPage)
