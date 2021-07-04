import React from 'react'
import { NavLink } from 'react-router-dom'

import withTheme from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

import 'stylesheets/core/components/content-blocks/featured-content-grid'

import ProgrammePlaceholder from 'images/theme/programme-placeholder.jpg'

import Store from 'javascript/stores/programmes'

import Actions from 'javascript/actions/programmes'

import Carousel from 'javascript/components/carousel'


class FeaturedContentGrid extends React.Component {
  constructor(props){
    super(props)

    this.getProgrammeIds(props.block)
  }

  state = {
    slots: []
  }

  componentWillMount(){
    Store.on('dataChange', this.programmesToState)
  }

  componentWillUnmount(){
    Store.removeListener('dataChange', this.programmesToState)
  }

  componentWillReceiveProps = (nextProps) => {
    this.getProgrammeIds(nextProps.block)
    this.setState({
      block: nextProps.block
    }, () => {
      this.getProgrammes()
      this.programmesToState()
    })
  }

  componentDidMount(){
    this.getProgrammes()
  }

  getProgrammeIds = (block) => {
    this.programmeIds = Object.values(block.slots)
      .reduce((ids, slot) => {
        const slotIds = Object.values(slot.items)
          .filter(item => item.type === 'programme' && !!item.programme)
          .map(item => item.programme.id)

        return [...ids, ...slotIds]
      }, [])
  }

  getProgrammes = () => {
    Actions.getDataResources({
      filter: {
        ids: this.programmeIds.join(',')
      },
      fields: {
        programmes: 'title,logo,thumbnail'
      }
    })
  }

  programmesToState = () => {
    const {block} = this.props
    const programmes = Store.getDataResources(this.programmeIds)

    let slots = Object.values(block.slots).map(slot => ({
      ...slot,
      items: Object.values(slot.items).filter(item => !(!item.programme && item.type === 'programme')).map(item => {
        if(item.type !== 'programme'){
          return item
        }

        return {
          ...item,
          programme: programmes.find(p => p.id === item.programme.id)
        }
      })
    }))

    this.setState({ slots })
  }

  render() {
    const {assets} = this.props
    const {slots} = this.state

    return (
      <div className="featured-content-grid">
        {slots.map((slot, index) => {
          let imageRes
          /* #region  ae | amc | banijaygroup | demo | endeavor | drg | itv | keshet | rtv | storylab | wildbrain */
          imageRes = index === 0 ? '.net/580x370/' : '.net/280x175/'
          /* #endregion */
          /* #region  cineflix */
          imageRes = index === 0 ? '.net/580x340/' : '.net/280x160/'
          /* #endregion */
          /* #region  banijaygroup | discovery | fremantle */
          imageRes = index === 0 ? '.net/580x332/' : '.net/280x156/'
          /* #endregion */
          /* #region  all3 */
          imageRes = index === 0 ? '.net/820x480/' : '.net/400x230/'
          /* #endregion */
          return (
            <Carousel classes={['fixed-dots']} options={{ dots: true, fullWidth: true }} key={slot.id}>
              {slot.items.map(item => {
                const image = assets['page-images'] && assets['page-images'].find(image => image.id === item.imageId)

                return (
                  <div key={item.id}>
                    {(item.type === 'image' && image) &&
                      (
                        image.file && image.file.url ? (
                          <img src={image.file.url.replace('.net/', imageRes)} className="featured-content-grid__media" />
                        ) : (
                          <img srcSet={ `${ProgrammePlaceholder}` } className="featured-content-grid__media featured-content-grid__placeholder" />
                        )
                      )
                    }

                    {(item.type === 'programme' && !!item.programme) &&
                      <NavLink to={`/${this.props.theme.variables.SystemPages.catalogue.path}/${getProgrammePath(item.programme, this.props.theme)}`}>
                        { item.programme && item.programme.thumbnail && item.programme.thumbnail.url ? (
                          <img src={item.programme.thumbnail.url.replace('.net/', imageRes)} className="featured-content-grid__media" />
                        ) : (
                          <img srcSet={ `${ProgrammePlaceholder}` } className="featured-content-grid__media featured-content-grid__placeholder" />
                        )}
                        {(item.programme.logo && this.props.theme.features.programmeOverview.logoTitle) ? (
                          <img src={item.programme.logo.url} className="featured-content-grid__logo" />
                        ) : (
                          <div className="featured-content-grid__content">
                            <h3 className="featured-content-grid__title">{item.programme.title}</h3>
                          </div>
                        )}
                      </NavLink>
                    }
                  </div>
                )
              })}
            </Carousel>
          )
        })}
      </div>
    )
  }
}

const FeaturedContentBlock = (
  block,
  assets,
  props,
) => {
  return (
    <EnhancedFeaturedContent
      block={block}
      assets={assets}
      {...props}
    />
  )
}

export default FeaturedContentBlock

const enhance = compose(
  withTheme
)

const EnhancedFeaturedContent = enhance(FeaturedContentGrid)