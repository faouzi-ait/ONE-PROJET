import useReduxState from 'javascript/utils/hooks/use-redux-state'

interface State {
  bulkActionsExist: boolean
  bulkSelectionView: boolean
  hits: number[]
  selectAllIsChecked: boolean
  selectedResources: {
    [key: string]: string
  }
}

interface Actions {
  resetBulkSelectionView: () => void
  resetSelectedResources: () => void
  toggleBulkSelectionView: () => void
  toggleSelectedResource: (payload: {
    id: string
    checked: boolean
  }) => void
  selectAllResouces: (checked: boolean) => void
  setBulkActionsExist: (exist: boolean) => void
  setHits: (hits: number[]) => void
}

type Selectors = {
  isBulkSelectionView: () => boolean
  isResourceSelected: (id: string) => boolean
  isSelectAllChecked: () => boolean
  bulkActionsExist: () => boolean
  getSelectedResources: () => string[]
  getTotalSelected: () => number
}

const getInitialState = () => ({
  bulkActionsExist: false,  // could be that bulk actions do not exist due to features being turned off - in this case bulk selections should not render
  bulkSelectionView: false,
  hits: [],
  selectAllIsChecked: false,
  selectedResources: {}
})

export const allHitsStillSelected = (hits, selectedResources) => {
  for (const hitId of hits) {
    if (!selectedResources[hitId]) return false
  }
  return true
}

const SELECTED = 'selected'
const updateSelectedState = (addToSelections, id, allSelectedResources) => {
  const update = { ...allSelectedResources }
  if (addToSelections && Object.keys(allSelectedResources).length < 500) {
    update[id] = SELECTED
  } else {
    delete update[id]
  }
  return update
}

const useBulkSelectionState = () => {
  return useReduxState<State, Actions, Selectors>({
    key: 'bulkSelection',
    initialState: getInitialState(),
    actions: {
      resetBulkSelectionView: (state) => ({
        ...state,
        bulkSelectionView: false,
        selectAllIsChecked: false,
      }),
      resetSelectedResources: (state) => ({
        ...state,
        selectAllIsChecked: false,
        selectedResources: {}
      }),
      toggleBulkSelectionView: (state) => ({
        ...state,
        bulkSelectionView: !state.bulkSelectionView
      }),
      toggleSelectedResource: (state, payload) => ({
        ...state,
        selectedResources: updateSelectedState(payload.checked, payload.id, state.selectedResources)
      }),
      selectAllResouces: (state, checked) => ({
        ...state,
        selectAllIsChecked: checked,
        selectedResources: state.hits.reduce((acc, hitId) => {
          return updateSelectedState(checked, hitId, acc)
        }, state.selectedResources)
      }),
      setBulkActionsExist: (state, exist) => ({
        ...state,
        bulkActionsExist: exist
      }),
      setHits: (state, hits) => {
        // after a filter event / resultSet change, we need to reset the 'select all' checkbox
        const selectAllNextState = state.selectAllIsChecked && allHitsStillSelected(hits, state.selectedResources)
        return {
          ...state,
          selectAllIsChecked: selectAllNextState,
          hits
        }
      },
    },
    selectors: {
      bulkActionsExist: (state) => state.bulkActionsExist,
      isBulkSelectionView: (state) => state.bulkSelectionView,
      isResourceSelected: (state, id) => !!state.selectedResources[id],
      isSelectAllChecked: (state) => state.selectAllIsChecked,
      getSelectedResources: (state) => Object.keys(state.selectedResources),
      getTotalSelected: (state) => Object.keys(state.selectedResources).length,
    }
  })
}

export default useBulkSelectionState


