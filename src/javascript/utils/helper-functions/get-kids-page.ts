import { ThemeType } from '../theme/types/ThemeType'

export const getKidsPage = (theme: ThemeType) => {
  return (theme.variables.KidsVersion && window.location.hostname.includes('kids')) || 
  (process.env.NODE_ENV === 'development' && window.location.pathname.includes('kids'))
}