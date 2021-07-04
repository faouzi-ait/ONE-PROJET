import React from 'react'
import useFsmReducer, { UseFsmReducerEffects } from 'use-fsm-reducer'
import uuid from 'uuid/v4'

import Button from 'javascript/components/button'
import PageLoader from 'javascript/components/page-loader'
import {
  createOneByModel,
  deleteOneByModel,
  findAllByModel,
  updateOneByModel,
} from 'javascript/utils/apiMethods'

import { ProgrammeType } from 'javascript/types/ModelTypes'

type PossiblySyntheticAlternativeTitle =
  | {
      type: 'synthetic'
      name: string
      position: number
      id: string
    }
  | {
      type: 'fresh-from-the-api'
      name: string
      id: any
      position: number
    }

type State =
  | {
      type: 'pendingData'
    }
  | {
      type: 'initial'
      titles: PossiblySyntheticAlternativeTitle[]
      formError?: string
    }
  | {
      type: 'pendingSave'
      titles: PossiblySyntheticAlternativeTitle[]
    }
  | {
      type: 'errored'
    }

type Action =
  | {
      type: 'receivedAlternativeTitles'
      titles: PossiblySyntheticAlternativeTitle[]
    }
  | {
      type: 'changeAlternativeTitle'
      index: number
      name: string
    }
  | {
      type: 'addTitle'
    }
  | {
      type: 'deleteTitle'
      title: PossiblySyntheticAlternativeTitle
    }
  | {
      type: 'submitSave'
    }
  | {
      type: 'retryAfterError'
    }
  | {
      type: 'reportSuccess'
    }
  | {
      type: 'reportError'
    }
  | {
      type: 'closeModal'
    }

type Effect =
  | {
      type: 'fetchTitles'
    }
  | {
      type: 'saveTitles'
      titles: PossiblySyntheticAlternativeTitle[]
    }
  | {
      type: 'deleteTitleById'
      id: string | number
    }
  | {
      type: 'closeModal'
    }

const useLogic = ({
  effects,
}: {
  effects: UseFsmReducerEffects<Action, Effect>
}) => {
  return useFsmReducer<State, Action, Effect>({
    initialState: {
      type: 'pendingData',
    },
    runEffectsOnMount: [{ type: 'fetchTitles' }],
    states: {
      pendingData: {
        receivedAlternativeTitles: (state, action) => {
          return {
            type: 'initial',
            titles: action.titles,
          }
        },
      },
      initial: {
        receivedAlternativeTitles: (state, action) => {
          return {
            type: 'initial',
            titles: action.titles,
          }
        },
        changeAlternativeTitle: (state, action) => {
          const titles = state.titles

          titles[action.index].name = action.name
          return {
            type: 'initial',
            titles,
          }
        },
        addTitle: (state) => {
          return {
            type: 'initial',
            titles: [
              ...state.titles,
              {
                id: uuid(),
                type: 'synthetic',
                name: '',
                position: state.titles.length + 1,
              },
            ],
          }
        },
        deleteTitle: (state, action) => {
          const effects = []
          if (action.title.type === 'fresh-from-the-api') {
            effects.push({ type: 'deleteTitleById', id: action.title.id })
          }
          return {
            titles: state.titles.filter(
              (title) => title.id !== action.title.id,
            ),
            type: 'initial',
            effects,
          }
        },
        submitSave: (state, action) => {
          const allTitlesAreUnique = state.titles.every((title) => {
            return (
              state.titles.filter((_title) => _title.name === title.name)
                .length === 1
            )
          })
          if (!allTitlesAreUnique) {
            return {
              type: 'initial',
              titles: state.titles,
              formError: `You have two titles with the same name. All alternative titles must be unique.`,
            }
          }
          return {
            type: 'pendingSave',
            titles: state.titles,
            effects: [{ type: 'saveTitles', titles: state.titles }],
          }
        },
        reportSuccess: (state) => {
          return {
            ...state,
            effects: [{ type: 'fetchTitles' }],
          }
        },
        reportError: () => {
          return {
            type: 'errored',
          }
        },
      },
      pendingSave: {
        reportSuccess: (state) => {
          return {
            type: 'pendingSave',
            titles: state.titles,
            effects: [{ type: 'closeModal' }],
          }
        },
        reportError: () => {
          return {
            type: 'errored',
          }
        },
      },
      errored: {
        retryAfterError: () => {
          return {
            type: 'pendingData',
            effects: [{ type: 'fetchTitles' }],
          }
        },
        closeModal: () => {
          return {
            type: 'errored',
            effects: [{ type: 'closeModal' }],
          }
        },
      },
    },
    effects,
  })
}

const ProgrammeAlternativeTitlesForm: React.FC<{
  resource: ProgrammeType
  closeEvent: () => void
}> = ({ resource: programme, closeEvent }) => {
  const [state, dispatch] = useLogic({
    effects: {
      fetchTitles: ({ dispatch }) => {
        findAllByModel('programme-alternative-titles', {
          fields: ['name', 'position'],
          filter: {
            programme: programme.id,
          },
        })
          .then((titles) => {
            dispatch({
              type: 'receivedAlternativeTitles',
              titles: titles.map((title) => ({
                ...title,
                type: 'fresh-from-the-api',
              })),
            })
          })
          .catch(() => {
            dispatch({ type: 'reportError' })
          })
      },
      deleteTitleById: ({ effect, dispatch }) => {
        deleteOneByModel('programme-alternative-title', Number(effect.id))
          .then(() => {
            dispatch({
              type: 'reportSuccess',
            })
          })
          .catch(() => {
            dispatch({ type: 'reportError' })
          })
      },
      saveTitles: ({ dispatch, effect }) => {
        /** Run through each promise in turn */
        effect.titles
          .reduce(async (promise, title) => {
            await promise
            if (title.type === 'fresh-from-the-api') {
              return updateOneByModel('programme-alternative-title', {
                id: title.id,
                name: title.name,
              })
            } else {
              return createOneByModel('programme-alternative-title', {
                name: title.name,
                programme,
              } as any)
            }
          }, Promise.resolve())
          .then(() => {
            dispatch({
              type: 'reportSuccess',
            })
          })
          .catch(() => {
            dispatch({ type: 'reportError' })
          })
      },
      closeModal: closeEvent,
    },
  })
  if (state.type === 'pendingData') {
    return <PageLoader loaded={false} errored={false} children={null} />
  }
  if (state.type === 'initial' || state.type === 'pendingSave') {
    return (
      <form
        className="cms-form"
        onSubmit={(e) => {
          e.preventDefault()
          dispatch({ type: 'submitSave' })
        }}
      >
        <div className="cms-form__table cms-form__table--wide">
          {state.titles.map((title, i) => {
            return (
              <div className="cms-form__control" key={i}>
                <div>
                  <input
                    type="text"
                    value={title.name}
                    placeholder="Name"
                    className="cms-form__input"
                    onChange={({ target }) =>
                      dispatch({
                        type: 'changeAlternativeTitle',
                        index: i,
                        name: target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Button
                    type="button"
                    className="button button--small button--filled button--danger"
                    onClick={() => {
                      dispatch({
                        type: 'deleteTitle',
                        title,
                      })
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}
          <div className="cms-form__actions">
            <Button
              className="button button--small"
              onClick={() => {
                dispatch({ type: 'addTitle' })
              }}
              type="button"
            >
              Add A New Title
            </Button>
          </div>
          {state.type === 'initial' && state.formError && (
            <div>
              <p className="cms-form__error">{state.formError}</p>
            </div>
          )}
          <div className="cms-form__control">
            <Button
              type="submit"
              className={`button button--filled ${
                state.type === 'pendingSave' ? 'button--loading' : ''
              }`}
            >
              Save
            </Button>
          </div>
        </div>
      </form>
    )
  }
  if (state.type === 'errored') {
    return (
      <div>
        <h4>
          Something went wrong while talking to the ONE database. Give it a few
          minutes and try again.
        </h4>
        <Button
          className="button button--filled"
          style={{ marginRight: '10px' }}
          onClick={() => dispatch({ type: 'retryAfterError' })}
        >
          Retry
        </Button>
        <Button
          className="button button--filled"
          onClick={() => dispatch({ type: 'closeModal' })}
        >
          Close
        </Button>
      </div>
    )
  }
}

export default ProgrammeAlternativeTitlesForm
