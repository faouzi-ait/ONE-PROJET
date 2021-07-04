import React from 'react'
import ReactDOM from 'react-dom'
import pluralize from 'pluralize'
import styled from 'styled-components'

import relatedPagesClientVariables from 'javascript/views/blocks/_related-pages/variables'

import compose from 'javascript/utils/compose'
import useUsedImageIdState from 'javascript/views/admin/pages/content-blocks/use-used-image-id-state'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
// Stores
import CollectionStore from 'javascript/stores/collections'
import PagesStore from 'javascript/stores/pages'
import NewsCategoriesStore from 'javascript/stores/news-categories'

// Actions
import CollectionActions from 'javascript/actions/collections'
import PagesActions from 'javascript/actions/pages'
import NewsCategoriesActions from 'javascript/actions/news-categories'

import { ProgrammesAutosuggest } from 'javascript/utils/hooks/use-programmes-autosuggest'
import AsyncSelect from 'javascript/components/async-select'
import Button from 'javascript/components/button'
import FileManager from 'javascript/components/admin/filemanager'
import FormControl from 'javascript/components/form-control'
import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'
import Select from 'react-select'


class RelatedPagesForm extends NestedBlock {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        background: props.block ? props.block.background : 'light',
        arrows: props.block ? props.block.arrows : true,
        carousel: props.block ? props.block.carousel : false,
        dots: props.block ? props.block.dots : false,
        title: props.block ? props.block.title : '',
        pageType: props.block ? props.block.pageType : 'pages',
        category: props.block ? props.block.category : null,
        numberOfItems: props.block ? props.block.numberOfItems : 4,
        ...(props.relatedPagesCV.blockOrder(props.block)),
        pages: props.block
          ? props.block.pages.map(obj => Object.assign({}, obj))
          : [],
        actionLink: props.block ? props.block.actionLink : null,
        latest: props.block ? props.block.latest : false,
        collection: props.block ? props.block.collection : '',
        bgImage: props.block
          ? props.block.bgImage
          : {
              id: null,
              name: null,
            },
        type: 'related-pages',
      },
      collections: [],
      pages: props.pages ? props.pages : [],
      newsCategories: [],
      errors: [],
      resourceErrors: [],
      fileManager: () => {},
    }
    if(props.relatedPagesCV.showIntro){
      this.state.block['intro'] = props.block ? props.block.intro : ''
    }
    this.resourceName = 'page'
    this.model = {
      resource: null,
      label: '',
      title: '',
      description: '',
      url: '',
      imageIds: [],
      imageNames: [],
    }
  }

  setValidation = () => {
    return [
      ...this.props.relatedPagesCV.validation,
      this.state.block.pageType !== 'collections' &&
        this.state.block.pageType !== 'news' &&
        this.state.block.pageType !== 'cards' &&
        'pages',
      'pageType',
      this.state.block.pageType === 'collections' && 'collection',
    ].filter(d => d)
  }

  setResourceValidation = () => {
    if (this.state.block.pageType === 'cards') {
      return ['title']
    } else {
      return ['resource']
    }
  }

  componentWillMount() {
    CollectionStore.unsetResources()
    CollectionStore.on('change', this.setResources)
    PagesStore.on('change', this.setPages)
    NewsCategoriesStore.on('change', this.setCategories)
  }

  componentWillUnmount() {
    CollectionStore.removeListener('change', this.setResources)
    PagesStore.removeListener('change', this.setPages)
    NewsCategoriesStore.removeListener('change', this.setCategories)
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
    }

    NewsCategoriesActions.getResources({
      fields: {
        'news-categories': 'name',
      },
      page: { size: 200 },
    })
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

  setCategories = () => {
    this.setState({
      newsCategories: NewsCategoriesStore.getResources()
    })
  }

  updateBlock = e => {
    if (e.target.name === 'pageType') {
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
          ...(e.target.name === 'numberOfItems' && {
            pages: this.state.block.pages,
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

  openFileManager = (resourceIndex, selectedImages) => {
    this.setState({
      fileManager: () => (
        <FileManager
          ref="filemanager"
          selectedImages={selectedImages}
          id={this.props.id}
          type={this.props.type}
          onConfirm={this.updateSelectedImages(resourceIndex)}
          closeEvent={this.unsetFileManager}
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

  updateSelectedImages = resourceIndex => (selection, names) => {
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

  isPageTypeACollectionBlock = (pageType) => {
    return pageType === 'collections' || pageType === 'news'
  }

  renderCategory = () => {
    const {block, newsCategories} = this.state
    if (block.pageType === 'news') {
      return (
        <FormControl label="News Category">
          <Select
            options={[
              {
                value: '',
                label: 'All'
              },
              ...newsCategories.map(n => ({
                value: n.id,
                label: n.name
              }))]
            }
            onChange={value => {
              this.updateBlock({ target: { name: 'category', value: value } })
            }}
            value={block.category || ''}
            clearable={false}
            simpleValue={true}
          />
        </FormControl>
      )
    }
  }

  renderViewAllLink = () => {
    const {block} = this.state
    if (block.pageType === 'news') {
      return (
        <FormControl
          type="checkbox"
          checkboxLabeless={true}
          label="View all Link"
          id="actionLink"
          name="actionLink"
          checked={block.actionLink}
          onChange={({ target }) => {
            this.setState({
              block: {
                ...block,
                actionLink: target.checked,
              },
            })
          }}
        />
      )
    }
    return (
      <FormControl
        type="text"
        label="View all Link"
        name="actionLink"
        value={block.actionLink}
        onChange={this.updateBlock}
      />
    )
  }

  render() {
    const resources = this.state.block[pluralize(this.resourceName)]
    const { theme, relatedPagesCV } = this.props
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
                onClick={() => {
                  this.setState({
                    fileManager: () => (
                      <FileManager
                        ref="filemanager"
                        selectedImages={[this.state.block.bgImage.id]}
                        forceAddImages={true}
                        id={this.props.id}
                        type={this.props.type}
                        onConfirm={this.updatebgImage}
                        closeEvent={this.unsetFileManager}
                      />
                    ),
                  })
                }}
              >
                Choose Image
              </Button>
            </div>
            {this.state.fileManager()}
          </FormControl>
        )}
        <FormControl
          error={
            this.state.errors.includes('title') && 'Please complete this field'
          }
          type="text"
          label="Title"
          name="title"
          value={this.state.block.title}
          onChange={this.updateBlock}
        />

        {relatedPagesCV.showIntro &&
          <FormControl
            error={
              this.state.errors.includes('title') && 'Please complete this field'
            }
            type="textarea"
            label="Intro"
            name="intro"
            value={this.state.block.intro}
            onChange={this.updateBlock}
          />
        }

        <FormControl
          error={
            this.state.errors.includes('pageType') &&
            'Please complete this field'
          }
          label="Page Type"
        >
          <MenuOpenUpwards>
            <Select
              options={[
                { value: 'pages', label: 'Page' },
                { value: 'programmes', label: theme.localisation.programme.upper },
                { value: 'collections', label: 'Collection' },
                { value: 'cards', label: 'Cards' },
                { value: 'news', label: theme.localisation.news.upper },
              ]}
              onChange={value => {
                this.updateBlock({ target: { name: 'pageType', value: value } })
              }}
              value={this.state.block.pageType}
              clearable={false}
              simpleValue={true}
            />
          </MenuOpenUpwards>
        </FormControl>

        { this.renderCategory() }

        { this.renderViewAllLink() }

        {theme.features.relatedPages.sizeOption && (
          <FormControl
            error={
              this.state.errors.includes('numberOfItems') &&
              'Please complete this field'
            }
            label="Items per row"
          >
            <Select
              options={[
                { value: 3, label: '3 items' },
                { value: 4, label: '4 items' },
                { value: 5, label: '5 items' }
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

        {/* #region  itv */}
        {(this.state.block.pageType === 'collections' ||
          this.state.block.pageType === 'pages') && (
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
        {/* #endregion */}

        {this.state.block.pageType === 'collections' && (
          <FormControl
            error={
              this.state.errors.includes('collection') &&
              'Please complete this field'
            }
            label="Collection"
          >
            <Select
              options={this.state.collections}
              onChange={value => {
                this.updateBlock({
                  target: { name: 'collection', value: value },
                })
              }}
              value={this.state.block.collection}
              clearable={false}
              simpleValue={true}
              labelKey="title"
              valueKey="id"
            />
          </FormControl>
        )}

        { !this.isPageTypeACollectionBlock(this.state.block.pageType) && (
          <FormControl>
            <div className="checkbox">
              <input
                type="checkbox"
                checked={this.state.block.carousel}
                name="carousel"
                className="checkbox__input"
                id="carousel"
                onChange={this.updateCheck}
              />
              <label htmlFor="carousel" className="checkbox__label cms-form__label">
                Display as carousel
              </label>
            </div>
          </FormControl>
        )}
        {this.state.block.carousel &&
          !this.isPageTypeACollectionBlock(this.state.block.pageType) && (
            <div>
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
                  <label
                    htmlFor="arrows"
                    className="checkbox__label cms-form__label"
                  >
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
            </div>
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
              {this.state.block.pageType === 'programmes' && (
                <FormControl
                  error={
                    this.state.resourceErrors[i] &&
                    this.state.resourceErrors[i].includes('resource') &&
                    'Please complete this field'
                  }
                  label={`${theme.localisation.programme.upper}`}
                >
                  <ProgrammesAutosuggest
                    buildParams={keywords => ({
                      filter: { keywords: encodeURIComponent(keywords) },
                    })}
                    onLoad={(options, callback) => callback({ options })}
                  >
                    {({ programmeSuggestions, searchProgrammes }) => (
                      <AsyncSelect
                        onChange={value => {
                          resources[i].resource = value
                          this.setState(() => ({ resources }))
                        }}
                        value={this.state.block.pages[i].resource}
                        placeholder="Type to search"
                        loadOptions={searchProgrammes}
                        options={programmeSuggestions}
                        labelKey="title-with-genre"
                      />
                    )}
                  </ProgrammesAutosuggest>
                </FormControl>
              )}
              {this.state.block.pageType === 'pages' && (
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
              {this.state.block.pageType === 'cards' && (
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
                      <p>{resource.imageNames.join(', ')}</p>
                      <Button
                        type="button"
                        className="button button--filled"
                        onClick={() =>
                          this.openFileManager(i, resource.imageNames)
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
        {this.state.fileManager()}
        {!this.isPageTypeACollectionBlock(this.state.block.pageType) && (
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
  withClientVariables('relatedPagesCV', relatedPagesClientVariables),
  withHooks((props) => {
    const usedImageIdState = useUsedImageIdState()
    return {
      updateUsedImageIds: usedImageIdState.updateUsedImageIds,
    }
  })
)

export default enhance(RelatedPagesForm)

const MenuOpenUpwards = styled.div`
  .Select-menu-outer {
    bottom: 100%;
    top: auto;
  }
`