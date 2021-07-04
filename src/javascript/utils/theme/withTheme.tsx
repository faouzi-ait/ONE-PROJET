import React from 'react'
import { ThemeType } from './types/ThemeType'
import useTheme from './useTheme'

type WithTheme = <T = {}>(component: React.ComponentType<T>) => React.ComponentType<Omit<T, 'theme'>>

export type WithThemeType = {
  theme: ThemeType
}

// @ts-ignore
const withTheme: WithTheme = Component => {
  return React.forwardRef((props, ref) => {
    //@ts-ignore
    const theme = useTheme()
    return <Component {...props} theme={theme} ref={ref}></Component>
  })
}

export default withTheme
