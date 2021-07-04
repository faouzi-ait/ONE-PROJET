import { useState, useEffect } from 'react'
import axios from 'axios'
import pluralize from 'pluralize'

import useResource from 'javascript/utils/hooks/use-resource'

interface Props {
  relatedResourceType: string
  id: string
  renderUI: (injectedProps: any) => any
  selectedImages: any[]
}

const RelatedResourceFileManager: React.FC<Props> = ({
  id: relatedResourceId,
  relatedResourceType,
  renderUI,
  ...restProps
}) => {
  const relatedResource = useResource(relatedResourceType)
  const pageImageResource = useResource('page-image')
  const [confirmation, setConfirmation] = useState({ modal: () => {} })
  const [deleting, setDeleting] = useState(false)
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [selectedImages, setSelectedImages] = useState(restProps.selectedImages || [])
  const [uploadError, setUploadError] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    refreshImages()
  }, [])

  const refreshImages = () => {
    relatedResource.findOne(relatedResourceId, {
      include: 'page-images',
      fields: {
        [pluralize(relatedResourceType)]: 'page-images',
        'page-images': 'file,filename'
      }
    }).then((response) => {
      setUploading(false)
      setIsLoading(false)
      setDeleting(false)
      setImages(response['page-images'] || [])
    })
  }

  const uploadFiles = (files) => {
    setUploading(true)
    setUploadError(null)
    const jsonApi = pageImageResource.useApi()
    const count = files.length
    const errors = []
    const progress = []
    let uploaded = 0
    files.map((currentFile, i) => {

      const file: any = new Blob([currentFile], {type: currentFile.type})
      file.name = currentFile.name.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '')
      const now = Date.now()
      file.lastModifiedDate = new Date(now)
      file.lastModified = now
      progress.push(0)
      axios({
        url: `${jsonApi.apiUrl}/${relatedResourceType}/${relatedResourceId}/page-images`,
        method: 'POST',
        headers: {
          ...jsonApi.headers,
          'Content-Type': `image/${file.name.split('.').pop().toLowerCase()}`,
          'X-Content-Length': file.size,
          'X-File-Name': file.name,
          'X-Image-Type': 'image'
        },
        data: file,
        onUploadProgress: (e) => {
          progress[i] = (e.loaded / e.total) * 100
          const percent = Math.floor(progress.reduce((a, b) => a + b, 0) / count)
          setProgress(percent)
        }
      }).then(() => {
        uploaded++
        if (uploaded === count) {
          refreshImages()
        }
      }).catch((error) => {
        errors.push(error.response.data)
        if (errors.length + uploaded === count) {
          setUploadError('Files were rejected, please ensure you are uploading images and they are smaller than 500Mb ')
        }
      })
    })
  }

  const deleteFile = (id) => {
    setSelectedImages((selectedImages) => selectedImages.filter(img => img !== id))
    setDeleting(true)
    pageImageResource.deleteResource({id}).then((response) => {
      refreshImages()
    })
  }

  const injectedProps = {
    confirmation: confirmation.modal,
    deleteFile,
    deleting,
    images,
    isLoading,
    progress,
    selectedImages,
    setConfirmation: (confirmation) => setConfirmation({ modal: confirmation }),
    setSelectedImages,
    setUploadError,
    uploadError,
    uploadFiles,
    uploading,
  }
  return renderUI(injectedProps)
}

export default RelatedResourceFileManager
