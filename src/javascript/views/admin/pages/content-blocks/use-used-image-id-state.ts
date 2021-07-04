import useReduxState from 'javascript/utils/hooks/use-redux-state'
import extractPageImageIds from 'javascript/utils/helper-functions/extract-page-image-ids'
import { ContentBlockLocationType } from 'javascript/views/admin/pages/content-blocks'

type Merge<T> = { [K in keyof T]: T[K] }
type PayloadType = {
  type: ContentBlockLocationType,
  resourceId: string,
}
type SetPayloadType = Merge<PayloadType & {contentBlocks: any[]}>
type UpdatePayloadType = Merge<PayloadType & { block: any }>

interface State {
  contentBlocks: {
    [typeAndResourceId: string]: any[]
  },
  usedImagesIds: {
    [typeAndResourceId: string]: string[]
  },
}

interface Actions {
  setUsedImageIds: (payload: SetPayloadType) => void
  updateUsedImageIds: (payload: UpdatePayloadType) => void
}

type Selectors = {
  usedImageIds: (payload: PayloadType) => string[]
}

const getInitialState = () => ({
  contentBlocks: {},
  usedImagesIds: {},
})

const trKey = (payload: PayloadType | SetPayloadType | UpdatePayloadType ) => `${payload.type}_${payload.resourceId}`

const useUsedImageIdState = () => {
  return useReduxState<State, Actions, Selectors>({
    key: 'usedImageIds',
    initialState: getInitialState(),
    actions: {
      setUsedImageIds: (state, payload: SetPayloadType) => ({
        ...state,
        contentBlocks: {
          ...state.contentBlocks,
          [trKey(payload)]: payload.contentBlocks,
        },
        usedImagesIds: {
          ...state.usedImagesIds,
          [trKey(payload)]: extractPageImageIds(payload.contentBlocks)
        }
      }),
      updateUsedImageIds: (state, payload: UpdatePayloadType) => {
        const contentBlocks = state.contentBlocks[trKey(payload)] || []
        let cbUpdate = [...contentBlocks]
        if (!payload.block.id) { // new content-block not saved yet.
          cbUpdate.push(payload.block)
        } else {
          cbUpdate = contentBlocks.reduce((acc, cb, i) => [
            ...acc,
            cb.id === payload.block.id ? payload.block : contentBlocks[i]
          ], [])
        }
        return {
          ...state,
          contentBlocks: {
            ...state.contentBlocks,
            [trKey(payload)]: cbUpdate,
          },
          usedImagesIds: {
            ...state.usedImagesIds,
            [trKey(payload)]: extractPageImageIds(cbUpdate)
          }
        }
      },
    },
    selectors: {
      usedImageIds: (state, payload: PayloadType) => state.usedImagesIds[trKey(payload)] || []
    }
  })
}

export default useUsedImageIdState


