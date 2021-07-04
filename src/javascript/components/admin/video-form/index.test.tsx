import React from 'react'
import '@testing-library/jest-dom'
import {
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import {
  createTheme,
  renderWithRouterAndStore
} from 'javascript/utils/test-utils'
import makeServer from 'javascript/utils/test-utils/server'
import VideoForm from './'

let server
beforeEach(() => {
  server = makeServer()
})

afterEach(() => {
  server.shutdown()
})

const parentResource = {
  title: "This is my parent Programme",
}

const videoTypeResource = {
  // id: 3,
  name: "Format",
}

const videoResource = {
  'brightcove-id': '',
  'downloadable': false,
  'knox-uuid': '',
  'mp4-url': 'my_mp4_url',
  'restricted': false,
  'public-video': true,
  'wistia-id': '',
  'name': 'My Test mp4 Video',
  'languages' : [],
  'external-id': '',
  'jwplayer-id': '',
  'visibility': 'admin',
}

describe('Video Form - Should hide video-type based on features.videos.types', () => {
  beforeEach(async () => {
    const onSave = jest.fn()
    const theme = createTheme({
      'features.videos.types': false,
      'localisation.video.upper': '__videoLocalisation__'
    })
    renderWithRouterAndStore(<VideoForm onSave={onSave} resource={videoResource} />, theme)
    await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
  })

  it('Should not display Video Type selection if feature is turned off', () => {
    expect(screen.queryByTestId('video-type-select')).toBeNull()
  })
})

describe('Video Form - Should hide video-type if there are no video Types', () => {
  beforeEach(async () => {
    const onSave = jest.fn()
    const theme = createTheme({
      'features.videos.types': true,
      'localisation.video.upper': '__videoLocalisation__'
    })
    renderWithRouterAndStore(<VideoForm onSave={onSave} resource={videoResource} />, theme)
    await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
  })

  it('Should not display Video Type selection if there are no video types present', () => {
    expect(screen.queryByTestId('video-type-select')).toBeNull()
  })
})

describe('Video Form - Should show video-type if there are video Types', () => {
  beforeEach(async () => {
    const onSave = jest.fn()
    const prevtheme = createTheme({
      'features.videos.types': false,
      'localisation.video.upper': '__videoLocalisation__'
    })
    renderWithRouterAndStore(<VideoForm onSave={onSave} resource={videoResource} />, prevtheme)
    await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
    const theme = createTheme({
      'features.videos.types': true,
      'localisation.video.upper': '__videoLocalisation__'
    })
    server.create("video-type", { name: "Non-Scripted" })
    renderWithRouterAndStore(<VideoForm onSave={onSave} resource={videoResource} />, theme)
    await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
  })

  it('Should display Video Type selection if there are video types present', () => {
    expect(screen.queryByTestId('video-type-select')).toBeInTheDocument()
  })
})

describe('Video Form - ', () => {
  beforeEach(() => {
    const onSave = jest.fn()
    const theme = createTheme({
      'features.videos.types': true,
      'localisation.video.upper': '__videoLocalisation__'
    })
    const video = server.create('video', {
      ...videoResource,
      'videoType': server.create('video-type', {...videoTypeResource}),
      'parent': server.create('programme', {...parentResource})
    })
    videoResource['parent'] = {
      ...parentResource,
      ...video.attrs.parentId
    }
    videoResource['video-type'] = {
      ...videoTypeResource,
      id: video.attrs.videoTypeId,
      type: 'video-types'
    }
    renderWithRouterAndStore(<VideoForm resource={videoResource} onSave={onSave} />, theme)
  })
  it('form should render - with a database like nested object', () => {
    expect(false).toBeFalsy()
  })
})