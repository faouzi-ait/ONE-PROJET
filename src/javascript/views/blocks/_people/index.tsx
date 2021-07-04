import React from 'react'
import withTheme from 'javascript/utils/theme/withTheme'

import { BlockFunction } from 'javascript/views/blocks/types/BlockFunction'
import { PageImageType } from 'javascript/types/ModelTypes'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

import compose from 'javascript/utils/compose'
import peopleClientVariables from './variables'
import cardClientVariables from 'javascript/components/card/variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'

import 'stylesheets/core/components/people'

const People: BlockFunction<Props['block']> = ({
  assets,
  block,
  theme
}) => {

  const peopleCV = useClientVariables(peopleClientVariables)
  const cardCV = useClientVariables(cardClientVariables)

  return (
    <div className="people">
      { block.title &&
        <h2 className="content-block__heading people__heading">{block.title}</h2>
      }
      <div className={`grid grid--${peopleCV.grid}`}>
        { block.people.map((p, i) => {
          const image = assets['page-images'] && assets['page-images'].find(d => p.imageIds.includes(d.id))
          return (

            <div className="card card--person people__person" key={i}>

              { image &&
                <img srcSet={`${image.file.url.replace('.net/', `.net/${cardCV.peopleImageX}x${cardCV.peopleImageY}/`)},
                  ${image.file.url.replace('.net/', `.net/${(cardCV.peopleImageX)*2}x${(cardCV.peopleImageY)*2}/`)} 2x`} alt={p.name} className="card__media" />
              }
              <div className="card__content">
                <h3 className="card__title">{p.name}</h3>
                { p.job &&
                  <p className={peopleCV.copyClasses}>{p.job}</p>
                }
                { p.bio &&
                  <p className="card__copy">{p.bio}</p>
                }
                <p className="card__copy">
                  { p.email &&
                    <span><a href={`mailto:${p.email}`} className="people__mail-link">{p.email}</a><br /></span>
                  }
                  { p.telephone &&
                    <span><a href={`tel:${p.telephone}`} className="people__tel-link">{ p.telephone }</a><br/></span>
                  }
                  { p.linkedin &&
                    <span><a href={ p.linkedin } target="_blank" className="people__linkedin-link">{ p.linkedin }</a></span>
                  }
                </p>
                {p.tags?.length > 0 && (
                  <div className="card-tags">
                    {p.tags.map((tag, i) => (
                      <span key={tag.value + i} className="card__tag tag">{tag.label}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

}

const PeopleBlock: BlockFunction<Props['block']> = (
  block,
  assets,
  props,
) => {
  return (
    <EnhancedPeopleBlock
      block={block}
      assets={assets}
      {...props}
    />
  )
}

export default PeopleBlock

const enhance = compose(
  withTheme,
)

const EnhancedPeopleBlock = enhance(People)

interface Props {
  block: any
  assets: {
    'page-images': PageImageType[]
  }
  theme: CustomThemeType,
  peopleCV: any
}