import { useEffect } from 'react'
import useReduxState, { ReduxStateReturn } from 'javascript/utils/hooks/use-redux-state'
import UserStore from 'javascript/stores/user'

interface State {
  isHidden: boolean
  draftBlocksAreVisible: boolean
}

interface Actions {
  resetState: () => void
  toggleToolbar: () => void
  toggleDraftBlocks: () => void
}

type Selectors = {
  isToolbarHidden: () => boolean
  draftBlocksAreVisible: () => boolean
}

export type AdminToolbarStateType = ReduxStateReturn<State> & Actions & Selectors

const getInitialState = () => ({
  isHidden: false,
  draftBlocksAreVisible: false,
})

const useAdminToolbarState = () => {
  const user = UserStore.getUser()

  useEffect(() => {
    adminToolbarReduxState.resetState()
  }, [user])

  const adminToolbarReduxState = useReduxState<State, Actions, Selectors>({
    key: 'adminToolbar',
    initialState: getInitialState(),
    actions: {
      resetState: (state) => getInitialState(),
      toggleDraftBlocks: (state) => ({
        ...state,
        draftBlocksAreVisible: !state.draftBlocksAreVisible,
      }),
      toggleToolbar: (state) => ({
        ...state,
        isHidden: !state.isHidden,
      }),
    },
    selectors: {
      draftBlocksAreVisible: (state) => state.draftBlocksAreVisible,
      isToolbarHidden: (state) => state.isHidden,
    }
  })
  return adminToolbarReduxState
}

export default useAdminToolbarState
