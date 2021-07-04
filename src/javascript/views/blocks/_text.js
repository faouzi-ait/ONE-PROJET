import React from 'react'
import Blocks from 'javascript/views/blocks/index'

export default (block, assets, props) => {
  const classes = ['content-block__media', block.mediaPos, block.media].join(' content-block__media--')
  return (
    <>
    /* #region  ae | amc | banijaygroup | cineflix | demo | discovery | endeavor | fremantle | drg | itv | rtv | storylab | wildbrain */
    <div className={block.media ? 'grid grid--two' : undefined }>
    /* #endregion */ </div>
    /* #region  all3 | keshet */
    <div className={block.media ? 'grid grid--two grid--center' : undefined }>
    /* #endregion */

      {(block.media && block.mediaPos === 'left' || block.media === 'programme') && (
        <div className={classes}>
          {Blocks({
            ...block,
            type: block.media
          }, assets, props, true)}
        </div>
      )}
      <div className="wysiwyg" dangerouslySetInnerHTML={{__html: block.content}}></div>
      {block.media && block.mediaPos === 'right' && block.media !== 'programme' && (
        <div className={classes}>
          {Blocks({
            ...block,
            type: block.media
          }, assets, props, true)}
        </div>
      )}
    </div>
    </>
  )
}