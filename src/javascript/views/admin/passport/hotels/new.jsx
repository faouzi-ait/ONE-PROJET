import React from 'react'

// Components
import Form from 'javascript/views/admin/passport/hotels/form'
import IndexPageHeader from 'javascript/components/index-helpers/index-page-header'
import useTheme from 'javascript/utils/theme/useTheme'


const PassportHotelsNew = (props) => {
  const { marketId } = props.match.params
  const { localisation: Localisation } = useTheme()
  return (
    <IndexPageHeader
      resourceName={Localisation.passport.hotel.upper}
      backPath={`/admin/${Localisation.passport.market.path}/${marketId}/edit`}
      backName={Localisation.passport.market.upper}
      form={Form}
      formProps={{
        isEditing: false,
        resource: null,
      }}
    />
  )
}

export default PassportHotelsNew