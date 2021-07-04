import React, { useContext, useEffect } from 'react'

interface NavState {
  navitemId: number
  subNav: {
    name: string
    url: string
  }[]
  wide: boolean
  setShouldShowPrompt: (shouldShowPrompt: boolean) => void
  shouldShowPrompt: boolean
}

export const AdminSubnavContext = React.createContext<NavState>(undefined)

export const AdminSubnavProvider = AdminSubnavContext.Provider

export const AdminSubnavConsumer = AdminSubnavContext.Consumer

export const useSetAdminPrompt = (): ((shouldShowPrompt: boolean) => void) => {
  const context = useContext(AdminSubnavContext)

  /** When unmounting, set the prompt to false */
  useEffect(() => {
    return () => {
      if (context)
        context.setShouldShowPrompt(false)
    }
  }, [])

  if (!context) {
    return undefined
  }

  return shouldShowPrompt => {
    if (context.shouldShowPrompt !== shouldShowPrompt) {
      context.setShouldShowPrompt(shouldShowPrompt)
    }
  }
}
