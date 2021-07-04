import React from 'react'

export default (block, assets, props, isMedia = false) => {
  const lastImage = block.images.length
  return (
    <div className="content-block__grid">
      {block.images.map((i, key) => {
        const image = (assets['page-images'] || []).find(d => i.imageIds.includes(d.id))
        if (image) {
          return (
            <div key={key}>
              { (key + 1) === lastImage && (key + 1) % 2 && !isMedia ? (
                <picture>
                  <source srcSet={`${image.file.url.replace('.net/', '.net/280xnull/')}, ${image.file.url.replace('.net/', '.net/560xnull/')} 2x`} media="(max-width: 320px)"/>
                  <source srcSet={`${image.file.url.replace('.net/', '.net/1024xnull/')}, ${image.file.url.replace('.net/', '.net/2048xnull/')} 2x`} media="(max-width: 1024px)"/>
                  <source srcSet={`${image.file.url.replace('.net/', '.net/568xnull/')}, ${image.file.url.replace('.net/', '.net/1136xnull/')} 2x`} media="(max-width: 568px)"/>
                  <source srcSet={`${image.file.url.replace('.net/', '.net/768xnull/')}, ${image.file.url.replace('.net/', '.net/1536xnull/')} 2x`} media="(max-width: 767px)"/>
                  <img srcSet={`${image.file.url.replace('.net/', '.net/1180xnull/')}, ${image.file.url.replace('.net/', '.net/2360xnull/')} 2x`} alt={i.alt} className="content-block__image"/>
                </picture>
              ) : (
                <picture>
                  <source srcSet={`${image.file.url.replace('.net/', '.net/280xnull/')}, ${image.file.url.replace('.net/', '.net/560xnull/')} 2x`} media="(max-width: 320px)"/>
                  <source srcSet={`${image.file.url.replace('.net/', '.net/568xnull/')}, ${image.file.url.replace('.net/', '.net/1136xnull/')} 2x`} media="(max-width: 568px)"/>
                  <source srcSet={`${image.file.url.replace('.net/', '.net/768xnull/')}, ${image.file.url.replace('.net/', '.net/1536xnull/')} 2x`} media="(max-width: 767px)"/>
                  /* #region  ae | all3 | amc | banijaygroup | cineflix | demo | discovery | endeavor | fremantle | drg | itv | keshet | rtv */
                  <img srcSet={`${image.file.url.replace('.net/', '.net/580xnull/')} 580w, ${image.file.url.replace('.net/', '.net/870xnull/')} 870w ,${image.file.url.replace('.net/', '.net/1160xnull/')} 1160w`} alt={i.alt} className="content-block__image"/>
                  /* #endregion */
                  /* #region  storylab */ | wildbrain */
                  <img srcSet={image.file.url} alt={i.alt} className="content-block__image"/>
                  /* #endregion */
                </picture>
              )}
            </div>
          )
        }
      })}
    </div>
  )
}