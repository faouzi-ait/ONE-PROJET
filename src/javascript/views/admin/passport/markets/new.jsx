import React from 'react'
import pluralize from 'pluralize'

import Form from 'javascript/views/admin/passport/markets/form'
import IndexPageHeader from 'javascript/components/index-helpers/index-page-header'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportMarketsNew = (props) => {
  const { localisation: Localisation } = useTheme()
  return (
    <IndexPageHeader
      resourceName={Localisation.passport.market.upper}
      backPath={`/admin/${Localisation.passport.market.path}`}
      backName={pluralize(Localisation.passport.market.upper)}
      form={Form}
      formProps={{
        isEditing: false,
        resource: null,
      }}
    />
  )
}

export default PassportMarketsNew