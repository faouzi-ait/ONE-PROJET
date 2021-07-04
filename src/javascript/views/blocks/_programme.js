import React from 'react'
import Card from 'javascript/components/cards/programme'

export default (block, props) => (
  <Card id={block.programmeId} {...props} />
)