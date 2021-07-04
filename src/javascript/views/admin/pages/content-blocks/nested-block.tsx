import React, { ReactInstance } from 'react'
import ReactDOM from 'react-dom'
import pluralize from 'pluralize'

import Button from 'javascript/components/button'
import Editor from 'javascript/components/wysiwyg'
import FileManager from 'javascript/components/admin/filemanager'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'


interface Block {
  type: string
  background?: any
  bgImage?: any
  title?: string
}

interface Props<InheritedBlock> {
  onSubmit: (block: Block & InheritedBlock, index?: number) => void
  index: number
  id: string
  type: string
}

interface State<InheritedBlock> {
  block?: Block & InheritedBlock
  fileManager: () => any
  errors: string[]
  resourceErrors: string[][]
  isLoading?: boolean
  dragged?: number
  resources?: any[]
  hasClickedSubmit?: boolean
}

export default class NestedBlock<
  InheritedProps extends any,
  InheritedState extends any,
  InheritedBlock,
  Model = {}
> extends React.Component<
  InheritedProps & Props<InheritedBlock>,
  InheritedState & State<InheritedBlock>
> {
  model: Model
  theme: ThemeType
  resourceName: string
  formOrder: string[] | null
  validateExtraParameters: () => boolean
  renderCustomFormControl: (formOrderIndex: number, resource: any, onChange: (modelKey: string, values: any) => void) => JSX.Element

  refs: {
    filemanager: ReactInstance
  }

  setValidation = () => []
  setResourceValidation = () => []

  constructor(props) {
    super(props)
    // @ts-ignore
    this.state = {
      fileManager: () => {},
      errors: [],
      resourceErrors: [],
    }
    //@ts-ignore
    this.model = {}
    this.renderCustomFormControl = () => null
    this.formOrder = null
  }

  updateBlock = e => {
    this.setState({
      block: {
        ...this.state.block,
        [e.target.name]: e.target.value,
      },
    })
  }

  isValid = () => {
    const resources = this.state.block[pluralize(this.resourceName)]
    const errors = this.setValidation().filter(
      input => !this.state.block[input] || this.state.block[input].length <= 0,
    )
    const resourceValidation = this.setResourceValidation()
    const resourceErrors = resources.map(resource => {
      return [...resourceValidation].filter(
        input => !resource[input] || resource[input].length <= 0,
      )
    })
    //@ts-ignore
    this.setState({ errors, resourceErrors })
    return (
      errors.length <= 0 &&
      resourceErrors.filter(resource => resource.length > 0).length <= 0
    )
  }

  saveBlock = (e) => {
    e.preventDefault()
    if (!this.isValid()) {
      return false
    } //@ts-ignore
    this.setState({ isLoading: true })
    if (this.props.index > -1) {
      this.props.onSubmit(this.state.block, this.props.index)
    } else {
      this.props.onSubmit(this.state.block)
    }
  }

  addResource = () => {
    this.setState(({ block }) => ({
      block: {
        ...block,
        [pluralize(this.resourceName)]: [
          ...block[pluralize(this.resourceName)],
          {
            ...this.model,
          },
        ],
      },
    }))
  }

  removeResource = index => {
    const resources = this.state.block[pluralize(this.resourceName)]
    resources.splice(index, 1)
    this.setState({
      block: {
        ...this.state.block,
        [pluralize(this.resourceName)]: resources,
      },
    })
  }

  updateResourceImage = (selection, names, index) => {
    const resources = this.state.block[pluralize(this.resourceName)]
    resources[index].imageIds = selection
    resources[index].imageNames = names
    //@ts-ignore
    this.setState({
      block: {
        ...this.state.block,
        [pluralize(this.resourceName)]: resources,
      },
      fileManager: () => {},
    })
  }

  updatebgImage = (selection, names) => {
    //@ts-ignore
    this.setState({
      block: {
        ...this.state.block,
        bgImage: {
          id: selection[0],
          name: names[0],
        },
      },
      fileManager: () => {},
    })
  }

  openFileManager = index => {
    //@ts-ignore
    this.setState({
      fileManager: () => (
        <FileManager
          ref="filemanager"
          selectedImages={
            this.state.block[pluralize(this.resourceName)][index].imageIds
          }
          id={this.props.id}
          type={this.props.type}
          onConfirm={this.updateResourceImage}
          closeEvent={this.unsetFileManager}
          index={index}
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
      //@ts-ignore
      this.setState({
        fileManager: () => {},
      })
    }, 500)
  }

  dragStart = (e, index) => {
    // @ts-ignore
    this.state.dragged = index
    e.dataTransfer.setData('text', e.currentTarget.getAttribute('data-reactid'))
  }

  dragOver = (e, index) => {
    e.preventDefault()
    const resources = this.state.block[pluralize(this.resourceName)]
    resources.splice(index, 0, resources.splice(this.state.dragged, 1)[0])
    this.setState({
      block: {
        ...this.state.block,
        [pluralize(this.resourceName)]: resources,
      },
      dragged: index,
    })
  }

  drop = (e, index) => {
    e.preventDefault()
  }

  dragEnd = (e, index) => {
    e.preventDefault()
    //@ts-ignore
    this.setState({
      dragged: -1,
    })
  }

  disallowDrag = (e, block) => {
    this.refs[block].setAttribute('draggable', false)
  }

  allowDrag = (e, block) => {
    this.refs[block].setAttribute('draggable', true)
  }

  render() {
    const resources = this.state.block[pluralize(this.resourceName)]
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
    if(this.theme?.variables.KidsVersion){
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
                  //@ts-ignore
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
        {this.state.block.title !== null && (
          <FormControl
            type="text"
            label="Title"
            name="title"
            value={this.state.block.title}
            onChange={this.updateBlock}
          />
        )}
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
                {(this.formOrder || Object.keys(this.model)).map((key, j) => {
                  const label = key.charAt(0).toUpperCase() + key.substr(1)
                  switch (key) {
                    case 'imageIds': {
                      return (
                        <div className="cms-form__control" key={j}>
                          <label className="cms-form__label">Image</label>
                          <p className="cms-form__images">{resource.imageNames}</p>
                          <Button
                            type="button"
                            className="button button--filled button--small"
                            onClick={() => {
                              this.openFileManager(i)
                            }}
                          >
                            Choose Image
                          </Button>
                          {this.state.resourceErrors[i] &&
                            this.state.resourceErrors[i].includes('imageIds') && (
                              <p className="cms-form__error">
                                Please complete this field
                              </p>
                            )}
                        </div>
                      )
                    }
                    case 'imageNames': {
                      return false
                    }
                    case 'content': {
                      return (
                        <FormControl
                          key={j}
                          label={label}
                          modifiers={['tall', 'full']}
                        >
                          <div className="cms-form__inner">
                            <Editor
                              value={resource[key]}
                              onChange={value => {
                                resources[i][key] = value
                                //@ts-ignore
                                this.setState(() => ({ resources, dragged: -1 }))
                              }}
                              onFocus={e => {
                                this.disallowDrag(e, `${this.resourceName}-${i}`)
                              }}
                              onBlur={e => {
                                this.allowDrag(e, `${this.resourceName}-${i}`)
                              }}
                            />
                            {this.state.resourceErrors[i] &&
                              this.state.resourceErrors[i].includes(
                                'content',
                              ) && (
                                <p className="cms-form__error">
                                  Please complete this field
                                </p>
                              )}
                          </div>
                        </FormControl>
                      )
                    }
                    case 'customFormControl': {
                      const onChange = (modelKey, values) => {
                        resources[i][modelKey] = values
                        //@ts-ignore
                        this.setState(() => ({ resources, dragged: -1 }))
                      }
                      return (
                        <>
                          {this.renderCustomFormControl(j, resources[i], onChange)}
                        </>
                      )
                    }
                    default: {
                      const formTypes = {
                        email: 'email',
                        telephone: 'tel',
                        bio: 'textarea'
                      }
                      return (
                        <FormControl
                          key={j}
                          error={
                            this.state.resourceErrors[i] &&
                            this.state.resourceErrors[i].includes(key) &&
                            'Please complete this field'
                          }
                          value={resource[key]}
                          type={formTypes[key] || 'text'}
                          label={label}
                          onFocus={e => {
                            this.disallowDrag(e, `${this.resourceName}-${i}`)
                          }}
                          onBlur={e => {
                            this.allowDrag(e, `${this.resourceName}-${i}`)
                          }}
                          onChange={({ target }) => {
                            resources[i][key] = target.value
                            //@ts-ignore
                            this.setState(() => ({ resources, dragged: -1 }))
                          }}
                        />
                      )
                    }
                  }
                })}
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
