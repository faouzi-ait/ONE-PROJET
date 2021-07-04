import { useEffect, useState } from 'react'
import deepEqual from 'deep-equal'
import useReduxState, { ReduxStateReturn } from 'javascript/utils/hooks/use-redux-state'

interface ModalFuncs {
  watchVariables: (varsToWatch: DataObjectType) => void
}

export type ModalStateType = ReduxStateReturn<State> & Actions & Selectors & ModalFuncs

type DataObjectType = {
  [key: string]: any
}

interface ModalContentProps {
  state: DataObjectType
  hideModal: () => void
  showChildModal: (modalFn: ModalContentType) => void
  sharedState: DataObjectType
  setSharedState: (state: DataObjectType) => void
}

export type ModalContentType = (modalProps: ModalContentProps) => JSX.Element

interface State {
  modalIsVisible: boolean
  modalContent: ModalContentType
  modalInjectedState: DataObjectType
  modalChildren: ModalContentType[]
  modalSharedState: DataObjectType
}

interface Actions {
  showModal: (modalFn: ModalContentType) => void
  hideModal: () => void
  setInjectedState: (injectedState: DataObjectType | null) => void
  setSharedState: (sharedState: DataObjectType | null) => void
  showChildModal: (modalFn: ModalContentType) => void
  closeLastModal: () => void
}

type Selectors = {
  isModalVisible: () => boolean
  modalContent: () => ModalContentType
  modalChildren: () => ModalContentType[]
  modalInjectedState: () => DataObjectType
  modalSharedState: () => DataObjectType
}

const getInitialState = () => ({
  modalIsVisible: false,
  modalContent: null,
  modalInjectedState: {},
  modalChildren: [],
  modalSharedState: {},
})

const useModalState: () => ModalStateType = () => {
  const modalReduxState: any = useReduxState<State, Actions, Selectors>({
    key: 'modalView',
    initialState: getInitialState(),
    actions: {
      showModal: (state, payload: ModalContentType) => ({
        ...state,
        modalIsVisible: true,
        modalContent: payload
      }),
      hideModal: (state) => getInitialState(),
      setInjectedState: (state, payload: DataObjectType | null) => ({
        ...state,
        modalInjectedState: payload || {}
      }),
      setSharedState: (state, payload: DataObjectType | null) => {
        if (deepEqual(state.modalSharedState, payload)) {
          return state
        }
        return {
          ...state,
          modalSharedState: payload || {}
        }
      },
      showChildModal: (state, payload: ModalContentType) => {
        const update = [...state.modalChildren]
        update.push(payload)
        return {
          ...state,
          modalChildren: update
        }
      },
      closeLastModal: (state) => {
        const update = [...state.modalChildren]
        if (update.length) {
          update.pop()
          return {
            ...state,
            modalChildren: update
          }
        }
        return getInitialState()
      }
    },
    selectors: {
      isModalVisible: (state) => state.modalIsVisible,
      modalContent: (state) => state.modalContent || null,
      modalInjectedState: (state) => state.modalInjectedState || {},
      modalChildren: (state) => state.modalChildren || [],
      modalSharedState: (state) => state.modalSharedState || {},
    }
  })

  const [variablesWeAreWatching, setVariablesWeAreWatching] = useState({})

  useEffect(() => {
    if (Object.keys(variablesWeAreWatching).length) {
      modalReduxState.setInjectedState(variablesWeAreWatching)
    }
  }, [variablesWeAreWatching])

  modalReduxState.watchVariables = (varsToWatch: DataObjectType) => {
    if (!deepEqual(varsToWatch, variablesWeAreWatching)) {
      return setVariablesWeAreWatching(varsToWatch)
    }
  }

  return modalReduxState
}

export default useModalState


