import React from 'react'
import ReactDOM from 'react-dom'
import pluralize from 'pluralize'
import Select from 'react-select'
import styled from 'styled-components'

// Types
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import {
  ProgrammeType,
  VideoSearchResultType,
} from 'javascript/types/ModelTypes'
// Components
import Button from 'javascript/components/button'
import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'
import FormControl from 'javascript/components/form-control'
import FileManager from 'javascript/components/admin/filemanager'
import AsyncSearchVideo from 'javascript/components/async-search-videos'
import AsyncSearchProgrammes from 'javascript/components/async-search-programmes'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import promoCarouselClientVariables from 'javascript/views/blocks/_promo-carousel/variables'
// Hoc
import withTheme from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import withPrefix, { WithPrefixType } from 'javascript/components/hoc/with-prefix'

interface Props {
  block?: PromoCarouselBlock
  theme: CustomThemeType
  promoCarouselCV: any
  prefix: WithPrefixType
}

interface State {
  programmes: ProgrammeType[]
}

export interface PromoCarouselBlock {
  title: string
  background: string
  arrows: boolean
  dots: boolean
  scrollBar: boolean
  pager: boolean
  tabs: Tab[]
  bgImage: {
    id: string
    name: string
  }
  images: {}
  numberOfItems: number
}

interface Tab {
  title: string
  buttonText?: string
  buttonLink?: string
  programmes: (ProgrammeType & { video: VideoSearchResultType })[]
  type: 'video-carousel' | 'programme-carousel'
  /**
   * @TODO - this doesn't appear to be present on this form, but is required
   * in _promo-carousel.tsx, in all3 only. Something fishy is happening here.
   */
  actionLink?: string
}

class PromoCarouselBlockForm extends NestedBlock<
  Props,
  State,
  PromoCarouselBlock,
  Tab
> {
  searchTimer: any
  constructor(props: Props) {
    super(props)
    this.state = {
      programmes: [],
      block: {
        title: props.block ? props.block.title : null,
        background: props.block ? props.block.background : 'light',
        arrows: props.block ? props.block.arrows : false,
        dots: props.block ? props.block.dots : false,
        scrollBar: props.block ? props.block.scrollBar : false,
        pager: props.block ? props.block.pager : false,
        numberOfItems: props.block ? props.block.numberOfItems : 3,
        tabs: props.block
          ? props.block.tabs.map(obj => Object.assign({}, obj))
          : [],
        type: 'promo-carousel',
        bgImage: props.block
          ? props.block.bgImage
          : {
              id: null,
              name: null,
            },
        images: props.block ? props.block.images : [{ imageIds: [] }],
      },
      fileManager: () => {},
      errors: [],
      resourceErrors: [],
    }
    this.resourceName = 'tab'
    this.model = {
      title: '',
      programmes: [],
      type: 'programme-carousel',
    }
  }

  setValidation = () => ['tabs']
  setResourceValidation = () => ['title', 'programmes']

  updateCheck = e => {
    this.setState({
      block: {
        ...this.state.block,
        [e.target.name]: !this.state.block[e.target.name],
      },
    })
  }

  openFileManager = () => {
    this.setState({
      fileManager: () => (
        <FileManager
          ref="filemanager"
          bgImage={[this.state.block.bgImage]}
          id={this.props.id}
          type={this.props.type}
          onConfirm={this.updatebgImage}
          closeEvent={this.unsetFileManager}
          forceAddImages={true}
        />
      ),
    })
  }

  unsetFileManager = () => {
    ReactDOM.findDOMNode(this.refs.filemanager).classList.add(
      'modal--is-hiding',
    )
    setTimeout(() => {
      this.setState({
        fileManager: () => {},
      })
    }, 500)
  }

  render() {
    const { prefix, theme, promoCarouselCV } = this.props
    const tabs = this.state.block.tabs
    const buttonClasses = [
      'button',
      'filled',
      this.state.isLoading && 'loading',
    ].join(' button--')
    const backgroundOptions = [
      { value: 'light', label: 'Plain' },
      { value: 'shade', label: 'Shaded' },
      { value: 'brand', label: 'Branded' },
      { value: 'image', label: 'Image' },
    ]
    if(theme.variables.KidsVersion){
      backgroundOptions.push({ value: 'kids', label: 'Kids' },)
    }
    return (
      <form onSubmit={this.saveBlock} className="cms-form">
        <FormControl
          type="text"
          label="Title"
          name="title"
          draggable={true}
          value={this.state.block.title}
          onChange={this.updateBlock}
        />
        <FormControl label="Background">
          <Select
            options={backgroundOptions}
            onChange={value => {
              this.updateBlock({ target: { name: 'background', value: value } })
            }}
            value={this.state.block.background}
            clearable={false}
            simpleValue={true}
          />
        </FormControl>
        {this.state.block.background === 'image' && (
          <FormControl label="Background Image" modifiers={['tall']}>
            <div className="cms-form__image-selection">
              <p>{this.state.block.bgImage.name}</p>
              <Button
                type="button"
                className="button button--filled"
                onClick={() => this.openFileManager()}
              >
                Choose Image
              </Button>
            </div>
            {this.state.fileManager()}
          </FormControl>
        )}
        {promoCarouselCV.sizeOption && (
          <FormControl
            error={
              this.state.errors.includes('numberOfItems') &&
              'Please complete this field'
            }
            label="Items per slide"
          >
            <Select
              options={[
                { value: 1, label: '1 item' },
                { value: 2, label: '2 items' },
                { value: 3, label: '3 items' },
                { value: 4, label: '4 items' }
              ]}
              onChange={value => {
                this.updateBlock({
                  target: { name: 'numberOfItems', value: value },
                })
              }}
              value={this.state.block.numberOfItems}
              clearable={false}
              simpleValue={true}
            />
          </FormControl>
        )}
        <FormControl>
          <div className="checkbox">
            <input
              type="checkbox"
              checked={this.state.block.arrows}
              name="arrows"
              className="checkbox__input"
              id="arrows"
              onChange={this.updateCheck}
            />
            <label htmlFor="arrows" className="checkbox__label cms-form__label">
              Show Arrows
            </label>
          </div>
        </FormControl>
        <FormControl>
          <div className="checkbox">
            <input
              type="checkbox"
              checked={this.state.block.dots}
              name="dots"
              className="checkbox__input"
              id="dots"
              onChange={this.updateCheck}
            />
            <label htmlFor="dots" className="checkbox__label cms-form__label">
              Show Dots
            </label>
          </div>
        </FormControl>
        <FormControl>
          <div className="checkbox">
            <input
              type="checkbox"
              checked={this.state.block.scrollBar}
              name="scrollBar"
              className="checkbox__input"
              id="scrollBar"
              onChange={this.updateCheck}
            />
            <label htmlFor="scrollBar" className="checkbox__label cms-form__label">
              Show Scroll Bar
            </label>
          </div>
        </FormControl>
        <FormControl>
          <div className="checkbox">
            <input
              type="checkbox"
              checked={this.state.block.pager}
              name="pager"
              className="checkbox__input"
              id="pager"
              onChange={this.updateCheck}
            />
            <label htmlFor="pager" className="checkbox__label cms-form__label">
              Show Pager
            </label>
          </div>
        </FormControl>

        <div>
          {tabs.map((tab, i) => {
            const classes =
              i === this.state.dragged
                ? 'cms-form__group cms-form__group--hidden'
                : 'cms-form__group'
            return (
              <div
                className={classes}
                key={i}
                draggable
                onDragStart={e => {
                  this.dragStart(e, i)
                }}
                onDragEnd={e => {
                  this.dragEnd(e, i)
                }}
                onDragOver={e => {
                  this.dragOver(e, i)
                }}
                onDrop={e => {
                  this.drop(e, i)
                }}
                ref={`${this.resourceName}-${i}`}
              >
                <div className="cms-form__group-actions">
                  <Button
                    type="button"
                    className="button button--smallest button--filled"
                    style={{ cursor: 'move' }}
                  >
                    Move
                  </Button>
                  <Button
                    type="button"
                    className="button button--smallest button--error"
                    onClick={() => {
                      this.removeResource(i)
                    }}
                  >
                    Remove
                  </Button>
                </div>
                <FormControl
                  error={
                    this.state.resourceErrors[i] &&
                    this.state.resourceErrors[i].includes('title') &&
                    'Please complete this field'
                  }
                  value={tab.title}
                  type="text"
                  label="Title"
                  modifiers={['full']}
                  onChange={({ target }) => {
                    tabs[i].title = target.value
                    this.setState(() => ({ resources: tabs }))
                  }}
                  onFocus={e => {
                    this.disallowDrag(e, `${this.resourceName}-${i}`)
                  }}
                  onBlur={e => {
                    this.allowDrag(e, `${this.resourceName}-${i}`)
                  }}
                />
                {theme.features.videos.promoCarousel && (
                  <FormControl label="Type">
                    <Select
                      options={
                        [
                          {
                            value: 'programme-carousel',
                            label: `${pluralize.singular(
                              theme.localisation.programme.upper,
                            )} Carousel`,
                          },
                          {
                            value: `video-carousel`,
                            label: `${pluralize.singular(
                              theme.localisation.video.upper,
                            )} Carousel`,
                          },
                        ] as { value: Tab['type']; label: string }[]
                      }
                      onChange={value => {
                        tabs[i].type = value
                        this.setState(() => ({ resources: tabs }))
                      }}
                      value={tab.type || 'programme-carousel'}
                      clearable={false}
                      simpleValue={true}
                    />
                  </FormControl>
                )}
                <FormControl
                  value={tab.buttonText}
                  type="text"
                  label="Button Text"
                  onChange={({ target }) => {
                    tabs[i].buttonText = target.value
                    this.setState(() => ({ resources: tabs }))
                  }}
                  onFocus={e => {
                    this.disallowDrag(e, `${this.resourceName}-${i}`)
                  }}
                  onBlur={e => {
                    this.allowDrag(e, `${this.resourceName}-${i}`)
                  }}
                />
                <FormControl
                  value={tab.buttonLink}
                  type="text"
                  label="Button Link"
                  onChange={({ target }) => {
                    tabs[i].buttonLink = target.value
                    this.setState(() => ({ resources: tabs }))
                  }}
                  onFocus={e => {
                    this.disallowDrag(e, `${this.resourceName}-${i}`)
                  }}
                  onBlur={e => {
                    this.allowDrag(e, `${this.resourceName}-${i}`)
                  }}
                />
                <FormControl
                  label={`Add a ${theme.localisation.programme.lower}`}
                  modifiers={['full']}
                  error={
                    this.state.resourceErrors[i] &&
                    this.state.resourceErrors[i].includes('programmes') &&
                    'Please complete this field'
                  }
                >
                  <AsyncSearchProgrammes
                    onChange={value => {
                      const programmeExists = tab.programmes.filter(
                        ({ id }) => id === value.id,
                      )
                      if (programmeExists.length < 1) {
                        const programmes = tabs[i].programmes.slice(0)
                        programmes.push({ ...value, video: undefined })
                        tabs[i].programmes = programmes
                        this.setState(() => ({ resources: tabs }))
                      }
                    }}
                    value={null}
                    buildParams={keywords => ({
                      fields: {
                        programmes:
                          'id,title-with-genre,title,slug,thumbnail,restricted',
                      },
                      filter: {
                        keywords: encodeURIComponent(keywords),
                      },
                    })}
                  />
                </FormControl>
                <FormControl
                  label={`Selected ${pluralize(theme.localisation.programme.upper)}`}
                  modifiers={['full']}
                >
                  {tab.programmes.length < 1 ? (
                    <p>No {pluralize(theme.localisation.programme.lower)} selected</p>
                  ) : (
                    <div>
                      <table className={`${prefix}table ${prefix}table--small`}>
                        <tbody>
                          {tab.programmes.map((programme, programmeIndex) => {
                            return (
                              <tr>
                                <td>
                                  <div>
                                    {tab.type === 'video-carousel' && (
                                      <>
                                        <ProgrammeTitle>
                                          {programme.title}
                                        </ProgrammeTitle>
                                        <ProgrammeDivider />
                                        <FormControl
                                          modifiers={['full']}
                                          label={`Select a ${pluralize.singular(
                                            theme.localisation.video.upper,
                                          )}`}
                                          error={ this.state.hasClickedSubmit && !programme.video && 'You must select a video.' }
                                        >
                                          <AsyncSearchVideo
                                            value={programme.video}
                                            onChange={value => {
                                              tabs[i].programmes[
                                                programmeIndex
                                              ].video = value
                                              this.setState(() => ({
                                                resources: tabs,
                                              }))
                                            }}
                                            videoFilters={{
                                              filter: {
                                                providers: ['mp4', 'brightcove']
                                              }
                                            }}
                                          />
                                        </FormControl>
                                      </>
                                    )}
                                    {(tab.type === 'programme-carousel' ||
                                      !tab.type) && (
                                      <span>{programme.title}</span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <Button
                                    type="button"
                                    className="button button--smallest button--error"
                                    onClick={() => {
                                      tabs[i].programmes = tabs[
                                        i
                                      ].programmes.filter(
                                        ({ id }) => id !== programme.id,
                                      )
                                      this.setState({ resources: tabs })
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </FormControl>
              </div>
            )
          })}
        </div>
        <div className="cms-form__actions">
          <Button
            className="button button--small"
            onClick={this.addResource}
            type="button"
          >
            Add {this.resourceName}
          </Button>
        </div>
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={buttonClasses}>
            Save Content Block
          </Button>
        </div>
      </form>
    )
  }
}

const ProgrammeTitle = styled.span`
  margin-bottom: 5px;
  display: inline-block;
  font-weight: bold;
`

const ProgrammeDivider = styled.hr`
  margin-top: 5px;
  margin-bottom: 10px;
  opacity: 0.5;
`

const enhance = compose(
  withTheme,
  withPrefix,
  withClientVariables('promoCarouselCV', promoCarouselClientVariables)
)

export default enhance(PromoCarouselBlockForm)
