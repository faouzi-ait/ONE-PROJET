import React from 'react'
import Select from 'react-select'
import pluralize from 'pluralize'
// hoc
import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import useUsedImageIdState from '../use-used-image-id-state'
import withTheme from 'javascript/utils/theme/withTheme'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import bannerCarouselClientVariables from 'javascript/views/blocks/_banner-carousel/variables'
// Types
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import {
  ProgrammeType,
  VideoSearchResultType,
} from 'javascript/types/ModelTypes'
// Components
import AsyncSearchVideo from 'javascript/components/async-search-videos'
import AsyncSelect from 'javascript/components/async-select'
import Button from 'javascript/components/button'
import FileManager from 'javascript/components/admin/filemanager'
import FormControl from 'javascript/components/form-control'
import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'
import { ProgrammesAutosuggest } from 'javascript/utils/hooks/use-programmes-autosuggest'


interface State {
  programmes: ProgrammeType[],
  autoRotate: boolean,
  defaultRotationTime: number,
  minRotationTime: number,
  maxRotationTime: number
}

interface Slide {
  type: 'slide' | 'programme'
  logoIds: string[]
  imageIds: string[]
  imageNames: string[]
  logoNames: string[]
  title: string
  intro: string
  buttonUrl: string
  buttonCopy: string
  textColor: string
  programme: ProgrammeType
  video: VideoSearchResultType
  clickable: boolean
}

export interface BannerCarouselBlock {
  slides?: Slide[]
  background?: 'image'
  bgImage?: {
    name?: string
    id?: string
  }
  title?: string,
  items: number,
  rotationTime?: number
}

interface Props {
  theme: CustomThemeType
  bannerCarouselCV: any
  updateUsedImageIds: any
}

class BannerCarouselBlockForm extends NestedBlock<
  Props,
  State,
  BannerCarouselBlock
> {
  searchTimer: any

  constructor(props) {
    super(props)
    this.state = {
      programmes: [],
      block: {
        title: null,
        background: null,
        items: props.bannerCarouselCV.itemsOption && props.block?.items || 1,
        slides: props.block
          ? props.block.slides.map(obj => Object.assign({ type: 'slide' }, obj))
          : [],
        bgImage: props.block
          ? props.block.bgImage
          : {
              id: null,
              name: null,
            },
        type: 'banner-carousel',
        rotationTime: props.block?.rotationTime || null
      },
      fileManager: () => {},
      errors: [],
      resourceErrors: [],
      autoRotate: props.block?.rotationTime,
      defaultRotationTime: 3,
      minRotationTime: 1,
      maxRotationTime: 60
    }
    this.resourceName = 'slides'
    this.model = {
      title: '',
      intro: '',
      buttonUrl: '',
      buttonCopy: '',
      textColor: '',
      programme: '',
      video: '',
      type: 'slide',
      imageIds: [],
      logoIds: [],
    }
  }

  setValidation = () => ['slides']
  setResourceValidation = () => ['programme']

  isValid = () => {
    const resources = this.state.block.slides
    const errors = this.setValidation().filter(
      input => !this.state.block[input] || this.state.block[input].length <= 0,
    )
    const resourceValidation = this.setResourceValidation()
    const resourceErrors = resources.map(resource => {
      return [...resourceValidation].filter(input => {
        if (resource.type === 'slide') {
          if (input === 'programme') {
            return false
          }
        } else if (input === 'imageIds') {
          return false
        }
        return !resource[input] || resource[input].length <= 0
      })
    })
    this.setState({ errors, resourceErrors })
    return (
      errors.length <= 0 && resourceErrors.filter(resource => resource.length > 0).length <= 0
    )
  }

  updateResourceLogo = (selection, names, index) => {
    const { id: resourceId, type, updateUsedImageIds } = this.props
    const resources = this.state.block.slides
    resources[index].logoIds = selection
    resources[index].logoNames = names
    this.setState({
      block: {
        ...this.state.block,
        [pluralize(this.resourceName)]: resources,
      },
      fileManager: () => {},
    }, () => {
      updateUsedImageIds({
        type,
        resourceId,
        block: this.state.block
      })
    })
  }

  openLogoFileManager = index => {
    this.setState({
      fileManager: () => (
        <FileManager
          ref="filemanager"
          selectedImages={this.state.block.slides[index].logoIds}
          id={this.props.id}
          type={this.props.type}
          onConfirm={this.updateResourceLogo}
          closeEvent={this.unsetFileManager}
          index={index}
        />
      ),
    })
  }

  updateAutoRotate = e => {
    this.setState({
      autoRotate: e.target.checked,
      block: {
        ...this.state.block,
        rotationTime: e.target.checked ? this.state.defaultRotationTime : null,
      },
    })
  }

  render() {
    const { theme, bannerCarouselCV } = this.props
    const { slides, items, rotationTime } = this.state.block
    const buttonClasses = [
      'button',
      'filled',
      this.state.isLoading && 'loading',
    ].join(' button--')
    return (
      <form onSubmit={this.saveBlock} className="cms-form">
        {bannerCarouselCV.itemsOption &&
          <FormControl label="Items per slide">
            <Select
              options={[
                { value: 1, label: '1 item' },
                { value: 2, label: '2 items' },
                { value: 3, label: '3 items' },
              ]}
              onChange={value => {
                this.updateBlock({ target: { name: 'items', value: value } })
              }}
              value={items}
              clearable={false}
              simpleValue={true}
            />
          </FormControl>
        }
        <FormControl label="Auto rotate">
          <div className="cms-form__inline">
            <div className="checkbox">
              <input
                type="checkbox"
                checked={this.state.autoRotate}
                name="auto-rotate"
                className="checkbox__input"
                id="auto-rotate"
                onChange={this.updateAutoRotate}
              />
              <label htmlFor="auto-rotate" className="checkbox__label cms-form__label"></label>
            </div>
            {this.state.autoRotate &&
              <>
                <label className="cms-form__label cms-form__label--prefix">every</label>
                <input
                  className="cms-form__input cms-form__input--small"
                  value={rotationTime}
                  type="number"
                  min={this.state.minRotationTime}
                  max={this.state.maxRotationTime}
                  onChange={e => {
                    let value = parseInt(e.target.value)
                    if(value < this.state.minRotationTime){
                      value = this.state.minRotationTime
                    }
                    if(value > this.state.maxRotationTime){
                      value = this.state.maxRotationTime
                    }
                    this.updateBlock({ target: { name: 'rotationTime', value } })
                  }}
                />
                <label className="cms-form__label cms-form__label--suffix">seconds</label>
                {theme.features.videos.videoBanners &&
                  <p className="cms-form__info">Note: If a video is selected, auto rotate will not function</p>
                }
              </>
            }
          </div>
        </FormControl>
        <div>
          {slides.map((resource, i) => {
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
                <FormControl label="Slide Type" modifiers={['full']}>
                  <Select
                    options={[
                      { value: 'slide', label: 'Custom Slide' },
                      { value: 'programme', label: theme.localisation.programme.upper },
                    ]}
                    onChange={value => {
                      slides[i].type = value
                      this.setState(() => ({ resources: slides, dragged: -1 }))
                    }}
                    value={resource.type}
                    clearable={false}
                    simpleValue={true}
                  />
                </FormControl>
                {resource.type === 'programme' && (
                  <FormControl
                    label={`Select a ${theme.localisation.programme.lower}`}
                    error={
                      this.state.resourceErrors[i] &&
                      this.state.resourceErrors[i].includes('programme') &&
                      'Please complete this field'
                    }
                  >
                    <ProgrammesAutosuggest
                      buildParams={keywords => ({
                        fields: {
                          programmes:
                            'id,title-with-genre,title,slug,thumbnail,restricted',
                        },
                        filter: {
                          keywords: encodeURIComponent(keywords),
                        },
                      })}
                      onLoad={(options, callback) => callback({ options })}
                    >
                      {({ programmeSuggestions, searchProgrammes }) => (
                        <AsyncSelect
                          value={resource.programme}
                          onChange={value => {
                            slides[i].programme = value
                            this.setState(() => ({ resources: slides }))
                          }}
                          options={programmeSuggestions}
                          loadOptions={searchProgrammes}
                          placeholder="Type to search"
                          labelKey="title-with-genre"
                        />
                      )}
                    </ProgrammesAutosuggest>
                  </FormControl>
                )}
                <FormControl
                  error={
                    this.state.resourceErrors[i] &&
                    this.state.resourceErrors[i].includes('title') &&
                    'Please complete this field'
                  }
                  value={resource.title}
                  type="text"
                  label={`Title ${resource.type === 'programme' && `(supercedes ${theme.localisation.programme.lower} title)` || ''}`}
                  onFocus={e => {
                    this.disallowDrag(e, `${this.resourceName}-${i}`)
                  }}
                  onBlur={e => {
                    this.allowDrag(e, `${this.resourceName}-${i}`)
                  }}
                  onChange={({ target }) => {
                    slides[i].title = target.value
                    this.setState(() => ({ resources: slides, dragged: -1 }))
                  }}
                />
                <FormControl
                  error={
                    this.state.resourceErrors[i] &&
                    this.state.resourceErrors[i].includes('intro') &&
                    'Please complete this field'
                  }
                  value={resource.intro}
                  type="text"
                  label={`Intro ${resource.type === 'programme' && `(supercedes ${theme.localisation.programme.lower} introduction)` || ''}`}
                  onFocus={e => {
                    this.disallowDrag(e, `${this.resourceName}-${i}`)
                  }}
                  onBlur={e => {
                    this.allowDrag(e, `${this.resourceName}-${i}`)
                  }}
                  onChange={({ target }) => {
                    slides[i].intro = target.value
                    this.setState(() => ({ resources: slides, dragged: -1 }))
                  }}
                />
                <FormControl
                  error={
                    this.state.resourceErrors[i] &&
                    this.state.resourceErrors[i].includes('textColor') &&
                    'Please complete this field'
                  }
                  value={resource.textColor}
                  type="text"
                  label="Text Color"
                  onFocus={e => {
                    this.disallowDrag(e, `${this.resourceName}-${i}`)
                  }}
                  onBlur={e => {
                    this.allowDrag(e, `${this.resourceName}-${i}`)
                  }}
                  onChange={({ target }) => {
                    slides[i].textColor = target.value
                    this.setState(() => ({ resources: slides, dragged: -1 }))
                  }}
                />
                <h3 className="cms-form__heading">Link</h3>
                <FormControl
                  error={
                    this.state.resourceErrors[i] &&
                    this.state.resourceErrors[i].includes('buttonUrl') &&
                    'Please complete this field'
                  }
                  modifiers={['full']}
                  value={resource.buttonUrl}
                  type="text"
                  label={`Url ${resource.type === 'programme' && `(supercedes ${theme.localisation.programme.lower} url)` || ''}`}
                  onFocus={e => {
                    this.disallowDrag(e, `${this.resourceName}-${i}`)
                  }}
                  onBlur={e => {
                    this.allowDrag(e, `${this.resourceName}-${i}`)
                  }}
                  onChange={({ target }) => {
                    slides[i].buttonUrl = target.value
                    this.setState(() => ({ resources: slides, dragged: -1 }))
                  }}
                />
                <FormControl
                  type="checkbox"
                  checkboxLabeless={true}
                  id={`button-clickable-${i}`}
                  name="button-clickable"
                  label="Button is clickable"
                  checked={!resource.clickable}
                  className="checkbox__input"
                  onChange={(e) => {
                    slides[i].clickable = !e.target.checked
                    this.setState(() => ({ resources: slides }))
                  }}
                />
                <FormControl
                  type="checkbox"
                  checkboxLabeless={true}
                  id={`clickable-${i}`}
                  name="clickable"
                  label="Whole banner is clickable"
                  checked={resource.clickable}
                  className="checkbox__input"
                  onChange={(e) => {
                    slides[i].clickable = e.target.checked
                    this.setState(() => ({ resources: slides }))
                  }}
                />  
                {!resource.clickable &&
                  <FormControl
                    error={
                      this.state.resourceErrors[i] &&
                      this.state.resourceErrors[i].includes('buttonCopy') &&
                      'Please complete this field'
                    }
                    value={resource.buttonCopy}
                    type="text"
                    label="Button Copy"
                    onFocus={e => {
                      this.disallowDrag(e, `${this.resourceName}-${i}`)
                    }}
                    onBlur={e => {
                      this.allowDrag(e, `${this.resourceName}-${i}`)
                    }}
                    onChange={({ target }) => {
                      slides[i].buttonCopy = target.value
                      this.setState(() => ({ resources: slides, dragged: -1 }))
                    }}
                  />
                }
                
                <h3 className="cms-form__heading">Media</h3>
                <div className="cms-form__control">
                  <label className="cms-form__label">{`Image ${resource.type === 'programme' && `(supercedes ${theme.localisation.programme.lower} image)` || ''}`}</label>
                  <p className="cms-form__images">{resource.imageNames}</p>
                  <Button
                    type="button"
                    className="button button--smallest button--filled"
                    onClick={() => {
                      this.openFileManager(i)
                    }}>
                    Choose Image
                  </Button>
                  {resource.imageNames &&
                    <Button
                      type="button"
                      className="button button--smallest button--filled"
                      style={{'marginLeft': '10px'}}
                      onClick={() => {
                        slides[i].imageNames = null
                        this.setState(() => ({ resources: slides, dragged: -1 }))
                      }}>
                      Remove Image
                    </Button>
                  }
                </div>

                {resource.type === 'slide' && bannerCarouselCV.showLogo &&
                  <div className="cms-form__control">
                    <label className="cms-form__label">Logo</label>
                    <p className="cms-form__images">{resource.logoIds}</p>
                    <Button
                      type="button"
                      className="button button--smallest button--filled"
                      onClick={() => {
                        this.openLogoFileManager(i)
                      }}
                    >
                      Choose Image
                    </Button>
                    {this.state.resourceErrors[i] &&
                      this.state.resourceErrors[i].includes('logoIds') && (
                        <p className="cms-form__error">
                          Please complete this field
                        </p>
                      )}
                  </div>
                }
                {theme.features.videos.videoBanners && (items === 1) && (
                  <FormControl
                    modifiers={['full']}
                    label={`Select a ${theme.localisation.video.lower}`}
                    error={(
                      this.state.resourceErrors[i] &&
                      this.state.resourceErrors[i].includes('video') &&
                      'Please complete this field'
                    )}
                  >
                    <AsyncSearchVideo
                      value={resource.video}
                      onChange={value => {
                        slides[i].video = value
                        this.setState(() => ({ resources: slides }))
                      }}
                      videoFilters={{
                        filter: {
                          providers: ['mp4', 'brightcove']
                        }
                      }}
                    />
                  </FormControl>
                )}
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
        {this.state.fileManager()}
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={buttonClasses}>
            Save Content Block
          </Button>
        </div>
      </form>
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('bannerCarouselCV', bannerCarouselClientVariables),
  withHooks((props) => {
    const usedImageIdState = useUsedImageIdState()
    return {
      updateUsedImageIds: usedImageIdState.updateUsedImageIds,
    }
  })
)

export default enhance(BannerCarouselBlockForm)