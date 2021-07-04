import axios from 'axios'
import Evaporate from 'evaporate'
import moment from 'moment'

import { deleteOneByModel } from 'javascript/utils/apiMethods'
import apiConfig, { injectApiAuthHeaders } from 'javascript/config'

import {
  md5,
  sha256,
  signWithAWSV4,
} from 'javascript/utils/helper-functions/crypto'

import {
  VideoType,
} from 'javascript/types/ModelTypes'

type OnProgressHandler = (params: {
  percentComplete: number
  secondsLeft: number
  fileSize: number
  remainingSize: number
  video?: Partial<VideoType & { 'brightcove-video-file': any, 'file': any }>
}) => void

const parentTypeMap = {
  episodes: 'Episode',
  series: 'Series',
  programmes: 'Programme',
}

interface VideoUploadsResponse {
  id: number
  account_id: string
  video_id: string
  bucket: string
  aws_access_key_id: string
  session_token: string
  object_key: string
  service: string
  upload_secret_key: string
  region: string
}

const useBrightcoveUploader = async(
  video: Partial<VideoType & { 'brightcove-video-file': any, 'file': any }>,
  onProgress: OnProgressHandler,
  theme,
  /**
   * Store a cancel function that can be called
   * asynchronously from the parent that began the upload
   */
  setCancelFunction: (fn: () => Promise<void>) => void,
): Promise<{ completed: boolean, data?: VideoUploadsResponse }> => {

  const attributes = {
    external_id: video['external-id'],
    parent_id: (video.parent as any).id,
    parent_type: parentTypeMap[(video.parent as any).type],
    provider: 'brightcove',
    restricted: video.restricted,
    public_video: video['public-video'],
    name: video.name,
  }
  if(theme.features.videos.languages) {
    attributes['language_ids'] = video.languages && video.languages.map(l => l.id)
  }

  const response: {data: VideoUploadsResponse} = (await axios({
    url: `${apiConfig.apiUrl}/video_uploads`,
    method: 'POST',
    headers: {
      ...injectApiAuthHeaders(),
      'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key'],
    },
    data: attributes,
  })) as any

  const data = response.data

  const evaporate = await Evaporate.create({
    bucket: data.bucket,
    awsRegion: data.region,
    aws_key: data.aws_access_key_id,
    awsSignatureVersion: '4',
    computeContentMd5: true,
    cryptoMd5Method: md5,
    cryptoHexEncodedHash256: sha256,
    // signHeaders: {
    //   Authorization: 'Bearer ' + token,
    //   'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key'],
    // },
    customAuthMethod: (
      signParams,
      signHeaders,
      stringToSign,
      signatureDateTime,
      canonicalRequest,
    ) => {
      const signature = signWithAWSV4({
        awsRegion: data.region,
        awsSecretKey: data.upload_secret_key,
        awsService: data.service,
        timestamp: moment().format('YYYYMMDD'),
        toSign: decodeURIComponent(stringToSign),
      })
      return Promise.resolve(signature)
    },
    sendCanonicalRequestToSignerUrl: true,
    partSize: 6 * 1024 * 1024,
    logging: process.env.NODE_ENV === 'development',
  })

  const result: { completed: boolean, data?: VideoUploadsResponse } = await new Promise(
    (resolve, reject) => {
      const cancelFunction = async () => {
        await evaporate.cancel(`${data.bucket}/${data.object_key}`)
        await deleteOneByModel('video', Number(data.id))
        resolve({ completed: false })
      }
      setCancelFunction && setCancelFunction(cancelFunction)
      evaporate.add({
        name: data.object_key,
        file: video['brightcove-video-file'] || video.file,
        progress: (
          percentComplete,
          { secondsLeft, fileSize, remainingSize },
        ) => {
          onProgress({
            percentComplete: percentComplete,
            fileSize,
            remainingSize,
            secondsLeft,
            video
          })
        },
        complete: (...args) => {
          resolve({ 
            completed: true,
            data
           })
        },
        error: message => {
          reject(message)
        },
        xAmzHeadersAtInitiate: {
          'X-Amz-Security-Token': data.session_token,
        },
        xAmzHeadersCommon: {
          'X-Amz-Security-Token': data.session_token,
        },
      })
    },
  )

  if (!result.completed) {
    return { completed: false }
  }

  await axios({
    method: 'POST',
    url: `${apiConfig.apiUrl}/video_uploads/${data.id}/complete`,
    headers: {
      ...injectApiAuthHeaders(),
      'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key'],
    },
  })

  return { completed: true, data  }
}

export default useBrightcoveUploader