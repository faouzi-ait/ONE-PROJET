import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import Meta from 'react-document-meta'
import { RouteComponentProps } from 'react-router-dom'
import {
  DescriptorText,
  Divider,
  ProgrammeCategoriesTitle,
  ProgrammeCategoriesWrapper,
  RadioOptions,
  RadioLabel
} from './styled-components'

import 'stylesheets/admin/components/programme-highlights.sass'

import { deleteOneByModel, updateOneByModel } from 'javascript/utils/apiMethods'
import CategoryStore from 'javascript/stores/programme-highlight-categories'
import compose from 'javascript/utils/compose'
import HighlightsStore from 'javascript/stores/programme-highlights'
import useApiQueue from 'javascript/utils/hooks/use-api-queue'
import useProgrammeHighlightsState from './useProgrammeHighlightsState'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'
import withModalRenderer, { WithModalType } from 'javascript/components/hoc/with-modal-renderer'
import useResource from 'javascript/utils/hooks/use-resource'
// Components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import { ReorderableList } from 'javascript/components/reorderable-list'
import Button from 'javascript/components/button'
import CategoriesDragAndDropArea from './categories-drag-and-drop-area'
import CategoryForm from './category-form'
import DeleteCategoryForm from './delete-category-form'
import DeleteForm from './delete'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'
import PageHeader from 'javascript/components/admin/layout/page-header'
import PageLayoutPicker from './page-layout-picker'
import PageLoader from 'javascript/components/page-loader'
import ProgrammesForm from 'javascript/views/admin/programme-highlights/form'
import SharedIcon from 'javascript/components/shared-icon'
import Checkbox from 'javascript/components/custom-checkbox'
import NavLink from 'javascript/components/nav-link'

// Types
import {
  ProgrammeHighlightCategoryType,
  ProgrammeHighlightPageType,
  ProgrammeHighlightType,
} from 'javascript/types/ModelTypes'
import { WithThemeType } from 'javascript/utils/theme/withTheme'

interface MatchParams {
  highlightPageId: string | undefined
}

interface Props extends RouteComponentProps<MatchParams>, WithThemeType, WithModalType {}

const ProgrammeHighlightsIndex: React.FC<Props> = ({
  theme,
  match,
  modalState
}) => {
  const { highlightPageId } = match.params
  const { categories, errored, loaded, highlights, pages, currentHighlightPage, highlightPagesResource, fetchResources } = useLogic(highlightPageId)
  const [layoutSelected, selectLayout] = useState<ProgrammeHighlightsLayout>('grid-view')
  const [initialLayoutSelected, setInitialLayoutSelected] = useState<ProgrammeHighlightsLayout>('grid-view')
  const [subpageDisplay, setSubpageDisplay] = useState(false)

  useWatchForTruthy(loaded, () => {
    const layout =
      categories.length > 0 ? 'carousel-with-collections' : 'grid-view'
    selectLayout(layout)
    setInitialLayoutSelected(layout)
  })

  const [
    shouldShowSaveAndCancelButtons,
    setShouldShowSaveAndCancelButtons,
  ] = useState(false)

  const { addToQueue, status: apiQueueStatus } = useApiQueue()

  useWatchForTruthy(apiQueueStatus === 'fulfilled', () => {
    fetchResources()
  })

  useEffect(() => {
    if(currentHighlightPage){
      setSubpageDisplay(currentHighlightPage?.['display-subpages-as-carousel'])
    }
  }, [currentHighlightPage])

  const handleSave = () => {
    if (layoutSelected === initialLayoutSelected) {
      return
    }

    if (layoutSelected === 'grid-view') {
      categories.forEach(category => {
        addToQueue(() =>
          deleteOneByModel('programme-highlight-category', category.id),
        )
      })
      setInitialLayoutSelected('grid-view')
    } else if (layoutSelected === 'carousel-with-collections') {
      setInitialLayoutSelected('carousel-with-collections')
    }
    setShouldShowSaveAndCancelButtons(false)
  }

  const getResources = () => {
    modalState.hideModal()
    fetchResources()
  }

  const addProgramme = () => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title={`Add ${theme.localisation.programme.upper}`}
          modifiers={['stretch-select']}
        >
          <div className="cms-modal__content">
            <ProgrammesForm closeEvent={getResources} highlightPageId={highlightPageId} />
          </div>
        </Modal>
      )
    })
  }

  const addCategoryProgramme = category => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title={`Add ${theme.localisation.programme.upper} to "${category.name}"`}
          modifiers={['stretch-select']}
        >
          <div className="cms-modal__content">
            <ProgrammesForm closeEvent={getResources} category={category} highlightPageId={highlightPageId} />
          </div>
        </Modal>
      )
    })
  }

  const createCategory = () => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title={`New ${theme.localisation.highlightCategory.upper}`}
          modifiers={['stretch-select']}
        >
          <div className="cms-modal__content">
            <CategoryForm closeEvent={getResources} highlightPageId={highlightPageId} />
          </div>
        </Modal>
      )
    })
  }

  const deleteResource = highlight => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title="Warning"
          modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}
        >
          <div className="cms-modal__content">
            <DeleteForm highlight={highlight} closeEvent={getResources} />
          </div>
        </Modal>
      )
    })
  }

  const deleteCategory = category => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title="Warning"
          modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}
        >
          <div className="cms-modal__content">
            <DeleteCategoryForm
              category={category}
              closeEvent={getResources}
            />
          </div>
        </Modal>
      )
    })
  }

  const editCategory = category => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title={`New ${theme.localisation.highlightCategory.upper}`}
          modifiers={['stretch-select']}
        >
          <div className="cms-modal__content">
            <CategoryForm category={category} closeEvent={getResources} highlightPageId={highlightPageId} />
          </div>
        </Modal>
      )
    })
  }

  const updateSubPageDisplay = (e) => {
    const update = {
      id: highlightPageId,
      'display-subpages-as-carousel': !subpageDisplay
    }
    setSubpageDisplay(!subpageDisplay)
    highlightPagesResource.updateResource(update)
  }

  const highlightsAndMaybeCategoryProgrammeHighlights =
    layoutSelected === 'carousel-with-collections'
      ? highlights
      : [
          ...highlights,
          ...(categories || []).reduce(
            (array, category) => [
              ...array,
              ...category['programme-highlights'],
            ],
            [],
          ),
        ]

  return (
    <PageLoader errored={errored} loaded={loaded}>
      <Meta
        title={`${theme.localisation.client} :: Highlights`}
        meta={{
          description: 'Edit and Create Highlights',
        }}
      >
        <main>
          <PageHeader
            title={`Highlights${currentHighlightPage ? ' : ' + currentHighlightPage?.title : ''}`}
          >
            {highlightPageId &&
              <NavLink to={`/admin/highlight-pages`} className="button">
                <Icon id="i-admin-back" classes="button__icon" />
                  Back to Highlight Pages
              </NavLink>
            }
          </PageHeader>

          <>
            <PageLayoutPicker
              selectLayout={layout => {
                selectLayout(layout)
                setShouldShowSaveAndCancelButtons(
                  layout !== initialLayoutSelected,
                )
              }}
              layoutSelected={layoutSelected}
              shouldShowSaveAndCancelButtons={shouldShowSaveAndCancelButtons}
              shouldDisableSaveButton={layoutSelected === initialLayoutSelected}
              handleCancel={() => {
                selectLayout(initialLayoutSelected)
                setShouldShowSaveAndCancelButtons(false)
              }}
              handleSave={handleSave}
              isLoading={apiQueueStatus === 'loading'}
            />

            <div className="container">
              <table className="cms-table">
                <thead>
                  <tr>
                    <th colSpan={4}>
                      {layoutSelected === 'grid-view'
                        ? pluralize.plural(theme.localisation.programme.upper)
                        : 'Banner carousel'}
                    </th>
                    <th className="cms-table__actions">
                      <ActionMenu
                        name="Actions"
                        disabled={shouldShowSaveAndCancelButtons}
                      >
                        <ActionMenuItem
                          label={`Add ${theme.localisation.programme.upper}`}
                          onClick={addProgramme}
                        />
                      </ActionMenu>
                    </th>
                  </tr>
                </thead>
                <ReorderableList<ProgrammeHighlightType>
                  items={sortByPosition(
                    highlightsAndMaybeCategoryProgrammeHighlights,
                  )}
                  onChange={({ newItems }) => {
                    newItems.forEach((item, index) => {
                      addToQueue(() =>
                        updateOneByModel('programme-highlight', {
                          id: item.id,
                          position: index + 1,
                        }),
                      )
                    })
                  }}
                  disabled={shouldShowSaveAndCancelButtons}
                  draggableTag="tr"
                  droppableTag="tbody"
                  renderItem={({ item: highlight }) => (
                    <>
                      <td className="cms-table__image">
                        <img
                          src={highlight.programme.thumbnail.admin_thumb.url}
                          role="presentation"
                        />
                      </td>
                      <td>
                        <p>{highlight.programme.title}</p>
                      </td>
                      <td />
                      <td />
                      <td className="cms-table__actions">
                        <Button
                          color="error"
                          sizeModifier="small"
                          onClick={() => deleteResource(highlight)}
                          disabled={shouldShowSaveAndCancelButtons}
                        >
                          <SharedIcon
                            icon="close"
                            style={{ fill: 'white', marginRight: 0 }}
                            className="button__icon"
                          />
                        </Button>
                      </td>
                    </>
                  )}
                ></ReorderableList>
              </table>

              {theme.features.app.programmeHighlightPages && pages?.length > 0 &&
                <>
                  <Divider />
                  <ProgrammeCategoriesTitle>Highlight Pages</ProgrammeCategoriesTitle>
                  <RadioLabel>Select how the sub pages below will display on the app</RadioLabel>
                  <RadioOptions>
                    <Checkbox
                      label={'Display as buttons'}
                      id={'buttons'}
                      name={'display-subpages-as-carousel'}
                      onChange={updateSubPageDisplay}
                      checked={!subpageDisplay}
                      radio
                    />
                    <Checkbox
                      label={'Display as programme highlight carousels'}
                      id={'carousel'}
                      name={'display-subpages-as-carousel'}
                      onChange={updateSubPageDisplay}
                      checked={subpageDisplay}
                      radio
                    />
                  </RadioOptions>
                  {pages.sort((a, b) => a.position - b.position).map(page => {
                    return (
                      <table className="cms-table" key={page.id}>
                        <thead>
                          <tr>
                            <th>{page.title}</th>
                          </tr>
                        </thead>
                      </table>
                    )
                  })}
                </>
              }

              {layoutSelected === 'carousel-with-collections' && (
                <>
                  <Divider />
                  <ProgrammeCategoriesWrapper>
                    <ProgrammeCategoriesTitle>
                      {theme.localisation.programme.upper} Categories
                    </ProgrammeCategoriesTitle>
                    <Button
                      className="button button--small"
                      onClick={createCategory}
                      disabled={shouldShowSaveAndCancelButtons}
                    >
                      <Icon
                        width="14"
                        height="14"
                        id="i-admin-add"
                        classes="button__icon"
                      />
                      New {theme.localisation.highlightCategory.upper}
                    </Button>
                  </ProgrammeCategoriesWrapper>
                  {layoutSelected === 'carousel-with-collections' &&
                    categories.length === 0 &&
                    !shouldShowSaveAndCancelButtons && (
                      <DescriptorText>
                        At least one {theme.localisation.programme.lower}{' '}
                        category must be created, or the highlights page will
                        default to Layout 1.
                      </DescriptorText>
                    )}
                  {categories.map(category => {
                    return (
                      <table className="cms-table" key={category.id}>
                        <thead>
                          <tr>
                            <th colSpan={4}>{category.name}</th>
                            <th className="cms-table__actions">
                              <ActionMenu
                                name="Actions"
                                disabled={shouldShowSaveAndCancelButtons}
                              >
                                <ActionMenuItem
                                  label={`Add ${theme.localisation.programme.upper}`}
                                  onClick={() => addCategoryProgramme(category)}
                                />
                                <ActionMenuItem
                                  label="Edit"
                                  onClick={() => editCategory(category)}
                                />
                                <ActionMenuItem
                                  label="Delete"
                                  onClick={() => deleteCategory(category)}
                                />
                              </ActionMenu>
                            </th>
                          </tr>
                        </thead>
                        <CategoriesDragAndDropArea
                          buttonDisabled={shouldShowSaveAndCancelButtons}
                          deleteResource={deleteResource}
                          category={category}
                        />
                      </table>
                    )
                  })}
                </>
              )}
            </div>
          </>
        </main>
      </Meta>
    </PageLoader>
  )
}

export type ProgrammeHighlightsLayout =
  | 'grid-view'
  | 'carousel-with-collections'

const useLogic = (highlightPageId): UseLogicReturn => {
  const {
    categories,
    errored,
    fetchResources,
    loaded,
    highlights,
  } = useProgrammeHighlightsState(highlightPageId)
  const [currentHighlightPage, setCurrentHighlightPage] = useState(null)
  const [pages, setPages] = useState([])

  const highlightPagesResource = useResource('programme-highlight-page')

  useEffect(() => {
    if(highlightPageId){
      getCurrentHighlightPage()
    }
    HighlightsStore.on('resourceUpdated', fetchResources)
    CategoryStore.on('resourceUpdated', fetchResources)
    return () => {
      HighlightsStore.removeListener('resourceUpdated', fetchResources)
      CategoryStore.removeListener('resourceUpdated', fetchResources)
    }
  }, [])

  const getCurrentHighlightPage = () => {
    highlightPagesResource.findOne(highlightPageId, {
      include: 'programme-highlight-pages',
      'programme-highlight-pages': 'title,display-subpages-as-carousel,programme-highlights-count,programme-highlight-pages'
    }).then((response) => {
      setCurrentHighlightPage(response)
      setPages(response['programme-highlight-pages'])
    })
  }

  return {
    errored,
    fetchResources,
    loaded,
    categories: sortByPosition(categories),
    highlights,
    currentHighlightPage,
    pages,
    highlightPagesResource
  }
}

const sortByPosition = array => array.sort((a, b) => a.position - b.position)

interface UseLogicReturn {
  categories: ProgrammeHighlightCategoryType[]
  highlights: ProgrammeHighlightType[]
  pages: ProgrammeHighlightPageType[]
  errored: boolean
  fetchResources: () => void
  loaded: boolean
  currentHighlightPage: ProgrammeHighlightPageType
  highlightPagesResource: any
}

const enhance = compose(
  withModalRenderer
)

export default enhance(ProgrammeHighlightsIndex)
