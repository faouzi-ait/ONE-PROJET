import React, { useEffect } from 'react'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Form from 'javascript/views/admin/passport/contents/form'
import IndexPageHeader from 'javascript/components/index-helpers/index-page-header'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-loader'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportContentEdit = (props) => {
  const { marketId, resource, user } = props
  const { localisation } = useTheme()
  return (
    <IndexPageHeader
      resourceName={localisation.passport.content.upper}
      backPath={`/admin/${localisation.passport.market.path}/${marketId}/edit`}
      backName={pluralize(localisation.passport.market.upper)}
      form={Form}
      formProps={{
        isEditing: true,
        resource,
        user
      }}
    />
  )
}

const enhance = compose(
  withLoader,
  withHooks(props => {
    const { marketId, contentId } = props.match.params
    const relation = {
      name: 'passport-market',
      id: marketId
    }
    const contentsReduxResource = nameSpaced('passport', useReduxResource('passport-content', 'passport/contents', relation))
    const isContentLoading = contentsReduxResource.queryState.isLoading

    useEffect(() => {
      contentsReduxResource.findOne(contentId, {
        fields: {
          'passport-contents': 'active,content-blocks,description,name'
        }
      })
    }, [])

    useEffect(() => {
      props.pageIsLoading([isContentLoading])
    }, [isContentLoading])

    return {
      ...props,
      marketId,
      resource: contentsReduxResource.getReduxResource(contentId),
    }
  })
)

export default enhance(PassportContentEdit)