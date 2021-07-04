import React from 'react'
import Pages from 'javascript/components/cards/pages'
import getGridClass from 'javascript/utils/helper-functions/get-grid-class'

export default (block, props) => (

  /* #region  ae | all3 | amc | banijaygroup | cineflix | demo | discovery | endeavor | fremantle | drg | keshet | rtv | storylab | wildbrain */
  <Pages ids={block.pages.map(p => p.resource.id)} render={children => (
  /* #endregion */)} />
  /* #region  itv */
  <Pages ids={block.pages.map(p => p.resource&&p.resource.id)} order={block.order} render={children => (
  /* #endregion */

    <div className={`grid grid--${getGridClass(block.numberOfItems)}`} {...props}>{children}</div>
  )} />
)