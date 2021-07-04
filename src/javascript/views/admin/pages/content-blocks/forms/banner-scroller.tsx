import React from 'react'

import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import useUsedImageIdState from 'javascript/views/admin/pages/content-blocks/use-used-image-id-state'

import Button from 'javascript/components/button'
import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'
import FormControl from 'javascript/components/form-control'
import FileManager from 'javascript/components/admin/filemanager'

interface State {
  block?: BannerScrollerBlock
  tabs?: Tab[]
}
interface Props {
  block?: BannerScrollerBlock
  index: undefined | number
  onSubmit: (block: BannerScrollerBlock, index?: number) => void
  updateUsedImageIds: any
}

interface BannerScrollerBlock {
  tabs?: Tab[]
  fileManager?: () => any
  loading?: boolean
}

interface Tab {
  title: string
  intro?: string
  button1Text?: string
  button1Link?: string
  button2Text?: string
  button2Link?: string
  desktopImage?: {
    id: string
    name: string
  }
  mobileImage?: {
    id: string
    name: string
  }
}

class BannerScrollerBlockForm extends NestedBlock<
  Props,
  BannerScrollerBlock,
  State,
  Tab
> {
  constructor(props: Props) {
    super(props)
    this.state = {
      block: {
        tabs: props.block
          ? props.block.tabs.map(obj => Object.assign({}, obj))
          : [],
        type: 'banner-scroller'
      },
      fileManager: () => {},
      errors: [],
      resourceErrors: [],
    }
    this.resourceName = 'tab'
  }

  updateTabs = (e, i, type) => {
    const nextTabs = this.state.block.tabs.map((s,index) =>
      i === index ? {...s, [type]: e.target.value } : s
    )
    this.setState(() => ({
      block: {
        ...this.state.block,
        tabs: nextTabs
      }
    }))
  }

  updateImage = (selection, names, i, type) => {
    const nextTabs = this.state.block.tabs
    const { id: resourceId, type: blockType, updateUsedImageIds } = this.props
    nextTabs[i][type] = {
      id: selection,
      name: names,
    }
    nextTabs[i]['imageIds'] = [
      nextTabs[i].desktopImage?.id,
      nextTabs[i].mobileImage?.id
    ]
    nextTabs[i]['imageNames'] = [
      nextTabs[i].desktopImage?.name,
      nextTabs[i].mobileImage?.name
    ]
    this.setState(() => ({
      block: {
        ...this.state.block,
        tabs: nextTabs
      },
      fileManager: () => {}
    }), () => {
      updateUsedImageIds({
        type: blockType,
        resourceId,
        block: this.state.block
      })
    })
  }


  render() {
    const {tabs} = this.state.block
    const buttonClasses = [
      'button',
      'filled',
      this.state.isLoading && 'loading',
    ].join(' button--')
    return (
      <form onSubmit={this.saveBlock} className="cms-form">
        <div>
          {tabs.map((tab, i) => {
            return (
              <div
                className={'cms-form__group'}
                key={i}
              >
                <div className="cms-form__group-actions">
                  {/* <Button
                    type="button"
                    className="button button--smallest button--filled"
                    style={{ cursor: 'move' }}
                  >
                    Move
                  </Button> */}
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
                  value={tab.title}
                  type="text"
                  label="Title"
                  modifiers={['full']}
                  onChange={(e) => this.updateTabs(e, i, 'title')}
                />
                <FormControl
                  value={tab.intro}
                  type="text"
                  label="Intro"
                  modifiers={['full']}
                  onChange={(e) => this.updateTabs(e, i, 'intro')}
                />
                <FormControl
                  value={tab.button1Text}
                  type="text"
                  label="Button 1 Text"
                  onChange={(e) => this.updateTabs(e, i, 'button1Text')}
                />
                <FormControl
                  value={tab.button1Link}
                  type="text"
                  label="Button 1 Link"
                  onChange={(e) => this.updateTabs(e, i, 'button1Link')}
                />
                <FormControl
                  value={tab.button2Text}
                  type="text"
                  label="Button 2 Text"
                  onChange={(e) => this.updateTabs(e, i, 'button2Text')}
                />
                <FormControl
                  value={tab.button2Link}
                  type="text"
                  label="Button 2 Link"
                  onChange={(e) => this.updateTabs(e, i, 'button2Link')}
                />
                <FormControl label="Desktop Image" modifiers={['tall']}>
                  <div className="cms-form__image-selection">
                    <p>{tab.desktopImage?.name}</p>
                    <Button
                      type="button"
                      className="button button--filled"
                      onClick={() => {
                        this.setState({
                          fileManager: () => (
                            <FileManager
                              ref="filemanager"
                              selectedImages={[tab.desktopImage?.id]}
                              id={this.props.id}
                              type={this.props.type}
                              index={i}
                              onConfirm={(selection, names, index) => {
                                this.updateImage(selection[0], names[0], i, 'desktopImage')
                              }}
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
                <FormControl label="Mobile Image (max width 1536px)" modifiers={['tall']}>
                  <div className="cms-form__image-selection">
                    <p>{tab.mobileImage?.name}</p>
                    <Button
                      type="button"
                      className="button button--filled"
                      onClick={() => {
                        this.setState({
                          fileManager: () => (
                            <FileManager
                              ref="filemanager"
                              selectedImages={[tab.mobileImage?.id]}
                              id={this.props.id}
                              type={this.props.type}
                              index={i}
                              onConfirm={(selection, names, index) => {
                                this.updateImage(selection[0], names[0], i, 'mobileImage')
                              }}
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
            Add tab
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

const enhance = compose(
  withHooks((props) => {
    const usedImageIdState = useUsedImageIdState()
    return {
      updateUsedImageIds: usedImageIdState.updateUsedImageIds,
    }
  })
)

export default enhance(BannerScrollerBlockForm)