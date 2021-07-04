import React from 'react'
import Card from 'javascript/components/cards/collection'

export default (block) => {
  let order = false
  /* #region  itv */
  order = true
  /* #endregion */
  return (
    <Card
      id={block.collection}
      size={block.numberOfItems}
      order={order && block.order} />
  )
}