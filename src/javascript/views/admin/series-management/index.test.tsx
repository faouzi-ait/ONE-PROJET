import React from 'react'
import '@testing-library/jest-dom'
import pluralize from 'pluralize'
import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import {
  createTheme,
  renderWithRouterAndStore,
  renderWithRouterStoreAndModal
} from 'javascript/utils/test-utils'
import makeServer from 'javascript/utils/test-utils/server'
import SeriesManagement from '.'
import { withRouter } from 'react-router-dom'


const SeriesManagementIndex = withRouter(SeriesManagement)

let server
beforeEach(() => {
  server = makeServer()
})

afterEach(() => {
  server.shutdown()
})

const theme = createTheme({
  'localisation.series.upper': '__seriesLocalisation__',
  'localisation.series.lower': '__serieslocalisation__'
})

const componentProps = {
  theme,
  location: { search: '' }
}

const createSeriesButtonText = 'New __seriesLocalisation__'
const noSeriesVisibleMessage = `There are currently no ${pluralize('__serieslocalisation__')} to display. Try changing your filter criteria.`

describe('Series Management - loading with no list items', () => {
  beforeEach(() => {
    renderWithRouterAndStore(<SeriesManagementIndex {...componentProps} />, theme)
  })
  it('Should render with a loading spinner', () => {
    expect(screen.getByTestId('loader')).toBeInTheDocument()
  })
  it('Should render with title', () => {
    expect(screen.getByText(`Manage ${pluralize('__seriesLocalisation__')}`)).toBeInTheDocument()
  })
  it('Should render with a "new button"', () => {
    expect(screen.getByText(createSeriesButtonText)).toBeInTheDocument()
  })
  it('Should render with a `No Series` message', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    expect(screen.getByText(noSeriesVisibleMessage)).toBeInTheDocument()
  })
})

// jest.mock('react-autosuggest', () => () => (<div>Hello 678967589365784936748392657849326578926478932568 World</div>))


describe('Series Management - adding a new Series', () => {
  beforeEach(async () => {
    renderWithRouterStoreAndModal(<SeriesManagementIndex {...componentProps} />, theme)
    await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    await fireEvent.click(screen.getAllByRole('button', { name: createSeriesButtonText })[0])
    server.create("programme", { title: "Series Test Programme" })
  })

  it('Should open a modal when clicking "new button"', () => {
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('Should create a new season when submitting modal', async () => {


    // there are no series to begin with
    expect(screen.getByText(noSeriesVisibleMessage)).toBeInTheDocument()

    // await fireEvent.change(screen.getByRole('textbox', { name: /programme-autosuggest/i }), {
    //   target: { value: 'Series' }
    // })


    // expect(await screen.findByText('Series Test Programme')).toBeInTheDocument()

    // screen.getByRole('')
    // screen.debug()

    await fireEvent.change(screen.getByRole('textbox', { name: /name/i }), {
      target: { value: 'Test Create Series' }
    })


    // await fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0])

  //   // ensure we have 2 rows in the table (heading + 1 data row)
  //   const tableRows = await screen.findAllByRole('row')
  //   expect(tableRows).toHaveLength(2)

    // ensure we have a row that includes the Video Type: 'Narrated'

  //   // ensure the modal has been closed
  //   expect(screen.queryByTestId('modal')).toBeNull()
  })
})

