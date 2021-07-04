import useTheme from 'javascript/utils/theme/useTheme'
import {getVideoProviders} from 'javascript/components/hoc/with-video-providers'

const useVideoProviders = () => {
  const theme = useTheme()
  return getVideoProviders(theme)
}

export default useVideoProviders
