import React from 'react'

import 'stylesheets/core/components/carousel'

import Icon from 'javascript/components/icon'
import Loader from 'javascript/components/loader'

import withTheme from 'javascript/utils/theme/withTheme'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import allClientVariables from './variables'

/**
 * Sometimes, the carousel needs to be able to pass down props to its children so they can change
 * their behaviour - this context allows this
 *
 * Try:
 *
 * const values = useContext(CarouselContext)
 *
 * Bear in mind that the element MUST be the child
 * of a carousel, or you'll get the default values below
 */
export const CarouselContext = React.createContext({
  isThisSlideActive: false,
  isThisSlideOnTheFarLeft: false,
  isThisSlideOnTheFarRight: false,
})

class Carousel extends React.Component {
  constructor(props) {
    super(props)
    this.timer = false
    this.timerOnChange = false
    this.defaultOptions = {
      groups: false,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      dots: false,
      scrollBar: false,
      fullWidth: false,
    }
    this.state = {
      active: 0,
      revision: props.revision || 0,
      responsive: props.responsive || [],
      options: this.defaultOptions,
      classes: props.classes || [],
      isMainDragging: false,
      isThumbsDragging: false,
      auto: props.auto || false
    }

    // Swipe Methods
    let startPos = false
    let startTime = false
    const defaultTime = 200
    const defaultDistance = 50
    const maxDistance = 200

    this.swipeStart = event => {
      startPos = event.changedTouches
        ? event.changedTouches[0].pageX
        : event.pageX
      startTime = Date.now()
    }

    this.swipeMove = (event) => {
      if (startTime && this.total() > 0) {
        const timePassed = Date.now() - startTime
        const multiplier = timePassed / defaultTime
        const distance = Math.min(defaultDistance * multiplier, maxDistance)
        const x = event.changedTouches
          ? event.changedTouches[0].pageX
          : event.pageX

        if (x > startPos + distance) {
          this.prev()
          startTime = false
        }
        if (x < startPos - distance) {
          this.next()
          startTime = false
        }
        clearInterval(this.interval)
        this.autoRotate()
      }
    }

    this.bindedHandleMouseMove = this.handleMouseMove.bind(this)
    this.bindedHandleMouseUp = this.handleMouseUp.bind(this)
  }

  prev = () => {
    this.setState(({ active }) => ({
      active: Math.max(active - this.state.options.slidesToScroll, 0),
    }))
  }

  next = () => {
    if(this.state.active === this.total()){
      this.navTo(-1)
    }
    this.setState(({ active }) => ({
      active: Math.min(
        active + this.state.options.slidesToScroll,
        this.total(),
      ),
    }))
  }

  componentWillMount() {
    window.addEventListener('resize', this.throttle)
    window.addEventListener('mousemove', this.bindedHandleMouseMove)
    window.addEventListener('mouseup', this.bindedHandleMouseUp)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttle)
    window.removeEventListener('mousemove', this.bindedHandleMouseMove)
    window.removeEventListener('mouseup', this.bindedHandleMouseUp)
    clearInterval(this.interval)
  }

  componentDidMount() {
    this.resize()
    this.autoRotate()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.active !== this.state.active) {
      this.handleOnChange(this.state.active)
    }
    if (prevProps.carouselActivePosition !== this.props.carouselActivePosition && this.props.carouselActivePosition !== this.state.active) {
      // carouselActivePosition has changed from external action. (e.g. autoCue videos) need to keep carousel scroll in sync
      this.setState({
        active: Math.min(Math.max(this.props.carouselActivePosition - 2, 0), this.total())
      })
    }
  }

  autoRotate = () => {
    if(this.state.auto){
      this.interval = setInterval(() => {
        this.next()
      }, this.state.auto * 1000)
    }
  }

  handleOnChange = (active) => {
    clearTimeout(this.timerOnChange)
    this.timerOnChange = setTimeout(() => this.props.onChange(active), 200)
  }

  throttle = () => {
    clearTimeout(this.timer)
    this.timer = setTimeout(this.resize, 100)
  }

  resize = () => {
    const { children } = this.props
    this.setState(({ active }) => {
      const newOptions = this.state.responsive.reduce(
        (object, { breakpoint, options }) =>
          Object.assign({}, object, window.innerWidth < breakpoint && options),
        Object.assign({}, this.defaultOptions, this.props.options),
      )
      active = Math.min(
        Math.max(children.length - newOptions.slidesToShow, 0),
        active,
      )
      return { options: newOptions, active }
    })
  }

  componentWillReceiveProps = ({ revision }) =>
    revision > this.state.revision &&
    this.setState(() => ({
      active: 0,
      revision,
    }))

  total = () => this.props.children.length - this.state.options.slidesToShow

  navTo = id => {
    this.setState(() => ({
      active: id,
    }))
  }

  handleMouseDown(e, type = 'isMainDragging') {
    e.preventDefault();
    e.stopPropagation();
    this.setState({[type]: true })
  }

  handleMouseUp(e){
    if(this.state.isMainDragging || this.state.isThumbsDragging){
      let update = {}
      if (this.state.isMainDragging){
        update['isMainDragging'] = false
      }
      if (this.state.isThumbsDragging){
        update['isThumbsDragging'] = false
      }
      e.preventDefault();
      this.setState(update)
    }
  }

  handleMouseMove(e){
    if(this.state.isMainDragging || this.state.isThumbsDragging){
      e.preventDefault();
      const target = this.state.isMainDragging ? this.refs.handle : this.refs.thumbsHandle
      const threshold = target.parentNode.offsetWidth / (this.total() + 1)
      const diff = e.clientX - target.parentNode.offsetLeft
      this.setState(() => ({
        active: Math.max(
          Math.min(Math.floor(diff / threshold), this.total()),
          0,
        ),
      }))
    }
  }

  renderThumbnails = () => {
    const { classes, active } = this.state
    const { children } = this.props
    const thumbsToShow = 6
    const total = Math.floor(children.length / thumbsToShow)
    const remainder = (children.length % thumbsToShow) > 0 ? 1 : 0
    const room = Math.max(total + remainder, 1)
    const thumbActive = Math.floor(this.state.active / thumbsToShow)
    return (
      <div className={['carousel', ...classes].join(' carousel--')}>
        <div class="carousel__thumbs">
          <div
            className="carousel__list"
            onTouchStart={this.swipeStart}
            onTouchMove={this.swipeMove}
          >
            <div
              className="carousel__track"
              style={{
                width: `${100 / thumbsToShow}%`,
                transform: `translate3d(${-(thumbActive * thumbsToShow * 100)}%, 0, 0)`,
              }}
            >
              {children.map((item, key) => {
                return (
                  <div
                    className={'carousel__item carousel__item--active'}
                    key={key}
                    onClick={() => {
                      this.navTo(key)
                      clearInterval(this.interval)
                      this.autoRotate()
                    }}
                  >
                    {item}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="carousel__scroll-track">
            <div
              ref="thumbsHandle"
              className="carousel__scroll-handle"
              onMouseDown={(e) => this.handleMouseDown(e, 'isThumbsDragging')}
              style={{
                width: `${(100 / room).toFixed(4)}%`,
                transform: `translateX(${thumbActive * 100}%)`,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { active, options, classes } = this.state
    const { children, allowOverflow, clientVariables } = this.props
    const prevDisabled = active <= 0
    const nextDisabled = active + options.slidesToShow >= children.length
    const canScroll = children.length > options.slidesToShow
    const room = Math.max(this.total() + 1, 1)

    let scrollHanldlePosition = 0
    if (canScroll && options.scrollBar && this.refs.handle?.parentNode) {
      const percentagePosition = active / room
      const scrollbarLength = this.refs.handle.parentNode.offsetWidth
      if (scrollbarLength) {
        scrollHanldlePosition = scrollbarLength * percentagePosition
      }
    }

    let count = -1
    return (
      <div>
        <div className={['carousel', ...classes, options.groups && 'with-groups'].join(' carousel--')} style={{ overflow: allowOverflow ? 'visible' : undefined }}>
          <div className={!options.fullWidth ? 'container' : ''}>
            <div
              className="carousel__list"
              onTouchStart={this.swipeStart}
              onTouchMove={this.swipeMove}
            >
              {options.groups && (
                <div
                  className="carousel__track"
                  style={{
                    width: `${100 / options.slidesToShow}%`,
                    transform: `translate3d(${-(active * 100)}%, 0, 0)`,
                  }}
                >
                  {[...new Set(children.map(item => item.props.group))].map((group, index) => {
                    const width = children.filter(
                      ({ props }) => props.group === group,
                    ).length
                    return (
                      <div
                        key={`carousel__group-${index}`}
                        className="carousel__group"
                        style={{
                          width: `calc(${width * 100}% - ${clientVariables.groupSpacing})`,
                        }}
                      >
                        {group}
                      </div>
                    )
                  })}
                </div>
              )}
              <div
                className="carousel__track"
                style={{
                  width: `${100 / options.slidesToShow}%`,
                  transform: `translate3d(${-(active * 100)}%, 0, 0)`,
                }}
              >
                {[...new Set(children.map(item => item.props.group))].map((group, index) => {
                  return children
                    .filter(({ props }) => {
                      return props.group === group
                    })
                    .map((child, key) => {
                      count++
                      const isActive = active - 1 < count == count < active + options.slidesToShow
                      return (
                        <CarouselContext.Provider
                          value={{
                            isThisSlideActive: isActive,
                            isThisSlideOnTheFarLeft: count === active,
                            isThisSlideOnTheFarRight: count === active + options.slidesToShow - 1,
                          }}
                        >
                          <div
                            className={[
                              'carousel__item',
                              isActive && 'active',
                              options.autoHeight && 'flex-height',
                            ].join(' carousel__item--')}
                            key={`carousel__item-${index}`}
                          >
                            {child}
                          </div>
                        </CarouselContext.Provider>
                      )
                    })
                })}
              </div>
            </div>

            {canScroll && options.dots && (
              <ul className="carousel__dots">
                {[...Array(this.total() + 1)].map((item, key) => (
                  <li
                    className={[
                      'carousel__dot',
                      key === active && 'active',
                    ].join(' carousel__dot--')}
                    key={key}
                    onClick={() => {
                      this.setState(() => ({ active: key }))
                      clearInterval(this.interval)
                      this.autoRotate()
                    }}
                  >
                    {key}
                  </li>
                ))}
              </ul>
            )}

            {canScroll && options.scrollBar && (
              <div className="carousel__scroll-track">
                <div
                  ref="handle"
                  className="carousel__scroll-handle"
                  onMouseDown={this.handleMouseDown.bind(this)}
                  style={{
                    width: `${(100 / room).toFixed(4)}%`,
                    transform: `translateX(${scrollHanldlePosition}px)`,
                  }}
                />
              </div>
            )}

            {canScroll && options.pager && (
              <div className="carousel__pager">
                <p className="carousel__counter">
                  <span className="carousel__counter-from">
                    {options.slidesToShow > 1
                      ? `${active + 1}-${active + options.slidesToShow}`
                    : active + options.slidesToShow}
                  </span>
                  / <span className="carousel__counter-o">{children.length}</span>
                </p>
                <button
                  onClick={() => {
                    this.prev()
                    clearInterval(this.interval)
                    this.autoRotate()
                  }}
                  disabled={prevDisabled}
                  className="carousel__arrow carousel__arrow--small carousel__arrow--prev"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    this.next()
                    clearInterval(this.interval)
                    this.autoRotate()
                  }}
                  disabled={nextDisabled}
                  className="carousel__arrow carousel__arrow--small carousel__arrow--next"
                >
                  Next
                </button>
                {options.pagerText && !nextDisabled &&
                  <p className="carousel__pager-text">Next: {children[active + 1].props.title}</p>
                }
              </div>
            )}
          </div>

          {canScroll && options.arrows && (
            <button
            onClick={() => {
              this.prev()
              clearInterval(this.interval)
              this.autoRotate()
            }}
              disabled={prevDisabled}
              className="carousel__arrow carousel__arrow--prev"
            >
              <ClientSpecific client="all3 | fremantle">
                <Icon id="i-left-long-arrow" classes="carousel__arrow-icon" />
              </ClientSpecific>
              Previous
            </button>
          )}
          {canScroll && options.arrows && (
            <button
            onClick={() => {
              this.next()
              clearInterval(this.interval)
              this.autoRotate()
            }}
              disabled={nextDisabled}
              className="carousel__arrow carousel__arrow--next"
            >
              <ClientSpecific client="all3 | fremantle">
                <Icon id="i-right-long-arrow" classes="carousel__arrow-icon" />
              </ClientSpecific>
              Next
            </button>
          )}
        </div>
        {options.thumbnails && this.renderThumbnails()}
      </div>
    )
  }
}

Carousel.defaultProps = {
  onChange: () => {},
}

const enhance = compose(
  withTheme,
  withClientVariables('clientVariables', allClientVariables)
)

export default enhance(Carousel)


export const BlankCarouselItem = ({ loading = false, group }) => {
  return (
    <div className="carousel__blank-item">
      {loading && (
        <>
          <Loader small={true} />
          <span>Loading...</span>
        </>
      )}
    </div>
  )
}

