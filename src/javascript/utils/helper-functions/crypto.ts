import crypto from 'crypto-browserify'
import { Buffer } from 'safe-buffer'
import createHmac from './createHmac'

export function md5(data) {
  return _hash('md5', data, 'base64')
}

export function sha256(data) {
  return _hash('sha256', data, 'hex')
}

function _hash(algorithm, data, digest) {
  var hash = crypto.createHash(algorithm)

  if (typeof data === 'string') {
    data = new Buffer(data)
  }
  var isBuffer = Buffer.isBuffer(data)

  //Identifying objects with an ArrayBuffer as buffers
  if (
    typeof ArrayBuffer !== 'undefined' &&
    data &&
    data.buffer instanceof ArrayBuffer
  ) {
    isBuffer = true
  }

  if (typeof data === 'object' && !isBuffer) {
    data = new Buffer(new Uint8Array(data))
  }

  return hash.update(data).digest(digest)
}

export function signWithAWSV4({
  toSign,
  timestamp,
  awsRegion,
  awsSecretKey,
  awsService,
}: {
  toSign: any
  timestamp: string
  awsSecretKey: string
  awsRegion: string
  awsService: string
}) {
  const date = hmac('AWS4' + awsSecretKey, timestamp)
  const region = hmac(date, awsRegion)
  const service = hmac(region, awsService)
  const signing = hmac(service, 'aws4_request')
  return hexhmac(signing, toSign)
}

function hmac(key, value) {
  return (createHmac('sha256', key) as any).update(value).digest()
}

function hexhmac(key, value) {
  return (createHmac('sha256', key) as any).update(value).digest('hex')
}
