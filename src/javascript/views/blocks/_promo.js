import React from 'react'
import { NavLink } from 'react-router-dom'
import 'stylesheets/core/components/promo'
let logo
/* #region  ae | all3 | amc | banijaygroup | demo | discovery | endeavor | fremantle | itv | keshet | rtv | storylab | wildbrain */
logo = require('images/theme/logo-header.svg')
/* #endregion */
/* #region  drg */
logo = require('images/theme/logos/DRG-Transparent.png')
/* #endregion */

export default (block, assets, props) => {
  const backgroundImage = assets['page-images'] && assets['page-images'].find(a => a.id === block.backgroundImage[0].imageIds[0])
  const style = backgroundImage ? {
    backgroundImage: `url(${backgroundImage.file.url})`
  } : null
  const image = assets['page-images'] && assets['page-images'].find(a => a.id === block.image[0].imageIds[0])
  return (
    <>
    /* #region  ae | all3 | amc | banijaygroup | cineflix | demo | discovery | endeavor | fremantle | itv | keshet | rtv | storylab | wildbrain */
    <article className="promo" style={style}>
    /* #endregion */</article>
    /* #region  drg */
    <article className={["promo", backgroundImage ? '' : 'promo--nobg'].join(" ")} style={style}>
      /* #endregion */

      <div className="promo__content">
        {block.showLogo &&
          <div className="promo__brand"><img src={logo} /></div>
        }
        {block.title &&
          <div>
            <div className="promo__title">
              <h1 className="heading--one">{block.title}</h1>
            </div>
          </div>
        }
        {block.content &&
          <div>
            <div className="promo__contents">{block.content}</div>
          </div>
        }
        {block.buttonLink &&
          <div className="promo__action">
            <NavLink to={block.buttonLink} className="button button--filled">
              {block.buttonText ? block.buttonText : 'Read More...'}
            </NavLink>
          </div>
        }
      </div>
      {image &&
        <>
        <img src={image.file.url} alt={block.image[0].alt} className="promo__media" />
        </>
      }
    </article>
    </>
  )
}