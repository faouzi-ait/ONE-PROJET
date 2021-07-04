import React from 'react'
import '@testing-library/jest-dom'

import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'

import makeServer from 'javascript/utils/test-utils/server'
import LoadPageBannerImage from './index'

let server
beforeEach(() => {
  server = makeServer()
})

afterEach(() => {
  server.shutdown()
})

describe('LoadPageBannerImage Component', () => {
  beforeEach(async () => {
    server.create('page', { slug: 'test-banner', 'banner-urls': 'test-banner-found' })
  })
  describe('Should render children with Banner Image from API', () => {
    beforeEach(async () => {
      render(
        <LoadPageBannerImage slug='test-banner' fallbackBannerImage={'fallback-image'}>
          {({ image }) => (
            <>
              {image}
            </>
          )}
        </LoadPageBannerImage>
      )
      await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
    })
    it('Image should be that from API', () => {
      expect(screen.getByText('test-banner-found')).toBeInTheDocument()
    })
  })

  describe('Should render children with Fallback Image when API image does not exist', () => {
    beforeEach(async () => {
      render(
        <LoadPageBannerImage slug='no-banner' fallbackBannerImage={'fallback-image'}>
          {({ image }) => (
            <>
              {image}
            </>
          )}
        </LoadPageBannerImage>
      )
      await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
    })
    it('Image should be Fallback Image', () => {
      expect(screen.getByText('fallback-image')).toBeInTheDocument()
    })
  })

  describe('Should render children with NO_CUSTOM_BANNER when API image & fallback images do not exist', () => {
    beforeEach(async () => {
      render(
        <LoadPageBannerImage slug='no-banner'>
          {({ image }) => (
            <>
              {image}
            </>
          )}
        </LoadPageBannerImage>
      )
      await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
    })
    it('Image should be NO_CUSTOM_BANNER', () => {
      expect(screen.getByText('NO_CUSTOM_BANNER')).toBeInTheDocument()
    })
  })

})