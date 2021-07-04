import React from 'react'

import MostPopularProgrammes from 'javascript/components/most-popular'

const MostPopularBlock = (block, assets, props) => {
  return (
    <MostPopularProgrammes title={block.title} {...props} />
  )
}

export default MostPopularBlock
