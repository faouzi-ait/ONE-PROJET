import { useRef, useState } from 'react'
import uuid from 'uuid/v4'

interface State {
  whichIsHovering: number | null
  status: 'idle' | 'hovering-during-timeout' | 'hovering'
  reportedBy?: string
}

const useForceReload = () => {
  const [
    // @ts-ignore
    id,
    setId,
  ] = useState(uuid())
  return () => {
    setId(uuid())
  }
}

const useOnMouseOverWatcher = ({
  mouseOverDelay,
  mouseOutDelay,
}: UseOnMouseOverWatcherParams) => {
  const forceReload = useForceReload()
  const stateRef = useRef<State>({ status: 'idle', whichIsHovering: null })

  const getState = () => stateRef.current

  const setState = (newState: Partial<State>) => {
    stateRef.current = { ...stateRef.current, ...newState }
    forceReload()
  }

  const makeOnMouseOver = (index: number) => () => {
    const { whichIsHovering } = getState()
    if (whichIsHovering !== index) {
      setState({
        whichIsHovering: index,
        status: 'hovering-during-timeout',
        reportedBy: 'mouseOver',
      })
      setTimeout(() => {
        const { whichIsHovering, status } = getState()
        if (status === 'hovering-during-timeout' && whichIsHovering === index) {
          setState({
            whichIsHovering: index,
            status: 'hovering',
            reportedBy: 'mouseOver',
          })
        }
      }, mouseOverDelay)
    }
  }

  const makeOnMouseOut = index => () => {
    const { whichIsHovering } = getState()
    setTimeout(() => {
      if (whichIsHovering === index) {
        setState({
          status: 'idle',
          whichIsHovering: null,
          reportedBy: 'mouseOut',
        })
      }
    }, mouseOutDelay)
  }

  /**
   * We need to be able to check for mouse move events
   * outside of the element.
   */
  const makeOnMouseMoveFromIndex = (index: number) => (
    element: HTMLElement,
  ) => (event: MouseEvent) => {
    setTimeout(() => {
      if (!element || !event.target) return false
      const { status, whichIsHovering } = getState()

      if (
        element.contains(
          // @ts-ignore - this is fine
          event.target,
        )
      ) {
      } else {
        if (
          index === whichIsHovering &&
          (status === 'hovering-during-timeout' || status === 'hovering')
        ) {
          setState({
            status: 'idle',
            whichIsHovering: null,
            reportedBy: 'mouseMove',
          })
        }
      }
    }, mouseOutDelay)
  }

  const isThisIndexHovering = index => {
    const { whichIsHovering, status } = getState()
    return whichIsHovering === index && status === 'hovering'
  }

  const { status } = getState()

  return {
    makeOnMouseOut,
    makeOnMouseOver,
    makeOnMouseMoveFromIndex,
    isThisIndexHovering,
    areAnyHovering: status === 'hovering',
    makeShouldTrackMouseMoves: index => {
      const { whichIsHovering, status } = getState()
      return (
        index === whichIsHovering &&
        (status === 'hovering-during-timeout' || status === 'hovering')
      )
    },
  }
}

interface UseOnMouseOverWatcherParams {
  mouseOverDelay: number
  mouseOutDelay: number
}

export default useOnMouseOverWatcher

export const OnMouseOverWatcher: React.FC<
  UseOnMouseOverWatcherParams & {
    children: (params: ReturnType<typeof useOnMouseOverWatcher>) => any
  }
> = ({ children, ...props }) => {
  const params = useOnMouseOverWatcher(props)
  return children(params)
}
