import { useRef } from "react";
import uuid from 'uuid/v4'

const useAsyncProcessChecker = () => {
  const processRef = useRef(uuid())
  const begin = (): string => {
    const thisProcessId = uuid()
    processRef.current = thisProcessId
    return thisProcessId
  }

  const checkIfShouldContinue = (id) => {
    return id === processRef.current
  }
  return {
    begin,
    /**
     * Basically, we want the ability to invalidate
     * a process that is already in motion, which
     * is the same method used to begin the process.
     * 
     * Musical Cue: The End Has No End - The Strokes
     */
    end: begin,
    checkIfShouldContinue
  }
}

export default useAsyncProcessChecker