import React from 'react'
import ReactDOM from 'react-dom'

import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'

import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import allClientVariables from './variables'
import compose from 'javascript/utils/compose'

import 'stylesheets/core/components/gallery'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import Carousel from 'javascript/components/carousel'

class Gallery extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      current: 0,
      modal: () => { }
    }
  }

  next = () => {
    this.setState(({ current }) => ({
      current: ++current % this.props.items.length
    }))
  }

  prev = () => {
    this.setState(({ current }) => ({
      current: --current < 0 ? this.props.items.length - 1 : current
    }))
  }

  openModal = current => () => {
    this.setState({
      current,
      modal: () => {
        const item = this.props.items[this.state.current]
        return (
          <Modal ref="modal" customContent={true} closeEvent={this.unsetModal} modifiers={['image']}>
            <div className="gallery-modal">
              <Button className="modal__close" type="button" onClick={this.unsetModal} classesToPrefix={['modal']}>
                <Icon id="i-close" /> Close
              </Button>
              <img src={item.image.file ? item.image.file.opt.url : item.image} className="gallery-modal__image" />


              <div className="gallery-modal__content">

                <ClientProps
                  clientProps={{
                    'className': {
                      'cineflix | storylab | wildbrain': 'gallery-modal__caption',
                      'drg': 'gallery-modal__text'
                    }
                  }}
                  renderProp={(clientProps) => (
                    <div {...clientProps}>
                      {item.title &&
                        <ClientChoice>
                          <ClientSpecific client="default">
                            <p className="gallery-modal__caption">{item.title}</p>
                          </ClientSpecific>
                          <ClientSpecific client="cineflix | storylab | wildbrain">
                            <p className="gallery-modal__title">{item.title}</p>
                          </ClientSpecific>
                        </ClientChoice>
                      }
                      {item.description &&
                        <ClientChoice>
                          <ClientSpecific client="default">
                            <p className="gallery-modal__caption">{item.description}</p>
                          </ClientSpecific>
                          <ClientSpecific client="cineflix | drg | storylab | wildbrain">
                            <p className="gallery-modal__description">{item.description}</p>
                          </ClientSpecific>
                        </ClientChoice>
                      }
                    </div>
                  )}
                />

                <ClientProps
                  clientProps={{
                    'className': {
                      'discovery | cineflix': 'gallery-modal__nav',
                    }
                  }}
                  renderProp={(clientProps) => {
                    const arrowButtons = this.props.items.length === 0 ? null : (
                      <>
                        <div>
                          <button className="gallery-modal__arrow gallery-modal__arrow--prev" onClick={this.prev} />
                        </div>
                        <div>
                          <button className="gallery-modal__arrow gallery-modal__arrow--next" onClick={this.next} />
                        </div>
                      </>
                    )
                    if (Object.keys(clientProps).length) {
                      return (
                        <div {...clientProps}>
                          {arrowButtons}
                        </div>
                      )
                    } else {
                      return arrowButtons
                    }
                  }}
                />
              </div>
            </div>
          </Modal>
        )
      }
    })
  }

  unsetModal = () => {
    if (this.refs.modal) {
      ReactDOM.findDOMNode(this.refs.modal).classList.add('modal--is-hiding')
      setTimeout(() => {
        this.setState({
          modal: () => { }
        }, typeof callback === 'function' ? callback : () => { })
      }, 500)
    }
  }

  render() {
    const {galleryClientVariables, items, carousel} = this.props
    const renderItems = items.map((c, i) => (
      <div className="gallery__item" key={i} onClick={this.openModal(i)}>
        {c.image &&
          <img srcSet={`${c.image.file ? c.image.file.url.replace('.net/', `.net/${galleryClientVariables.thumbnailImageSizesWidth}x${galleryClientVariables.thumbnailImageSizesHeight}/`) : c.thumbnail}, ${c.image.file ? c.image.file.url.replace('.net/', `.net/${galleryClientVariables.thumbnailImageSizesWidth * 2}x${galleryClientVariables.thumbnailImageSizesHeight * 2}/`) : c.image} 2x`} alt={c.alt} />
        }
        {c.caption &&
          <span className="gallery__caption">{c.caption}</span>
        }
      </div>
    ))
    return (
      <div>
        <div className={`gallery ${!carousel && 'gallery--static'}`}>
          { carousel ? 
            <Carousel
              options={{
                scrollBar: true,
                ...galleryClientVariables.carouselDefaultOptions,
              }}
              responsive={[{
                  breakpoint: 1024,
                  options: {
                    ...galleryClientVariables.carouselMediumOptions
                  }
                }, {
                  breakpoint: 768,
                  options: {
                    slidesToShow: 2,
                    scrollBar: false,
                    dots: true
                  }
                }
              ]}>
              {renderItems}
            </Carousel>
          : renderItems}
        </div>
        {this.state.modal()}
      </div>
    )
  }
}

const enhance = compose(
  withClientVariables('galleryClientVariables', allClientVariables),
)

export default enhance(Gallery)