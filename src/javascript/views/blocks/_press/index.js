import React from 'react'

export default (block, assets) => (
  <div className="grid grid--three">
    {block.presses.map((v, i) => {
      const image = assets['page-images'] && assets['page-images'].find(d => v.imageIds.includes(d.id))
      return (
        <div key={i} >
          <blockquote className="quote-card">
            <h2 class="quote-card__title">{v.quote}</h2>

            /* #region  ae | all3 | amc | banijaygroup | cineflix | demo | discovery | endeavor | fremantle | itv | keshet | rtv | storylab | wildbrain */
            { image ?
              <img srcSet={`${image.file.url.replace('.net/', '.net/150x30/')}, ${image.file.url.replace('.net/', '.net/300x60/')} 2x`} alt={ v.name } className="quote-card__media"/>
            :
              <cite>
                <span className="quote-card__name">{v.name}</span>
                <span className="quote-card__author">{v.author}</span>
              </cite>
            }
            /* #endregion */
            /* #region  drg */
            { image &&
              <img srcSet={`${image.file.url.replace('.net/', '.net/150x30/')}, ${image.file.url.replace('.net/', '.net/300x60/')} 2x`} alt={ v.name } className="quote-card__media"/>
            }
            <cite>
              <span className="quote-card__name">{v.name}</span>
              <span className="quote-card__author">{v.author}</span>
            </cite>
            /* #endregion */

          </blockquote>
        </div>
      )
    })}
  </div>
)