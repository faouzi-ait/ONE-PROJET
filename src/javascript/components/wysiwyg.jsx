import React from 'react'
import ReactQuill from 'react-quill'

import ClientProps from 'javascript/utils/client-switch/components/client-props'

const Inline = ReactQuill.Quill.import('blots/inline')

class ButtonBlot extends Inline {
  create(value) {
    const node = super.create()
    return node
  }
}

ButtonBlot.blotName = 'button'
ButtonBlot.tagName = 'strong'
ButtonBlot.className = 'wysiwyg__button'
ReactQuill.Quill.register('formats/button', ButtonBlot)

class Link extends Inline {
  static create(value) {
    let node = super.create(value)
    value = this.sanitize(value)
    node.setAttribute('href', value)
    if (value.includes('http') || value.includes('www')) {
      node.setAttribute('target', '_blank')
    }
    return node
  }

  static formats(domNode) {
    return domNode.getAttribute('href')
  }

  static sanitize(url) {
    return sanitize(url, this.PROTOCOL_WHITELIST) ? url : this.SANITIZED_URL
  }

  format(name, value) {
    if (name !== this.statics.blotName || !value) return super.format(name, value)
    value = this.constructor.sanitize(value)
    this.domNode.setAttribute('href', value)
  }
}
Link.blotName = 'link'
Link.tagName = 'A'
Link.SANITIZED_URL = 'about:blank'
Link.PROTOCOL_WHITELIST = ['http', 'https', 'mailto', 'tel']

function sanitize(url, protocols) {
  let anchor = document.createElement('a')
  anchor.href = url
  let protocol = anchor.href.slice(0, anchor.href.indexOf(':'))
  return protocols.indexOf(protocol) > -1
}

ReactQuill.Quill.register('formats/link', Link)

class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.quillRef = null
    this.reactQuillRef = null
  }

  componentDidMount() {
    this.attachQuillRefs()
  }
  
  componentDidUpdate() {
    this.attachQuillRefs()
  }

  attachQuillRefs = () => {
    if (typeof this.reactQuillRef.getEditor !== 'function') return
    this.quillRef = this.reactQuillRef.getEditor()
  }

  wrapButton = (value) => {
    const range = this.reactQuillRef.getEditorSelection()
    if (range) {
      this.quillRef.format('button', true)
    }
  }

  link = (value) => {
    if (value) {
      let range = this.quillRef.getSelection()
      if (range == null || range.length == 0) return
      let preview = this.quillRef.getText(range)
      if (/^\S+@\S+\.\S+$/.test(preview) && preview.indexOf('mailto:') !== 0) {
        preview = 'mailto:' + preview
      }
      let tooltip = this.quillRef.theme.tooltip
      tooltip.edit('link', preview)
    } else {
      this.quillRef.format('link', false)
    }
  }

  render() {
    const defaultFormats = ['bold', 'italic', 'underline', 'button', 'list', 'align', 'link', 'header']
    const defaultFormatOptions = [
      [{'header':[]}],
      ['bold', 'italic', 'underline', 'button'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{ 'align': ['', 'center', 'right'] }],
      ['link'],
      ['clean'],
    ]
    return (
      <ClientProps
        clientProps={{
          customFormats: {
            'default': [],
            'all3': ['color']
          },
          customFormatOptions: {
            default: [],
            'all3': [[{ 'color': ['#F6A200'] }]]
          }
        }}
        renderProp={(clientProps) => {
          const containerOptions = [...defaultFormatOptions, ...clientProps.customFormatOptions]
          return <div
            // These events need to be moved to the div in order to work in safari
            onFocus={ this.props.onFocus }
            onBlur={ this.props.onBlur }>
            <ReactQuill
            ref={(el) => { this.reactQuillRef = el }}
            value={ this.props.value }
            onChange={this.props.onChange}
            
            formats={[...defaultFormats, ...clientProps.customFormats]}
            modules={{
              toolbar: {
                container: containerOptions,
                handlers: {
                  button: this.wrapButton,
                  link: this.link
                }
              },
              clipboard: {
                matchVisual: false,
              }
            }}
          />
          </div>
        }}
      />
    )
  }

}

export default Editor