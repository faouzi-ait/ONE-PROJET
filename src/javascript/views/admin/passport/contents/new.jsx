import React from 'react'

// Components
import Form from 'javascript/views/admin/passport/contents/form'
import IndexPageHeader from 'javascript/components/index-helpers/index-page-header'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportContentsNew = (props) => {
  const { marketId } = props.match.params
  const { localisation } = useTheme()
  return (
    <IndexPageHeader
      resourceName={localisation.passport.content.upper}
      backPath={`/admin/${localisation.passport.market.path}/${marketId}/edit`}
      backName={localisation.passport.market.upper}
      form={Form}
      formProps={{
        isEditing: false,
        location: null,
        user: props.user,
      }}
    />
  )
}

export default PassportContentsNew
