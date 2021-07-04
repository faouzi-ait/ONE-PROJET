import React, { LegacyRef } from 'react'

import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import Span from 'javascript/components/span'

import 'stylesheets/core/components/file-uploader.sass'
import usePrefix from 'javascript/utils/hooks/use-prefix'

type FileTypeEnum = 'application/pdf' | 'application/vnd.ms-excel' | 'image/png' | 'image/jpeg'

interface Props {
  acceptedFileTypes?: FileTypeEnum[] | string
  deleteAllowed?: boolean
  deleteConfirmation?: boolean
  filePath?: string
  fileSrc: string | boolean
  fileType?: string
  name?: string
  onChange?: (targetName: string, baseStr: string | ArrayBuffer, file: any) => void
  onRemoveFile?: () => void
  pathIsLink?: boolean
  previewImage?: boolean
  title: string
  viewOnly?: boolean
}

type FileType = Blob & {
  name?: string
  lastModifiedDate?: Date
  lastModified?: number
}

const FileUploader = ({
  acceptedFileTypes = '',
  deleteAllowed = true,
  deleteConfirmation = true,
  filePath = '',
  fileSrc,
  fileType = 'File',
  name = 'file',
  onChange = () => {},
  onRemoveFile = () => {},
  pathIsLink = false,
  previewImage = true,
  title,
  viewOnly = false,
}: Props) => {

  const { prefix } = usePrefix()

  const fileRef: LegacyRef<HTMLInputElement> = React.createRef()
  const handleFileChange = (e) => {
    const input = fileRef.current
    const targetName = input.name
    if (input.files && input.files[0]) {
      const reader = new FileReader()
      const file: FileType = new Blob([input.files[0]], { type: input.files[0].type });
      file.name = input.files[0].name.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '');
      const now = Date.now();
      file.lastModifiedDate = new Date(now);
      file.lastModified = now
      reader.onload = (e) => {
        onChange(targetName, e.target.result, file)
      }
      reader.readAsDataURL(input.files[0])
    }
  }

  const removeFile = (e: any) => {
    const confirmed = deleteConfirmation ? window.confirm(`This action is irreversible. Do you wish to remove this ${fileType}?`) : true
    if (confirmed) {
      onRemoveFile()
    }
  }

  let acceptedFileTypeStr = Array.isArray(acceptedFileTypes) ? acceptedFileTypes.join(', ') : acceptedFileTypes
  if (!acceptedFileTypeStr.length && (fileType.toLowerCase() === 'image' || fileType.toLowerCase() === 'logo')) {
    acceptedFileTypeStr = 'image/png, image/jpeg'
  }

  if (previewImage) {
    const previewBackground = fileSrc ? 'file-uploader-input__preview--invisible' : ''
    return (
      <div>
        <h3 className={`${prefix}form__title`}>{title}</h3>
        <div className="file-uploader-input">
          { fileSrc && !viewOnly && deleteAllowed &&
            <Button type="button" className="file-uploader-input__remove" onClick={removeFile}>
              <Icon id="i-close" />
            </Button>
          }
          <div className={`file-uploader-input__preview ${previewBackground}`}>
            {fileSrc && typeof fileSrc === 'string' && (
              <img src={fileSrc} />
            )}
          </div>
          <input type="file" name={name} ref={fileRef}
            className="file-uploader-input__input"
            defaultValue=""
            accept={acceptedFileTypeStr}
            onChange={handleFileChange}
          />
          { viewOnly ? null : (
            <>
              <Span className="button button--filled button--small" classesToPrefix={['button']}>
                {`Select ${fileType}`}
              </Span>
              <span className="file-uploader-input__path">{filePath}</span>
            </>
          )}
        </div>
      </div>
    )
  } else { // behaves like form control with only path visible
    return (
      <div className={`${prefix}form__control`}>
        <label className={`${prefix}form__label`}>{title}</label>
        <div className={`${prefix}form__inner`}>
          <div className="grid" style={{margin: '0 0'}}>
            <div className="file-uploader-input">
              <input type="file" name={name} ref={fileRef}
                className="file-uploader-input__input"
                defaultValue=""
                accept={acceptedFileTypeStr}
                onChange={handleFileChange}
              />
              <Span className="button button--filled button--small" classesToPrefix={['button']}>
                {`Select ${fileType}`}
              </Span>
              { fileSrc &&
                <Button type="button" className="file-uploader-input__remove" onClick={removeFile}>
                  <Icon id="i-close" />
                </Button>
              }
            </div>
            {pathIsLink && filePath.includes('http') ? (
              <a href={filePath} target="_blank">{filePath.substr(filePath.lastIndexOf('/') + 1)}</a>
            ) : (
              <span className="file-uploader-input__path">{filePath}</span>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default FileUploader



