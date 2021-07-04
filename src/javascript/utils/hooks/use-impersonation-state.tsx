import React, { useEffect } from 'react'
import useReduxState from 'javascript/utils/hooks/use-redux-state'
import { createOneByModel } from 'javascript/utils/apiMethods'
import { AUTH_TOKEN, IMPERSONATED_AUTH_TOKEN } from 'javascript/utils/constants'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'

export const impersonationStateReduxKey = 'impersonation'

export type ImpersonationStatus =
  | 'pending'
  | 'not-impersonating'
  | 'impersonating'

interface State {
  status: ImpersonationStatus
}

interface Actions {
  setImpersonationState: (params: { status: ImpersonationStatus }) => void
}

export const useImpersonationState = () => {
  const {
    setImpersonationState,
    state,
  } = useReduxState<State, Actions>({
    key: impersonationStateReduxKey,
    initialState: {
      status: 'pending',
    },
    actions: {
      setImpersonationState: (state, { status }) => {
        return {
          ...state,
          status
        }
      },
    },
  })

  /** Get the token */
  useEffect(() => {
    const authToken = safeLocalStorage.getItem(AUTH_TOKEN)
    const impersonatedAuthToken = safeLocalStorage.getItem(IMPERSONATED_AUTH_TOKEN)
    if (authToken && impersonatedAuthToken && authToken !== impersonatedAuthToken) {
      setImpersonationState({ status: 'impersonating' })
    } else {
      safeLocalStorage.removeItem(IMPERSONATED_AUTH_TOKEN)
      setImpersonationState({ status: 'not-impersonating' })
    }
  }, [])

  const beginImpersonation = async (params: { userId: string }) => {
    let newToken
    try {
      const result = await createOneByModel('impersonated-user', {
        user: {
          id: params.userId,
        },
      })
      newToken = result.token
      safeLocalStorage.setItem(IMPERSONATED_AUTH_TOKEN, newToken)
      setImpersonationState({ status: 'pending' })
      window.location.reload()
    } catch (e) {
      console.error(e)
    }
  }

  const stopImpersonation = () => {
    safeLocalStorage.removeItem(IMPERSONATED_AUTH_TOKEN)
    window.location.reload()
  }

  return {
    beginImpersonation,
    stopImpersonation,
    status: state?.status,
  }
}

export const ImpersonationStateComponent: React.FC<{
  children: (params: ReturnType<typeof useImpersonationState>) => any
}> = ({ children }) => {
  const params = useImpersonationState()
  return <>{children(params)}</>
}
