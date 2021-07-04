import React from 'react'
import { NO_CUSTOM_BANNER } from 'javascript/utils/constants'

const LoadPageBannerImageMock = (props) => {
  return (
    <div data-testid="LoadPageBannerImageMock">
      {props.children({ image: NO_CUSTOM_BANNER })}
    </div>
  )
}

export default LoadPageBannerImageMock