import React from "react"
import useAdminToolbarState from "javascript/components/admin-toolbar/use-admin-toolbar-state"
import UserStore from 'javascript/stores/user'
import useTheme from "javascript/utils/theme/useTheme"

interface Props {
  block: any
  renderBlock: () => JSX.Element
}

const ShouldRenderContentBlock: React.FC<Props> = ({
  block,
  renderBlock,
}) => {

  const toolbarState = useAdminToolbarState()
  const { features } = useTheme()
  const user = UserStore.getUser()

  const externalUserBlocks = [
    /* these content blocks will only render for logged in, external users (or as draft blocks)*/
    'account-manager'
  ]

  const isDraftBlock = features.contentBlocks.draftBlocks && block.hasOwnProperty('published') && !block.published

  const isBlockAllowed = () => {
    if (isDraftBlock) return toolbarState.draftBlocksAreVisible()
    if (user) {
      if (user['user-type'] !== 'external' && externalUserBlocks.includes(block.type)) {
        return false
      }
      if (block.type === 'account-manager' && !features.accountManager) {
        return false
      }
    } else {
      if (block.loggedInUserRequired) return false
    }
    return true
  }

  if (isBlockAllowed()) {
    if (isDraftBlock) {
      return (
        <div className="content-block--draft">
          {renderBlock()}
        </div>
      )
    }
    return renderBlock()
  }
  return null
}

export default ShouldRenderContentBlock

