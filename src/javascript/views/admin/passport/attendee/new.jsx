import React, { useEffect } from 'react'

// Components
import Form from 'javascript/containers/passport/attendee/form'
import IndexPageHeader from 'javascript/components/index-helpers/index-page-header'

// HOC
import withLoader from 'javascript/components/hoc/with-loader'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportAttendeeNew = (props) => {

  const { localisation } = useTheme()
  const { marketId } = props.match.params

  useEffect(() => {
    props.pageIsLoading(false)
  }, [marketId])

  return (
    <IndexPageHeader
      resourceName={localisation.passport.attendee}
      backPath={`/admin/${localisation.passport.market.path}/${marketId}/spreadsheet`}
      backName={localisation.passport.spreadsheet}
      form={Form}
      formProps={{
        isEditing: false,
        resource: null,
        pageIsLoading: props.pageIsLoading,
        cms: true,
        returnPath: `/admin/${localisation.passport.market.path}/${marketId}/spreadsheet`
      }}
    />
  )
}

export default withLoader(PassportAttendeeNew)