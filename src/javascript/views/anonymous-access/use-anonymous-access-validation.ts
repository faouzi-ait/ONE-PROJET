import { useEffect, useState } from 'react'
import useReduxState from 'javascript/utils/hooks/use-redux-state'
import useResource from 'javascript/utils/hooks/use-resource'

interface ValidTokenType {
  id: string,
  name: string,
  token: string,
}

interface State {
  validToken: ValidTokenType
}

interface Actions {
  setValidToken: (payload: ValidTokenType) => void
}

type Selectors = {
  getValidToken: () => ValidTokenType
}

const getInitialState = () => ({
  validToken: null
})

export const useAnonymousAccessState = () => {
  return useReduxState<State, Actions, Selectors>({
    key: 'anonymousAccess',
    initialState: getInitialState(),
    actions: {
      setValidToken: (state, payload) => ({
        ...state,
        validToken: payload
      }),
    },
    selectors: {
      getValidToken: (state) => state.validToken
    }
  })
}

const useAnonymousAccessValidation = (token, user) => {
  const [accessAllowed, setAccessAllowed] = useState<any>(null)
  const anonymousAccessResource = useResource('anonymous-access')
  const { getValidToken, setValidToken } = useAnonymousAccessState()

  useEffect(() => {
    setAccessAllowed(null)
    if (!user && token) {
      const validTokenObj = getValidToken()
      if (validTokenObj && token !== validTokenObj.token) {
        setValidToken(null)
      }
      anonymousAccessResource.findAll({
        fields: {
          'anonymous-accesses': 'name',
        },
        token
      }).then((response) => {
        if (response.length === 0) throw new Error('No validation found')
        setAccessAllowed({ granted: true })
        setValidToken({
          id: response[0].id,
          name: response[0].name,
          token
        })
      })
      .catch((error) => {
        setAccessAllowed({ denied: true })
        setValidToken(null)
      })
    }
  }, [token, user])

  return accessAllowed
}

export default useAnonymousAccessValidation
