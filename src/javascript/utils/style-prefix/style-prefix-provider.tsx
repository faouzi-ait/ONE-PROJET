import React from 'react'

export type StylePrefixType = 'application' | 'admin'

export const StylePrefixContext = React.createContext<StylePrefixType>('application')

interface Props {
  entryPoint?: StylePrefixType
}

const StylePrefixProvider: React.FC<Props> = ({
  entryPoint = 'application',
  children
}) => {
  return (
    <StylePrefixContext.Provider value={entryPoint}>
      {children}
    </StylePrefixContext.Provider>
  )
}

export default StylePrefixProvider

