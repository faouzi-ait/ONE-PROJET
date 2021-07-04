
import React from 'react'
import Icon from 'javascript/components/icon'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'

interface Props {
  small?: boolean
}

export const Loader: React.FC<Props> = ({
  small = false
}) => {
  const width = small ? '30' : '50'
  const height = small ? '12' : '36'
  return (
    <div className={['loader', small && 'loader--small'].filter(Boolean).join(' ')} data-testid="loader">
      <ClientSpecific client="screend">
        <Icon width={width} height={height} viewBox="0 0 50 36" id="i-loading" className="loader__icon" />
      </ClientSpecific>
    </div>
  )
}

export default Loader



