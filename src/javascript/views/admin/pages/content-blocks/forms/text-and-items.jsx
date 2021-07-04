import React from 'react'
import ReactDOM from 'react-dom'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import useUsedImageIdState from '../use-used-image-id-state'

// Stores
import CollectionStore from 'javascript/stores/collections'
import PagesStore from 'javascript/stores/pages'

// Actions
import CollectionActions from 'javascript/actions/collections'
import PagesActions from 'javascript/actions/pages'

// Components
import Button from 'javascript/components/button'
import Editor from 'javascript/components/wysiwyg'
import FileManager from 'javascript/components/admin/filemanager'
import FormControl from 'javascript/components/form-control'
import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'
import Select from 'react-select'
import { ProgrammesAutosuggest } from 'javascript/utils/hooks/use-programmes-autosuggest'
import AsyncSelect from 'javascript/components/async-select'


const DefaultProgrammesAutosuggest = ({ children }) => (
  <ProgrammesAutosuggest
    buildParams={keywords => ({
      filter: {
        keywords: encodeURIComponent(keywords),
      },
    })}
    onLoad={(options, callback) => callback({ options })}
  >
    {children}
  </ProgrammesAutosuggest>
)

class TextItemsBlockForm extends NestedBlock {
  constructor(props) {
    super(props)
    this.state = {
      block: Object.assign(
        {},
        {
          media: 'image',
          mediaPos: 'left',
          images: [
            {
              alt: '',
              imageIds: [],
            },
          ],
          selectedImages: [],
          provider: '',
          vidId: '',
          programmeId: '',
          background: 'light',
          content: '',
          type: 'text-and-items',
          itemsType: 'related-pages',

          order: props.block ? props.block.order : 'manual',
          relatedPagesBackground: props.block
            ? props.block.background
            : 'light',
          relatedPagesPageType: props.block
            ? props.block.relatedPagesPageType
            : 'pages',
          relatedPagesNumberOfItems: props.block
            ? props.block.numberOfItems
            : 4,
          pages: props.block
            ? props.block.pages.map(obj => Object.assign({}, obj))
            : [],
          relatedPagesLatest: props.block ? props.block.latest : false,
          relatedPagesCollection: props.block ? props.block.collection : '',
          relatedPagesType: 'related-pages',

          promoCarouselBackground: props.block
            ? props.block.background
            : 'light',
          promoCarouselArrows: props.block ? props.block.arrows : false,
          promoCarouselDots: props.block ? props.block.dots : false,
          promoCarouselScrollBar: props.block ? props.block.scrollBar : false,
          promoCarouselPager: props.block ? props.block.pager : false,
          tabs: props.block
            ? props.block.tabs
              ? props.block.tabs.map(obj => Object.assign({}, obj))
              : []
            : [],
          promoCarouselType: 'promo-carousel',
        },
        props.block || {},
      ),
      errors: [],
      resourceErrors: [],
      fileManager: () => {},
      programmes: [],
      pages: [],
      collections: [],
    }
    this.resourceName = 'page'
    this.carouselResourceName = 'tab'
    this.model = {
      resource: null,
      label: '',
      title: '',
      description: '',
      url: '',
      imageIds: [],
      imageNames: [],
    }
    this.carouselModel = {
      title: '',
      programmes: [],
    }
  }

  setValidation = () =>
    [
      'relatedPagesPageType',
      'content',
      this.state.block.itemsType !== 'promo-carousel' &&
        this.state.block.relatedPagesPageType !== 'collections' &&
        this.state.block.relatedPagesPageType !== 'cards' &&
        'pages',
      this.state.block.relatedPagesPageType === 'collections' &&
        'relatedPagesCollection',
    ].filter(v => v)
  setResourceValidation = () => {
    if (this.state.block.relatedPagesPageType === 'cards') {
      return ['title']
    } else {
      return ['resource']
    }
  }

  componentDidMount() {
    CollectionActions.getResources({
      fields: {
        collections: 'title',
      },
      page: { size: 200 },
    })

    if (!this.props.pages) {
      PagesActions.getResources({
        fields: {
          pages: 'title,introduction,thumbnail',
        },
        page: { size: 200 },
      })
    } else {
      this.setState({
        pages: this.props.pages,
      })
    }
  }

  componentWillMount() {
    CollectionStore.unsetResources()
    CollectionStore.on('change', this.setResources)
    PagesStore.on('change', this.setPages)
  }

  componentWillUnmount() {
    CollectionStore.removeListener('change', this.setResources)
    PagesStore.removeListener('change', this.setPages)
  }

  setResources = () => {
    this.setState({
      collections: CollectionStore.getResources(),
    })
  }

  setPages = () => {
    this.setState({
      pages: PagesStore.getResources(),
    })
  }

  addCarouselResource = () => {
    this.setState(({ block }) => ({
      block: {
        ...block,
        [pluralize(this.carouselResourceName)]: [
          ...block[pluralize(this.carouselResourceName)],
          {
            ...this.carouselModel,
          },
        ],
      },
    }))
  }

  removeCarouselResource = index => {
    const resources = this.state.block[pluralize(this.carouselResourceName)]
    resources.splice(index, 1)
    this.setState({
      block: {
        ...this.state.block,
        [pluralize(this.carouselResourceName)]: resources,
      },
    })
  }

  updateBlock = e => {
    if (e.target.name === 'relatedPagesPageType') {
      this.setState({
        block: {
          ...this.state.block,
          pages: [],
          [e.target.name]: e.target.value,
        },
      })
    } else {
      this.setState({
        block: {
          ...this.state.block,
          [e.target.name]: e.target.value,
          ...(e.target.name === 'relatedPagesNumberOfItems' && {
            pages: this.state.block.pages.slice(0, e.target.value),
          }),
        },
      })
    }
  }

  updateCheck = e => {
    this.setState({
      block: {
        ...this.state.block,
        [e.target.name]: !this.state.block[e.target.name],
      },
    })
  }

  updateImageAlt = e => {
    this.setState({
      block: {
        ...this.state.block,
        images: [
          {
            imageIds: this.state.block.images[0].imageIds,
            alt: e.target.value,
          },
        ],
      },
    })
  }

  updateSelectedImages = (selection, names) => {
    const { id: resourceId, type, updateUsedImageIds } = this.props
    this.setState({
      block: {
        ...this.state.block,
        images: [
          {
            imageIds: selection,
            alt: this.state.block.images[0].alt,
          },
        ],
        selectedImages: names,
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

  saveBlock = e => {
    e.preventDefault()
    if (!this.isValid()) {
      return false
    }
    this.setState({ isLoading: true })
    if (this.props.index > -1) {
      this.props.onSubmit(this.state.block, this.props.index)
    } else {
      this.props.onSubmit(this.state.block)
    }
  }

  openFileManager = () => {
    this.setState({
      fileManager: () => (
        <FileManager
          ref="filemanager"
          selectedImages={this.state.block.selectedImages}
          id={this.props.id}
          type={this.props.type}
          onConfirm={this.updateSelectedImages}
          closeEvent={this.unsetFileManager}
        />
      ),
    })
  }

  openCardFileManager = (resourceIndex, selectedImages) => {
    this.setState({
      fileManager: () => (
        <FileManager
          ref="filemanager"
          selectedImages={selectedImages}
          id={this.props.id}
          type={this.props.type}
          onConfirm={this.updateCardSelectedImages(resourceIndex)}
          closeEvent={this.unsetFileManager}
        />
      ),
    })
  }

  updateCardSelectedImages = resourceIndex => (selection, names) => {
    const { id: resourceId, type, updateUsedImageIds } = this.props
    updateUsedImageIds({
      type,
      resourceId,
      block: {
        ...this.state.block,
        images: [
          {
            imageIds: selection,
          },
        ],
      }
    })
    this.updateResourceImage(selection, names, resourceIndex)
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

  updateProgramme = value => {
    this.setState({
      block: {
        ...this.state.block,
        programme: value,
        programmeId: value?.id || null,
      },
    })
  }

  renderRelatedPagesForm = () => {
    const resources = this.state.block[pluralize(this.resourceName)]
    const { theme } = this.props
    return (
      <div>
        <FormControl label="Background">
          <Select
            options={[
              { value: 'light', label: 'Plain' },
              { value: 'shade', label: 'Shaded' },
            ]}
            onChange={value => {
              this.updateBlock({
                target: { name: 'relatedPagesBackground', value: value },
              })
            }}
            value={this.state.block.relatedPagesBackground}
            clearable={false}
            simpleValue={true}
          />
        </FormControl>
        <FormControl
          error={
            this.state.errors.includes('relatedPagesPageType') &&
            'Please complete this field'
          }
          label="Page Type"
        >
          <Select
            options={[
              { value: 'pages', label: 'Page' },
              { value: 'programmes', label: this.props.theme.localisation.programme.upper },
              { value: 'collections', label: 'Collection' },
              { value: 'cards', label: 'Cards' },
            ]}
            onChange={value => {
              this.updateBlock({
                target: { name: 'relatedPagesPageType', value: value },
              })
            }}
            value={this.state.block.relatedPagesPageType}
            clearable={false}
            simpleValue={true}
          />
        </FormControl>
        {this.props.theme.features.relatedPages.sizeOption && (
          <FormControl
            error={
              this.state.errors.includes('relatedPagesNumberOfItems') &&
              'Please complete this field'
            }
            label="Number of items"
          >
            <Select
              options={[{ value: 3, label: '3' }, { value: 4, label: '4' }]}
              onChange={value => {
                this.updateBlock({
                  target: { name: 'relatedPagesNumberOfItems', value: value },
                })
              }}
              value={this.state.block.relatedPagesNumberOfItems}
              clearable={false}
              simpleValue={true}
            />
          </FormControl>
        )}
        {(this.state.block.relatedPagesPageType === 'collections' ||
          this.state.block.relatedPagesPageType === 'pages') && (
          <FormControl label="Order">
            <Select
              options={[
                { value: 'manual', label: 'CMS ordering' },
                { value: 'date', label: 'Published date' },
              ]}
              onChange={value => {
                this.updateBlock({ target: { name: 'order', value: value } })
              }}
              value={this.state.block.order}
              clearable={false}
              simpleValue={true}
            />
          </FormControl>
        )}
        {this.state.block.relatedPagesPageType === 'collections' && (
          <FormControl
            error={
              this.state.errors.includes('relatedPagesCollection') &&
              'Please complete this field'
            }
            label="Collection"
          >
            <Select
              options={this.state.collections}
              onChange={value => {
                this.updateBlock({
                  target: { name: 'relatedPagesCollection', value: value },
                })
              }}
              value={this.state.block.relatedPagesCollection}
              clearable={false}
              simpleValue={true}
              labelKey="title"
              valueKey="id"
            />
          </FormControl>
        )}
        {resources.map((resource, i) => {
          const classes =
            i === this.state.dragged
              ? 'cms-form__group cms-form__group--hidden'
              : 'cms-form__group'
          return (
            <div
              className={classes}
              key={i}
              draggable="true"
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
              {this.state.block.relatedPagesPageType === 'programmes' && (
                <FormControl
                  error={
                    this.state.resourceErrors[i] &&
                    this.state.resourceErrors[i].includes('resource') &&
                    'Please complete this field'
                  }
                  label={`${this.props.theme.localisation.programme.upper}`}
                >
                  <DefaultProgrammesAutosuggest>
                    {({ programmeSuggestions, searchProgrammes }) => {
                      return (
                        <AsyncSelect
                          labelKey="title-with-genre"
                          onChange={value => {
                            resources[i].resource = value
                            this.setState(() => ({ resources }))
                          }}
                          value={this.state.block.pages[i].resource}
                          placeholder="Type to search"
                          loadOptions={searchProgrammes}
                          options={programmeSuggestions}
                          valueKey="id"
                        />
                      )
                    }}
                  </DefaultProgrammesAutosuggest>
                </FormControl>
              )}
              {this.state.block.relatedPagesPageType === 'pages' && (
                <FormControl
                  error={
                    this.state.resourceErrors[i] &&
                    this.state.resourceErrors[i].includes('resource') &&
                    'Please complete this field'
                  }
                  label="Pages"
                >
                  <Select
                    options={this.state.pages}
                    onChange={value => {
                      resources[i].resource = value
                      this.setState(() => ({ resources }))
                    }}
                    value={this.state.block.pages[i].resource}
                    labelKey="title"
                    valueKey="id"
                  />
                </FormControl>
              )}
              {this.state.block.relatedPagesPageType === 'cards' && (
                <div className="grid grid--two">
                  <FormControl
                    error={
                      this.state.resourceErrors[i] &&
                      this.state.resourceErrors[i].includes('label') &&
                      'Please complete this field'
                    }
                    type="text"
                    label="Label"
                    name="label"
                    value={resources[i].label}
                    onFocus={e => {
                      this.disallowDrag(e, `${this.resourceName}-${i}`)
                    }}
                    onBlur={e => {
                      this.allowDrag(e, `${this.resourceName}-${i}`)
                    }}
                    onChange={e => {
                      resources[i].label = e.target.value
                      this.setState(() => ({ resources }))
                    }}
                  />
                  <FormControl
                    error={
                      this.state.resourceErrors[i] &&
                      this.state.resourceErrors[i].includes('title') &&
                      'Please complete this field'
                    }
                    type="text"
                    label="Title"
                    name="title"
                    value={resources[i].title}
                    onFocus={e => {
                      this.disallowDrag(e, `${this.resourceName}-${i}`)
                    }}
                    onBlur={e => {
                      this.allowDrag(e, `${this.resourceName}-${i}`)
                    }}
                    onChange={e => {
                      resources[i].title = e.target.value
                      this.setState(() => ({ resources }))
                    }}
                  />
                  <FormControl
                    error={
                      this.state.resourceErrors[i] &&
                      this.state.resourceErrors[i].includes('description') &&
                      'Please complete this field'
                    }
                    type="text"
                    label="Description"
                    name="description"
                    value={resources[i].description}
                    onFocus={e => {
                      this.disallowDrag(e, `${this.resourceName}-${i}`)
                    }}
                    onBlur={e => {
                      this.allowDrag(e, `${this.resourceName}-${i}`)
                    }}
                    onChange={e => {
                      resources[i].description = e.target.value
                      this.setState(() => ({ resources }))
                    }}
                  />
                  <FormControl
                    error={
                      this.state.resourceErrors[i] &&
                      this.state.resourceErrors[i].includes('url') &&
                      'Please complete this field'
                    }
                    type="text"
                    label="URL"
                    name="url"
                    value={resources[i].url}
                    onFocus={e => {
                      this.disallowDrag(e, `${this.resourceName}-${i}`)
                    }}
                    onBlur={e => {
                      this.allowDrag(e, `${this.resourceName}-${i}`)
                    }}
                    onChange={e => {
                      resources[i].url = e.target.value
                      this.setState(() => ({ resources }))
                    }}
                  />
                  <FormControl label="Image" modifiers={['tall']}>
                    <div className="cms-form__image-selection">
                      <p>{resources[i].imageNames.join(', ')}</p>
                      <Button
                        type="button"
                        className="button button--filled"
                        onClick={() =>
                          this.openCardFileManager(i, resources[i].imageNames)
                        }
                      >
                        Choose Image
                      </Button>
                    </div>
                  </FormControl>
                </div>
              )}
            </div>
          )
        })}
        {((this.state.block.pages.length <
          this.state.block.relatedPagesNumberOfItems &&
          this.state.block.relatedPagesPageType !== 'collections') ||
          this.state.block.relatedPagesPageType === 'cards') && (
          <div className="cms-form__actions">
            <Button
              className="button button--small"
              onClick={this.addResource}
              type="button"
            >
              Add {this.resourceName}
            </Button>
          </div>
        )}
      </div>
    )
  }

  renderPromoCarouselForm = () => {
    const resources = this.state.block[pluralize(this.carouselResourceName)]
    return (
      <div>
        <FormControl label="Background">
          <Select
            options={[
              { value: 'light', label: 'Plain' },
              { value: 'shade', label: 'Shaded' },
            ]}
            onChange={value => {
              this.updateBlock({
                target: { name: 'promoCarouselBackground', value: value },
              })
            }}
            value={this.state.block.promoCarouselBackground}
            clearable={false}
            simpleValue={true}
          />
        </FormControl>

        <FormControl>
          <div className="checkbox">
            <input
              type="checkbox"
              checked={this.state.block.promoCarouselArrows}
              name="promoCarouselArrows"
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
              checked={this.state.block.promoCarouselDots}
              name="promoCarouselDots"
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
              checked={this.state.block.promoCarouselScrollBar}
              name="promoCarouselScrollBar"
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
              checked={this.state.block.promoCarouselPager}
              name="promoCarouselPager"
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
          {resources.map((resource, i) => {
            const classes =
              i === this.state.dragged
                ? 'cms-form__group cms-form__group--hidden'
                : 'cms-form__group'
            return (
              <div
                className={classes}
                key={i}
                draggable="true"
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
                ref={`${this.carouselResourceName}-${i}`}
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
                      this.removeCarouselResource(i)
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
                  value={resource.title}
                  type="text"
                  label="Title"
                  modifiers={['full']}
                  onChange={({ target }) => {
                    resources[i].title = target.value
                    this.setState(() => ({ resources }))
                  }}
                  onFocus={e => {
                    this.disallowDrag(e, `${this.carouselResourceName}-${i}`)
                  }}
                  onBlur={e => {
                    this.allowDrag(e, `${this.carouselResourceName}-${i}`)
                  }}
                />
                <FormControl
                  label={`Add a ${this.props.theme.localisation.programme.lower}`}
                  modifiers={['full']}
                  error={
                    this.state.resourceErrors[i] &&
                    this.state.resourceErrors[i].includes('programmes') &&
                    'Please complete this field'
                  }
                >
                  <DefaultProgrammesAutosuggest>
                    {({ programmeSuggestions, searchProgrammes }) => {
                      return (
                        <AsyncSelect
                          labelKey="title-with-genre"
                          onChange={value => {
                            const programmeExists = resource.programmes.filter(
                              ({ id }) => id === value.id,
                            )
                            if (programmeExists.length < 1) {
                              const programmes = resources[i].programmes.slice(
                                0,
                              )
                              programmes.push(value)
                              resources[i].programmes = programmes
                              this.setState(() => ({ resources }))
                            }
                          }}
                          placeholder="Type to search"
                          loadOptions={searchProgrammes}
                          options={programmeSuggestions}
                        />
                      )
                    }}
                  </DefaultProgrammesAutosuggest>
                </FormControl>
                <FormControl
                  label={`Selected ${pluralize(this.props.theme.localisation.programme.upper)}`}
                  modifiers={['full']}
                >
                  {resource.programmes.length < 1 ? (
                    <p>No {pluralize(this.props.theme.localisation.programme.lower)} selected</p>
                  ) : (
                    <div>
                      {resource.programmes.map((programme, j) => {
                        return (
                          <span className="count count--large" key={j}>
                            <span
                              class="count__remove"
                              onClick={() => {
                                resources[i].programmes = resources[
                                  i
                                ].programmes.filter(
                                  ({ id }) => id !== programme.id,
                                )
                                this.setState(() => ({ resources }))
                              }}
                            >
                              ×
                            </span>
                            {programme['title']}
                          </span>
                        )
                      })}
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
            onClick={this.addCarouselResource}
            type="button"
          >
            Add {this.carouselResourceName}
          </Button>
        </div>
      </div>
    )
  }

  render() {
    const buttonClasses = [
      'button',
      'filled',
      this.state.isLoading && 'loading',
    ].join(' button--')
    return (
      <form onSubmit={this.saveBlock} className="cms-form">
        <FormControl label="Background">
          <Select
            options={[
              { value: 'light', label: 'Plain' },
              { value: 'shade', label: 'Shaded' },
            ]}
            onChange={value => {
              this.updateBlock({ target: { name: 'background', value: value } })
            }}
            value={this.state.block.background}
            clearable={false}
            simpleValue={true}
          />
        </FormControl>
        <FormControl label="Media">
          <Select
            options={[
              { value: 'image', label: 'Image' },
              { value: 'video', label: 'Video' },
            ]}
            onChange={value => {
              this.updateBlock({ target: { name: 'media', value: value } })
            }}
            value={this.state.block.media}
            simpleValue={true}
          />
        </FormControl>
        {this.state.block.media && (
          <FormControl label="Media Position">
            <Select
              options={[
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
              ]}
              onChange={value => {
                this.updateBlock({ target: { name: 'mediaPos', value: value } })
              }}
              value={this.state.block.mediaPos}
              clearable={false}
              simpleValue={true}
            />
          </FormControl>
        )}
        {this.state.block.media === 'image' && (
          <div>
            <FormControl label="Image" modifiers={['tall']}>
              <div className="cms-form__image-selection">
                <p>{this.state.block.selectedImages.join(', ')}</p>
                <Button
                  type="button"
                  className="button button--filled"
                  onClick={this.openFileManager}
                >
                  Choose Image
                </Button>
              </div>
              {this.state.fileManager()}
            </FormControl>
            <FormControl
              label="Image Alt Text"
              type="text"
              value={this.state.block.images[0].alt}
              name="imageAlt"
              onChange={this.updateImageAlt}
            />
          </div>
        )}
        {this.state.block.media === 'video' && (
          <div>
            <FormControl label="Video Provider">
              <Select
                options={[
                  { value: 'youtube', label: 'Youtube' },
                  { value: 'vimeo', label: 'Vimeo' },
                  ...this.props.theme.features.providers.map(p => ({
                    value: p.name ? p.name : p,
                    label: p.name
                      ? p.name.charAt(0).toUpperCase() + p.name.slice(1)
                      : p.charAt(0).toUpperCase() + p.slice(1),
                  })),
                ]}
                onChange={value => {
                  this.updateBlock({
                    target: { name: 'provider', value: value },
                  })
                }}
                value={this.state.block.provider}
                clearable={false}
                simpleValue={true}
              />
            </FormControl>
            <FormControl
              label="Video ID"
              type="text"
              name="vidId"
              value={this.state.block.vidId}
              onChange={this.updateBlock}
            />
            <FormControl label="Video Poster" modifiers={['tall']}>
              <div className="cms-form__image-selection">
                <p>{this.state.block.selectedImages.join(', ')}</p>
                <Button
                  type="button"
                  className="button button--filled"
                  onClick={this.openFileManager}
                >
                  Choose Image
                </Button>
              </div>
              {this.state.fileManager()}
            </FormControl>
          </div>
        )}
        {this.state.block.media === 'programme' && (
          <div>
            <FormControl label={`${this.props.theme.localisation.programme.upper}`}>
              <DefaultProgrammesAutosuggest>
                {({ programmeSuggestions, searchProgrammes }) => {
                  return (
                    <AsyncSelect
                      onChange={this.updateProgramme}
                      value={this.state.block.programme}
                      placeholder="Type to search"
                      loadOptions={searchProgrammes}
                      options={programmeSuggestions}
                      labelKey="title-with-genre"
                    />
                  )
                }}
              </DefaultProgrammesAutosuggest>
            </FormControl>
          </div>
        )}
        <FormControl
          label="Content"
          modifiers={['tall']}
          error={
            this.state.errors.includes('content') &&
            'Please complete this field'
          }
        >
          <Editor
            value={this.state.block.content}
            onChange={value => {
              this.updateBlock({ target: { name: 'content', value: value } })
            }}
          />
        </FormControl>
        <FormControl label="Items type">
          <Select
            options={[
              { value: 'related-pages', label: 'Related pages' },
              { value: 'promo-carousel', label: 'Promo carousel' },
            ]}
            onChange={value => {
              this.updateBlock({ target: { name: 'itemsType', value: value } })
            }}
            value={this.state.block.itemsType}
            simpleValue={true}
            clearable={false}
          />
        </FormControl>

        {this.state.block.itemsType === 'related-pages' &&
          this.renderRelatedPagesForm()}
        {this.state.block.itemsType === 'promo-carousel' &&
          this.renderPromoCarouselForm()}

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
  withHooks((props) => {
    const usedImageIdState = useUsedImageIdState()
    return {
      updateUsedImageIds: usedImageIdState.updateUsedImageIds,
    }
  })
)

export default enhance(TextItemsBlockForm)
