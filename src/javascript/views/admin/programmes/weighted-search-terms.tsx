import React, { useState, useEffect } from 'react'
import useResource from 'javascript/utils/hooks/use-resource'

import Button from 'javascript/components/button'
import compose from 'javascript/utils/compose'
import withWaitForLoadingDiv, { WithWaitForLoadingDivType } from 'javascript/components/hoc/with-wait-for-loading-div'

// Types
import { ProgrammeType } from 'javascript/types/ModelTypes'

interface Props extends WithWaitForLoadingDivType {
  programme: ProgrammeType
  closeEvent: () => any
}

const WeightedSearchTerms: React.FC<Props> = ({
  closeEvent,
  programme,
  waitForLoading,
}) => {

  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState({})
  const [weightedTerms, setWeightedTerms] = useState([])
  const weightedWordResource = useResource('weighted-word')
  const buttonClasses = ['button', 'filled', isLoading && 'loading'].join(' button--')

  const hasDataToSave = () => {
    return weightedTerms.reduce((acc, term) => {
      if (acc) return acc
      return term.edited
    }, false)
  }

  useEffect(() => {
    if (programme?.id) {
      waitForLoading.waitFor('weightedWords')
      weightedWordResource.findAllFromOneRelation({
        'name': 'programme',
        id: programme.id
      }, {
        fields: {
          'weighted-word': 'name,weight',
        },
        sort: '-weight'
      })
      .then((response) => {
        setWeightedTerms(response.map((term) => ({
          ...term,
          programme: {
            id: programme.id
          }
        })))
        waitForLoading.finished('weightedWords')
      })
    }
  }, [])

  const handleInputChange = (index) => ({target}) => {
    const update = [...weightedTerms]
    update[index][target.name] = target.value
    update[index].edited = true
    setWeightedTerms(update)
  }

  const handleNumberChange = (index) => ({target}) => {
    const update = [...weightedTerms]
    update[index][target.name] = target.value.replace(/[^\d]/g, '')
    update[index].edited = true
    setWeightedTerms(update)
  }

  const deleteItem = (resource) => new Promise((resolve, reject) => {
    return resource.id ? resolve(weightedWordResource.deleteResource(resource)) : resolve(resource)
  })

  const handleDeleteTerm = (index) => (e) => {
    const update = [...weightedTerms]
    const itemToDelete = update[index]
    if (itemToDelete.id) {
      setIsDeleting({
        ...isDeleting,
        [itemToDelete.id]: true
      })
    }
    deleteItem(itemToDelete)
    .then((response) => {
      update.splice(index, 1)
      setWeightedTerms(update)
      if (itemToDelete.id) {
        const updateDeleting = {...isDeleting}
        delete updateDeleting[itemToDelete.id]
        setIsDeleting(updateDeleting)
      }
    })
  }

  const addTerm = () => {
    const update = [...weightedTerms]
    update.push({
      created: true,
      name: '',
      weight: 1,
      programme: {
        id: programme.id
      }
    })
    setWeightedTerms(update)
  }

  const handleSubmit = () => {
    setIsLoading(true)
    const [itemsToCreate, itemsToSave] = weightedTerms.reduce((acc, term) => {
      if (term.edited && term.name) {
        if (term.created) {
          acc[0].push(term)
        } else {
          acc[1].push(term)
        }
      }
      return acc
    }, [[], []])
    const sendRequestsToApi = (resources = [], save) => {
      return resources.map((resource, index) => new Promise((resolve) => {
        setTimeout(() => {
          save(resource).then((response) => {
            return resolve(response)
          })
        }, (index + 1) * 200)
      }))
    }
    Promise.all([
      ...sendRequestsToApi(itemsToCreate, weightedWordResource.createResource),
      ...sendRequestsToApi(itemsToSave, weightedWordResource.updateResource)
    ]).then(() => {
      closeEvent()
    })

  }

  return (
    <form className="cms-form" style={{minHeight: '250px'}}>
      <div className="cms-form__table" style={{marginLeft: '0px', minHeight: '120px'}}>
        {weightedTerms.length === 0 ? (
          <div style={{ width: '300px', padding: '10px 40px'}}>There are currently no weighted words, try creating some!</div>
        ) : (
          weightedTerms.map((term, index) => {
            return (
              <div className="cms-form__control" key={index}>
                <div>
                  <input
                    type="text"
                    name="name"
                    aria-label="name"
                    placeholder="Term"
                    className="cms-form__input"
                    onChange={handleInputChange(index)}
                    value={term.name}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    aria-label="weight"
                    name="weight"
                    placeholder="Weight"
                    className="cms-form__input"
                    onChange={handleNumberChange(index)}
                    value={term.weight}
                  />
                </div>
                <div>
                  <Button
                    type="button"
                    className={ isDeleting[term.id]
                      ? "button button--small button--filled button--danger button--loading"
                      : "button button--small button--filled button--danger"
                    }
                    onClick={handleDeleteTerm(index)}
                    {...(isLoading && {disabled: true})}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className="cms-form__actions">
        <Button
          className="button button--small"
          onClick={addTerm}
          type="button"
          {...(isLoading && {disabled: true})}
        >
          Add a New Term
        </Button>
      </div>
      <div className="cms-form__control cms-form__control--actions">
        <Button type="button" onClick={closeEvent} className="button">Cancel</Button>
        {hasDataToSave() && (
          <Button type="button" onClick={handleSubmit} className={buttonClasses}>Save</Button>
        )}
      </div>
    </form>
  )
}

const enhance = compose(
  withWaitForLoadingDiv
)

export default enhance(WeightedSearchTerms)

