import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import deepmerge from 'deepmerge-concat'
import { Localisation } from 'javascript/config/features' // not one-lite
import uuid from 'uuid/v1'

import 'stylesheets/admin/components/resource-list'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import useResource from 'javascript/utils/hooks/use-resource'
import useUsedImageIdState from 'javascript/views/admin/pages/content-blocks/use-used-image-id-state'

import ProgrammePlaceholder from 'images/theme/programme-placeholder.jpg'

import Button from 'javascript/components/button'
import FileManager from 'javascript/components/admin/filemanager'
import FormControl from 'javascript/components/form-control'
import Icon from 'javascript/components/icon'
import Select from 'react-select'
import AsyncSelect from 'javascript/components/async-select'
import { ProgrammesAutosuggest } from 'javascript/utils/hooks/use-programmes-autosuggest'

class FeaturedContentGridBlockForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        background: 'light',
        slots: {},
        ...props.block,
        type: 'featured-content-grid',
      },
    }
  }

  updateBlock = e => {
    this.setState({
      block: {
        ...this.state.block,
        [e.target.name]: e.target.value,
      },
    })
  }

  saveBlock = e => {
    e.preventDefault()
    const block = this.state.block

    this.setState({ isLoading: true })
    if (this.props.index > -1) {
      this.props.onSubmit(block, this.props.index)
    } else {
      this.props.onSubmit(block)
    }
  }

  addSlot = () => {
    const { block } = this.state
    const id = new Date().getTime()

    this.setState({
      block: deepmerge(block, {
        slots: {
          [id]: {
            id,
            items: {},
          },
        },
      }),
    })
  }

  removeSlot = slotId => () => {
    const { id: resourceId, type } = this.props
    const { block } = this.state
    const { [slotId]: _, ...slots } = block.slots

    this.setState({
      block: {
        ...block,
        slots,
      },
    }, () => {
      this.props.updateUsedImageIds({
        type,
        resourceId,
        block: this.state.block
      })
    })
  }

  removeItem = (slotId, itemId) => () => {
    const { id: resourceId, type } = this.props
    const { block } = this.state
    const { [itemId]: _, ...items } = block.slots[slotId].items

    this.setState({
      block: {
        ...block,
        slots: {
          ...block.slots,
          [slotId]: {
            ...block.slots[slotId],
            items,
          },
        },
      },
    }, () => {
      this.props.updateUsedImageIds({
        type,
        resourceId,
        block: this.state.block
      })
    })
  }

  addImageToSlot = slotId => ([imageId]) => {
    const { id: resourceId, type } = this.props
    const { block } = this.state
    const id = new Date().getTime()
    this.setState({
      block: deepmerge(block, {
        slots: {
          [slotId]: {
            items: {
              [id]: {
                id,
                type: 'image',
                imageId,
              },
            },
          },
        },
      }),
    }, () => {
      this.props.updateUsedImageIds({
        type,
        resourceId,
        block: this.state.block
      })
      this.unsetFileManager()
    })
  }

  addProgrammeToSlot = slotId => () => {
    const { block } = this.state
    const id = new Date().getTime()

    this.setState({
      block: deepmerge(block, {
        slots: {
          [slotId]: {
            items: {
              [id]: {
                id,
                type: 'programme',
              },
            },
          },
        },
      }),
    })
  }

  setItemProgramme = (slotId, itemId) => programme => {
    const { block } = this.state

    this.setState({
      block: deepmerge(block, {
        slots: {
          [slotId]: {
            items: {
              [itemId]: {
                programme,
              },
            },
          },
        },
      }),
    })
  }

  openFileManager = slotId => () => {
    this.setState({
      fileManager: () => (
        <FileManager
          ref="filemanager"
          id={this.props.id}
          type={this.props.type}
          onConfirm={this.addImageToSlot(slotId)}
          closeEvent={this.unsetFileManager}
          index={slotId}
        />
      ),
    })
  }

  unsetFileManager = () => {
    ReactDOM.findDOMNode(this.refs.filemanager).classList.add('modal--is-hiding')
    this.props.fetchPageImages()
    setTimeout(() => {
      this.setState({ fileManager: false })
    }, 500)
  }

  render() {
    const buttonClasses = [
      'button',
      'filled',
      this.state.isLoading && 'loading',
    ].join(' button--')
    const { fileManager } = this.state

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
        {Object.values(this.state.block.slots).map((slot, index) => {
          return (
            <div className="resource-list" key={slot.id}>
              <div className="cms-form__group-actions">
                <Button
                  type="button"
                  className="button button--smallest button--error"
                  onClick={this.removeSlot(slot.id)}
                >
                  Remove
                </Button>
              </div>

              {index === 0 ? <h3>Promo Slot</h3> : <h3>Slot {index}</h3>}

              <div className="resource-list__grid">
                {Object.values(slot.items).map(item => {
                  const image = this.props.images.find((image) => image.id === item.imageId)
                  return (
                    <div key={item.id} className="resource-list__item">
                      <Button
                        type="button"
                        className="resource-list__remove"
                        onClick={this.removeItem(slot.id, item.id)}
                      >
                        <Icon id="i-close" />
                      </Button>

                      {item.type === 'image' && image && (
                        <div>
                          {image.file && image.file.url ? (
                            <img
                              src={image.file.url.replace(
                                '.net/',
                                '.net/250x150/',
                              )}
                            />
                          ) : (
                            <img srcSet={`${ProgrammePlaceholder}`} />
                          )}

                          <p>{image.filename}</p>
                        </div>
                      )}

                      {item.programme && (
                        <div>
                          {item.programme &&
                          item.programme.thumbnail &&
                          item.programme.thumbnail.url ? (
                            <img
                              src={item.programme.thumbnail.url.replace(
                                '.net/',
                                '.net/250x150/',
                              )}
                            />
                          ) : (
                            <img srcSet={`${ProgrammePlaceholder}`} />
                          )}
                          <p>{item.programme.title}</p>
                        </div>
                      )}

                      {item.type === 'programme' && !item.programme && (
                        <div className="resource-list__inner">
                          <ProgrammesAutosuggest
                            buildParams={keywords => ({
                              fields: {
                                programmes: 'thumbnail,title-with-genre',
                              },
                              filter: {
                                keywords: encodeURIComponent(keywords),
                              },
                            })}
                            onLoad={(options, callback) =>
                              callback({ options })
                            }
                          >
                            {({ searchProgrammes, programmeSuggestions }) => (
                              <AsyncSelect
                                onChange={this.setItemProgramme(
                                  slot.id,
                                  item.id,
                                )}
                                value={item.programme}
                                options={programmeSuggestions}
                                placeholder="Type to search"
                                labelKey="title-with-genre"
                                loadOptions={searchProgrammes}
                                valueKey="id"
                              />
                            )}
                          </ProgrammesAutosuggest>
                        </div>
                      )}
                    </div>
                  )
                })}

                <div className="resource-list__item">
                  <div className="resource-list__inner">
                    <Button
                      className="icon-button"
                      type="button"
                      onClick={this.addProgrammeToSlot(slot.id)}
                    >
                      <Icon id="i-admin-tv" viewBox="0 0 40 35" />
                    </Button>
                    <Button
                      className="icon-button"
                      type="button"
                      onClick={this.openFileManager(slot.id)}
                    >
                      <Icon id="i-admin-asset" viewBox="0 0 36 30" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        <div className="cms-form__actions">
          <Button
            className="button button--small"
            onClick={this.addSlot}
            type="button"
          >
            Add New Slot
          </Button>
        </div>

        {fileManager && fileManager()}

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
  withHooks((props) => {
    const relation = {
      id: props.id,
      name: props.type === 'news' ? 'news-article' : 'page'
    }
    const pageImageResource = useResource('page-image')

    const fetchPageImages = () => {
      pageImageResource.findAllFromOneRelation(relation, {
        fields: {
          'page-images': 'file,filename',
        },
      })
    }

    useEffect(() => {
      fetchPageImages()
    }, [])

    const usedImageIdState = useUsedImageIdState()
    return {
      fetchPageImages,
      images: pageImageResource.getDataAsArray() || [],
      updateUsedImageIds: usedImageIdState.updateUsedImageIds,
    }
  })
)


export default enhance(FeaturedContentGridBlockForm)