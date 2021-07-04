import React from 'react'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import castCrewClientVariables from './variables'

import { BlockFunction } from 'javascript/views/blocks/types/BlockFunction'
import { PageImageType } from 'javascript/types/ModelTypes'

const CastCrew: BlockFunction<Props['block']> = ({
  assets,
  block,
  castCrewCV
}) => {
  return (
    <div>
      { block.title &&
        <h2 className="content-block__heading">{block.title}</h2>
      }
      <div className={`grid grid--${castCrewCV.grid}`}>

        { block.people.map((p, i) => {
          const image = assets['page-images'] && assets['page-images'].find(d => p.imageIds.includes(d.id))
          return (
            <div className="card card--cast" key={i}>
              { image &&
                <img 
                  srcSet={`
                    ${image.file.url.replace('.net/', `.net/${castCrewCV.imageWidth}x${castCrewCV.imageHeight}/`)}, 
                    ${image.file.url.replace('.net/', `.net/${castCrewCV.imageWidth * 2}x${castCrewCV.imageHeight * 2}/`)} 2x`
                  } 
                  alt={ p.name } 
                  className="card__media" />
              }
              <div className="card__content">
                <h3 className="card__title">{ p.name }</h3>
                <p className={castCrewCV.copyClasses}>{ p.role }</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const CastCrewBlock: BlockFunction<Props['block']> = (
  block,
  assets,
  props,
) => {
  return (
    <EnhancedCastCrewBlock
      block={block}
      assets={assets}
      {...props}
    />
  )
}

export default CastCrewBlock

const enhance = compose(
  withClientVariables('castCrewCV', castCrewClientVariables),
)

const EnhancedCastCrewBlock = enhance(CastCrew)

interface Props {
  block: any
  assets: {
    'page-images': PageImageType[]
  }
  castCrewCV: any
}