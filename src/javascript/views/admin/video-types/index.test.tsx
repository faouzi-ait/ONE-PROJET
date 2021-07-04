import React from 'react'
import '@testing-library/jest-dom'
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
import VideoTypesIndex from './'

let server
beforeEach(() => {
  server = makeServer()
})

afterEach(() => {
  server.shutdown()
})

const theme = createTheme({
  'features.videos.types': true,
  'localisation.video.upper': '__videoLocalisation__'
})

describe('Video Types - loading with no list items', () => {
  beforeEach(() => {
    renderWithRouterAndStore(<VideoTypesIndex theme={theme} />, theme)
  })

  it('Should render with a loading spinner', () => {
    expect(screen.getByTestId('loader')).toBeInTheDocument()
  })
  it('Should render with title', () => {
    expect(screen.getByText('Manage __videoLocalisation__ Types')).toBeInTheDocument()
  })
  it('Should render with a "new button"', () => {
    expect(screen.getByText('New __videoLocalisation__ Type')).toBeInTheDocument()
  })
  it('Should render with a `No Video Types` message', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    expect(screen.getByText('There are currently no __videoLocalisation__ Types, try creating some!')).toBeInTheDocument()
  })
})

describe('Video Types - adding a new video type', () => {
  beforeEach(async () => {
    renderWithRouterStoreAndModal(<VideoTypesIndex theme={theme} />, theme)
    await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    await fireEvent.click(screen.getAllByRole('button', { name: 'New __videoLocalisation__ Type' })[0])
  })

  it('Should open a modal when clicking "new button"', () => {
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('Should create a new video type when submitting modal', async () => {

    // there are no video types to begin with
    expect(screen.getByText(`There are currently no __videoLocalisation__ Types, try creating some!`)).toBeInTheDocument()

    await fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Narrated' }
    })
    await fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0])

    // ensure we have 2 rows in the table (heading + 1 data row)
    const tableRows = await screen.findAllByRole('row')
    expect(tableRows).toHaveLength(2)

    // ensure we have a row that includes the Video Type: 'Narrated'
    expect(screen.getByText('Narrated')).toBeTruthy()

    // ensure the modal has been closed
    expect(screen.queryByTestId('modal')).toBeNull()
  })
})

describe('Video Types - loading with list items', () => {
  beforeEach(() => {
    server.create("video-type", { name: "Non-Scripted" })
    server.create("video-type", { name: "Scripted" })
    server.create("video-type", { name: "Format" })
    renderWithRouterAndStore(<VideoTypesIndex theme={theme} />, theme)
  })

  it('Should render with a loading spinner', () => {
    expect(screen.getByTestId('loader')).toBeInTheDocument()
  })

  it('Should remove loading spinner after fetching Video Types', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
  })

  it('Should render with 3 video type items', async () => {

    // Format must exist
    expect(await screen.findByText('Format')).toBeTruthy()

    // Scripted must exist
    expect(await screen.findByText('Scripted')).toBeTruthy()

    // Non Scripted must exist
    expect(await screen.findByText('Non-Scripted')).toBeTruthy()

    // ensure we have 4 rows in the table (heading + 3 data rows)
    const tableRows = await screen.findAllByRole('row')
    expect(tableRows).toHaveLength(4)
  })
})


describe('Video Types - Editing a Video Type', () => {
  beforeEach(async () => {
    server.create("video-type", { name: "Format" })
    renderWithRouterStoreAndModal(<VideoTypesIndex theme={theme} />, theme)
    await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    await fireEvent.click(screen.getByText('Edit'))
  })

  it('Should open a modal when editing a video type', async () => {
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('Should update Video Type name when editing', async () => {
    // ensure we have a row that includes the Video Type: 'Format'
    expect(await screen.findByText('Format')).toBeTruthy()

    await fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Narrated' }
    })
    await fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0])

    // ensure we have a row that includes the Video Type: 'Narrated'
    expect(await screen.findByText('Narrated')).toBeTruthy()

    // ensure we still have only 2 rows in the table (heading + 1 data row)
    const tableRows = await screen.findAllByRole('row')
    expect(tableRows).toHaveLength(2)

    // ensure the modal has been closed
    expect(screen.queryByTestId('modal')).toBeNull()
  })
})

describe('Video Types - Deleting a Video Type', () => {
  beforeEach(async () => {
    server.create("video-type", { name: "Format", 'videos-count': 0 })
    server.create("video-type", { name: "Scripted", 'videos-count': 1 })
    renderWithRouterStoreAndModal(<VideoTypesIndex theme={theme} />, theme)
    await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
  })

  it('Should delete a Video Type if it has no associated Videos', async () => {
    // ensure we have 3 rows in the table (heading + 2 data rows)
    let tableRows = await screen.findAllByRole('row')
    expect(tableRows).toHaveLength(3)

    const allDeleteButtons = screen.getAllByText('Delete')

    await fireEvent.click(allDeleteButtons[0])

    await waitForElementToBeRemoved(() => screen.getByText('Format'))
    // ensure we have 2 rows in the table (heading + 1 data row)
    tableRows = await screen.findAllByRole('row')
    expect(tableRows).toHaveLength(2)

    // ensure scripted still exists
    expect(await screen.findByText('Scripted')).toBeTruthy()
  })

  it('Should prompt the user to delete a Video Type if it has any associated Videos', async () => {
    // ensure we have 3 rows in the table (heading + 2 data rows)
    let tableRows = await screen.findAllByRole('row')
    expect(tableRows).toHaveLength(3)

    const allDeleteButtons = screen.getAllByText('Delete')
    await fireEvent.click(allDeleteButtons[1])

    // ensure it has opened a modal
    expect(screen.getByTestId('modal')).toBeInTheDocument()

    await fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])
    await waitForElementToBeRemoved(() => screen.getByTestId('modal'))

    // ensure we have 2 rows in the table (heading + 1 data row)
    tableRows = await screen.findAllByRole('row')
    expect(tableRows).toHaveLength(2)

    // ensure format still exists
    expect(await screen.findByText('Format')).toBeTruthy()

    // ensure the modal has been closed
    expect(screen.queryByTestId('modal')).toBeNull()
  })
})
