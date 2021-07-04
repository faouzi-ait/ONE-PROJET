import React from 'react'
import '@testing-library/jest-dom'
import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import {
  createTheme,
  getLastHistory,
  renderWithRouterAndStore,
} from 'javascript/utils/test-utils'
import makeServer from 'javascript/utils/test-utils/server'
import Register from './index'

let server
beforeEach(() => {
  server = makeServer()
})

afterEach(() => {
  server.shutdown()
})

const theme = createTheme({
  'features.territories.enabled': true,
  'features.users.genres': true,
  'features.users.country': true,
  'features.accountManager': true,
  'features.programmeTypes.preferences': true,
  'features.regions.enabled': true,
  'features.recaptcha.userRegistration.enabled': true,
  'features.users.registrations.password': true,
  'features.users.marketing.enabled': true,
  'features.users.marketing.copy': 'displayMarketingCopy',
  'variables.BuyerTypes': {
    buyer: 'Content buyer',
    producer: 'Producer',
    dvd: 'DVD',
    other: 'Other'
  },
})

jest.mock('javascript/components/async-search-resource')
jest.mock('javascript/components/country-select')
jest.mock('javascript/components/load-page-banner-image')
jest.mock('javascript/components/password-inputs')
jest.mock('javascript/components/re-captcha')

describe('Register Form', () => {

  describe('Should not render if user is logged in', () => {
    beforeEach(() => {
      renderWithRouterAndStore(<Register theme={theme} user={{ name: 'some user' }}/>, theme)
    })
    it('Should show "Oh no!" screen if logged in', () => {
      expect(screen.getByText(/Oh no!/)).toBeInTheDocument()
    })
  })

  describe('Should render loader whilst fetching data', () => {
    beforeEach(() => {
      renderWithRouterAndStore(<Register theme={theme} />, theme)
    })

    it('Rendered with a loading spinner', () => {
      expect(screen.getByTestId('loader')).toBeInTheDocument()
    })
  })

  describe('Should render all Form fields - (All features turned on)', () => {
    beforeEach(async () => {
      renderWithRouterAndStore(<Register theme={theme} />, theme, 'test')
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    })

    it('Register copy should be rendered as html from client variables', () => {
      expect(screen.getByTestId('register-copy')).toBeInTheDocument()
      expect(screen.getByText(/dangerous-html/)).toBeInTheDocument()
    })

    it('Title should exist', () => {
      expect(screen.getByRole('combobox', { name: 'title' })).toBeInTheDocument()
    })

    it('First name should exist', () => {
      expect(screen.getByRole('textbox', { name: 'first-name' })).toBeInTheDocument()
    })

    it('Last name should exist', () => {
      expect(screen.getByRole('textbox', { name: 'last-name' })).toBeInTheDocument()
    })

    it('Email address should exist', () => {
      expect(screen.getByRole('textbox', { name: 'email' })).toBeInTheDocument()
    })

    it('Job title should exist', () => {
      expect(screen.getByRole('textbox', { name: 'job-title' })).toBeInTheDocument()
    })

    it('Company name should exist', () => {
      expect(screen.getByRole('textbox', { name: 'company-name' })).toBeInTheDocument()
    })

    it('Country name should exist', () => {
      expect(screen.getByRole('combobox', { name: 'country-code' })).toBeInTheDocument()
    })

    it('Telephone number should exist', () => {
      expect(screen.getByRole('textbox', { name: 'telephone-number' })).toBeInTheDocument()
    })

    it('Genres should exist', () => {
      expect(screen.getByRole('combobox', { name: 'genres' })).toBeInTheDocument()
    })

    it('Account Manager should exist', () => {
      expect(screen.getByRole('combobox', { name: 'account-manager' })).toBeInTheDocument()
    })

    it('Territories should exist', () => {
      expect(screen.getByRole('combobox', { name: 'territories' })).toBeInTheDocument()
    })

    it('Buyer Type should exist', () => {
      expect(screen.getByRole('combobox', { name: 'buyer-type' })).toBeInTheDocument()
    })

    it('Policy Warning should exist', () => {
      expect(screen.getByText(/Privacy Policy/)).toBeInTheDocument()
      expect(screen.getByText(/Terms and Conditions of Use/)).toBeInTheDocument()
    })

    it('Contact Heading should exist', () => {
      expect(screen.getByText(/Contact details/)).toBeInTheDocument()
    })

    it('Programme Type should exist', () => {
      expect(screen.getByRole('combobox', { name: 'programme-types' })).toBeInTheDocument()
    })

    it('Regions should exist', () => {
      expect(screen.getByRole('combobox', { name: 'regions' })).toBeInTheDocument()
    })

    it('Marketing checkbox should exist', () => {
      expect(screen.getByText(/displayMarketingCopy/)).toBeInTheDocument()
    })

    it('Passwords should exist', () => {
      expect(screen.getByText(/Password/)).toBeInTheDocument()
      expect(screen.getByText(/Confirm password/)).toBeInTheDocument()
    })

    it('Should have a ReCaptcha widget in the page', () => {
      expect(screen.getByTestId('renderRecaptchaWidget')).toBeInTheDocument()
    })
  })

  describe('Should render Genres correctly', () => {
    beforeEach(async () => {
      server.create('genre', { id: 1, name: 'Action' })
      server.create('genre', { id: 2, name: 'Drama'})
      server.create('genre', { name: 'Adventure', parentId: 1})
      server.create('genre', { name: 'Medical', parentId: 2})
      server.create('genre', { name: 'Political', parentId: 2})
      renderWithRouterAndStore(<Register theme={theme} />, theme, 'test')
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    })

    it('Genres label should come from clientVariables', () => {
      expect(screen.getByText('GenreTestLabel')).toBeInTheDocument()
    })

    it('Genres select should contain correct genres', async () => {
      const genres = screen.getAllByRole('listitem', { name: 'genres' })
      const genreNames = genres.map((genre) => genre.textContent)
      expect(genreNames).toEqual([
        'Action',
        'Action - Adventure',
        'Drama',
        'Drama - Medical',
        'Drama - Political',
      ])
    })
  })

  describe('Should render Account Managers correctly', () => {
    beforeEach(async () => {
      server.create('user', { 'first-name': 'Vincent', 'last-name': 'Chase', 'choices-for': 'user-account-manager' })
      server.create('user', { 'first-name': 'Ari', 'last-name': 'Gold', 'choices-for': 'normal-user' })
      renderWithRouterAndStore(<Register theme={theme} />, theme, 'test')
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    })

    it('Account Manager options should contain all Account Managers', () => {
      const ams = screen.getAllByRole('option', { name: 'account-manager' })
      const amNames = ams.map((am) => am.textContent)
      expect(amNames).toEqual([
        'Please select',
        'I don\'t know ',
        'Vincent Chase'
      ])
    })
  })

  describe('Should render Buyer Types correctly', () => {
    beforeEach(async () => {
      renderWithRouterAndStore(<Register theme={theme} />, theme, 'test')
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    })

    it('Buyer Type label should come from client variables', () => {
      expect(screen.getByText(/BuyerTypeLabel/)).toBeInTheDocument()
    })

    it('Buyer Types should contain options provided by theme.variable.BuyerType', () => {
      const types = screen.getAllByRole('option', { name: 'buyer-type' })
      const buyerTypes = types.map((type) => type.textContent)
      expect(buyerTypes).toEqual([
        'Please select',
        'Content buyer',
        'Producer',
        'DVD',
        'Other'
      ])
    })

    it('Buyer Type \'Other\' text input should NOT be visible on load', () => {
      expect(screen.queryByRole('textbox', { name: 'buyer-type-other' })).toBeNull()
    })

    it('Buyer Type \'Other\' text input should be visible if \'Other\' is selected', async () => {
      await fireEvent.change(screen.getByRole('combobox', { name: 'buyer-type' }), {
        target: { value: 'other' }
      })
      expect(screen.getByRole('textbox', { name: 'buyer-type-other' })).toBeInTheDocument()
    })
  })

  describe('Should render Programme Types correctly', () => {
    beforeEach(async () => {
      server.create('programme-type', { name: 'Format' })
      server.create('programme-type', { name: 'Non-scripted' })
      server.create('programme-type', { name: 'Scripted' })
      renderWithRouterAndStore(<Register theme={theme} />, theme, 'test')
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    })

    it('Programme Types select should contain correct programme-types from API', () => {
      const types = screen.getAllByRole('listitem', { name: 'programme-types' })
      const programmeTypes = types.map((type) => type.textContent)
      expect(programmeTypes).toEqual([
        'Format',
        'Non-scripted',
        'Scripted'
      ])
    })
  })

  describe('Submit Empty Form', () => {
    beforeEach(async () => {
      renderWithRouterAndStore(<Register theme={theme} />, theme, 'test')
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
      await fireEvent.click(screen.getByText('register-button'))
    })

    it('Form should not submit - required fields', () => {
      expect(screen.getByText(/Please select a title/)).toBeInTheDocument()
      expect(screen.getByText(/Please enter your first name/)).toBeInTheDocument()
      expect(screen.getByText(/Please enter your last name/)).toBeInTheDocument()
      expect(screen.getByText(/Please enter your email/)).toBeInTheDocument()
      expect(screen.getByText(/Please enter your job title/)).toBeInTheDocument()
      expect(screen.getByText(/Please enter your company name/)).toBeInTheDocument()
      expect(screen.getByText(/Please select your location/)).toBeInTheDocument()
      expect(screen.getByText(/Please enter your telephone number/)).toBeInTheDocument()
      expect(screen.getByText(/Please select an account manager/)).toBeInTheDocument()
      expect(screen.getByText(/Please select territories/)).toBeInTheDocument()
      expect(screen.getByText(/BuyerTypeWarning/)).toBeInTheDocument()
      expect(screen.getByText(/Please select regions/)).toBeInTheDocument()
      expect(screen.getByText(/Must specify a valid password/)).toBeInTheDocument()
    })

    it('Should NOT have a loading spinner on register button', () => {
      expect(screen.getByText('register-button')).not.toHaveClass('button--loading')
    })
  })

  describe('Submit Form with sufficient data', () => {
    const historyMock = { push: jest.fn() }
    const defaultApiResponse = {
      marketing: false,
      title: 'Miss',
      'first-name': 'Virginia',
      'last-name': 'Potts',
      email: 'pepper.potts@stark.ind',
      'job-title': 'ceo',
      'company-name': 'Stark Industries',
      'country-code': 'SZ',
      'telephone-number': '310 555 9327',
      'account-manager': '5',
      territories: [{ id: 12, name: 'USA' }, {id: 11, name: 'Canada' }],
      'buyer-type': 'producer',
      regions: [{ id: 13, name: 'New York' }],
      password: 'passCode1',
      'password-confirmation': 'passCode1'
    }

    beforeEach(async () => {
      server.create('user', { id: '5', 'first-name': 'Tony', 'last-name': 'Stark', 'choices-for': 'user-account-manager' })
      server.create('territory', { id: '11', name: 'Canada' })
      server.create('territory', { id: '12', name: 'USA' })
      server.create('region', { id: '13', name: 'New York' })
      renderWithRouterAndStore(<Register theme={theme} history={historyMock} />, theme, 'test')
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
      await fireEvent.change(screen.getByRole('combobox', { name: 'title' }), {  target: { value: 'Miss' } })
      await fireEvent.change(screen.getByRole('textbox', { name: 'first-name' }), {  target: { value: 'Virginia' } })
      await fireEvent.change(screen.getByRole('textbox', { name: 'last-name' }), {  target: { value: 'Potts' } })
      await fireEvent.change(screen.getByRole('textbox', { name: 'email' }), {  target: { value: 'pepper.potts@stark.ind' } })
      await fireEvent.change(screen.getByRole('textbox', { name: 'job-title' }), {  target: { value: 'ceo' } })
      await fireEvent.change(screen.getByRole('textbox', { name: 'company-name' }), {  target: { value: 'Stark Industries' } })
      await fireEvent.change(screen.getByRole('combobox', { name: 'country-code' }), {  target: { value: 'SZ' } })
      await fireEvent.change(screen.getByRole('textbox', { name: 'telephone-number' }), {  target: { value: '310 555 9327' } })
      await fireEvent.change(screen.getByRole('combobox', { name: 'account-manager' }), {  target: { value: 5 }})
      await fireEvent.change(screen.getByRole('combobox', { name: 'territories' }), { target: { data: [{ id: 12, name: 'USA' }, {id: 11, name: 'Canada' }] }})
      await fireEvent.change(screen.getByRole('combobox', { name: 'buyer-type' }), {  target: { value: 'producer' } })
      await fireEvent.change(screen.getByRole('combobox', { name: 'regions' }), { target: { data: [{ id: 13, name: 'New York' }] }})
      await fireEvent.change(screen.getByTestId('mockPasswordComponent'), {  target: { value: 'passCode1' } })
    })

    it('Should have a loading spinner on register button', async () => {
      await fireEvent.click(screen.getByText('register-button'))
      expect(screen.getByText('register-button')).toHaveClass('button--loading')
    })

    it('Should get a successful response from api', async () => {
      await fireEvent.click(screen.getByText('register-button'))
      await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
      expect(getLastHistory(historyMock).pathname).toEqual('/registration-successful')
      expect(getLastHistory(historyMock).state).toEqual(defaultApiResponse)
    })

    it('Should get a successful response from api (marketing: true)', async () => {
      await fireEvent.click(screen.getByRole('checkbox', { name: 'marketing'}))
      await fireEvent.click(screen.getByText('register-button'))
      await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
      expect(getLastHistory(historyMock).pathname).toEqual('/registration-successful')
      expect(getLastHistory(historyMock).state).toEqual({
        ...defaultApiResponse,
        marketing: true
      })
    })
  })

  describe('Should NOT render feature controlled Form fields - (features turned off)', () => {
    const themeFeaturesOff = createTheme({
      'features.territories.enabled': false,
      'features.users.genres': false,
      'features.users.country': false,
      'features.accountManager': false,
      'features.programmeTypes.preferences': false,
      'features.regions.enabled': false,
      'features.users.registrations.password': false,
      'features.recaptcha.userRegistration.enabled': false,
      'variables.BuyerTypes': {
        buyer: 'Content buyer',
        producer: 'Producer',
        dvd: 'DVD',
        other: 'Other'
      },
    })

    beforeEach(async () => {
      renderWithRouterAndStore(<Register theme={themeFeaturesOff} />, themeFeaturesOff, 'test')
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    })

    it('Country name should NOT exist', () => {
      expect(screen.queryByRole('combobox', { name: 'country-code'  })).toBeNull()
    })

    it('Genres should NOT exist', () => {
      expect(screen.queryByRole('combobox', { name: 'genres' })).toBeNull()
    })

    it('Account Manager should NOT exist', () => {
      expect(screen.queryByRole('combobox', { name: 'account-manager' })).toBeNull()
    })

    it('Territories should NOT exist', () => {
      expect(screen.queryByRole('combobox', { name: 'territories' })).toBeNull()
    })

    it('Programme Type should NOT exist', () => {
      expect(screen.queryByRole('combobox', { name: 'programme-types' })).toBeNull()
    })

    it('Marketing checkbox should NOT exist', () => {
      expect(screen.queryByText(/displayMarketingCopy/)).toBeNull()
    })

    it('Regions should NOT exist', () => {
      expect(screen.queryByRole('combobox', { name: 'regions' })).toBeNull()
    })

    it('Passwords should NOT exist', () => {
      expect(screen.queryByText(/Password/)).toBeNull()
      expect(screen.queryByText(/Confirm password/)).toBeNull()
    })

    it('Should NOT have a ReCaptcha widget in the page', () => {
      expect(screen.queryByTestId('renderRecaptchaWidget')).toBeNull()
    })
  })
})
