import React from 'react'

export default (block, assets, props = {}) => (
  <div className="grid grid--three">
    {block.items.map((v, i) => {
      return (
        <div key={i} className="content-block__service">
          <h3>{v.title}</h3>
          <p>{v.intro}</p>
        </div>
      )
    })}
  </div>
)