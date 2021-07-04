import { ThemeType } from './types/ThemeType'
import { ThemeContext } from './ThemeProvider'
import { useContext } from 'react'

const useTheme = (): ThemeType => {
  const theme = useContext(ThemeContext)
  return theme
}

export default useTheme