import React from 'react'

import compose from 'javascript/utils/compose'

import withLoader, { PageIsLoadingType, PageReceivedErrorType } from 'javascript/components/hoc/with-loader'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import { ModalStateType } from 'javascript/utils/hooks/use-modal-state'

export type WithPageHelperType = {
  pageReceivedError: PageReceivedErrorType,
  pageIsLoading: PageIsLoadingType,
  modalState: ModalStateType,
}

const withPageHelper = (WrappedComponent) => {
  class WithPageHelper extends React.Component {
    render() {
      return <WrappedComponent {...this.props} />
    }
  }
  //@ts-ignore
  WithPageHelper.displayName = `WithPageHelper(${getDisplayName(WrappedComponent)})`
  const enhance = compose(
    withLoader,
    withModalRenderer
  )
  return enhance(WithPageHelper)
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withPageHelper
