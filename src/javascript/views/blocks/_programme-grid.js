import React from 'react'
import Programmes from 'javascript/components/cards/programmes'

const ProgrammeGridBlock = (block, assets, props) => {
  return (
    <Programmes ids={block.programmes.map((p) => p.resource && p.resource.id)} seriesCount={true} render={(children) => {
        return (
          <div className={`grid grid--${block.columns} grid--full`} >{children}</div>
        )
      }}
    />
  )
}

export default ProgrammeGridBlock
