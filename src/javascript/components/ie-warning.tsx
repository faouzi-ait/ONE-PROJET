import React, {useState} from 'react'

import 'stylesheets/core/components/ie-warning'

const IEWarning = (props) => {
  const [isIE] = useState(!!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g))
  if (isIE) {
    return (
      <div className="ie-warning">
        <div className="ie-warning__title">Update your browser for the best viewing experience.</div>
        <div className="ie-warning__content">
          Without the most up-to-date version of your browser, you can still view this website, but you may have problems viewing our newer features.
        </div>
      </div>
    )
  }
  return null
}

export default IEWarning