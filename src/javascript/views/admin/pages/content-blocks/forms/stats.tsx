import React, {useState} from 'react'
// Types
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
// Components
import Button from 'javascript/components/button'
import Select from 'react-select'
import FormControl from 'javascript/components/form-control'
// Hoc
import withTheme from 'javascript/utils/theme/withTheme'

interface Props {
  block?: Stats
  index: undefined | number
  onSubmit: (block: Stats, index?: number) => void
  theme: CustomThemeType
}

interface ItemType {
  label: string,
  value: string
}

interface Stats {
  title: string
  background: string
  centered?: boolean
  loading?: boolean
  items?: ItemType[]
}

const StatsForm: React.FC<Props> = (props) => {
  const {
    block,
    index: blockIndexPosition,
  } = props

  const [title, setTitle] = useState(block?.title || '')
  const [background, setBackground] = useState(block?.background || 'light')
  const [items, setItems] = useState(block?.items || [])
  const [centered, setCentered] = useState(block?.centered)
  const [isLoading, setIsLoading] = useState(false)
  const [resourceErrors, setResourceErrors] = useState([])

  const isValid = () => {
    const errors = items.map((g, i) => {return {...g, key: i}}).filter((g) => !g.value)

    setResourceErrors(errors)
    return (
      errors.length <= 0
    )
  }

  const saveBlock = (e) => {
    e.preventDefault()
    if (!isValid()) {
      return false
    }
    setIsLoading(true)
    const block = {
      title,
      background,
      items,
      centered,
      type: 'stats',
    }
    if (blockIndexPosition > -1) {
      props.onSubmit(block, blockIndexPosition)
    } else {
      props.onSubmit(block)
    }
  }

  const buttonClasses = [
    'button',
    'filled',
    isLoading && 'loading',
  ].join(' button--')

  return (
    <form onSubmit={saveBlock} className="cms-form">
      <FormControl label="Background">
        <Select
          options={[
            { value: 'light', label: 'Plain' },
            { value: 'shade', label: 'Shaded' },
          ]}
          onChange={setBackground}
          value={background}
          clearable={false}
          simpleValue={true}
        />
      </FormControl>
      <FormControl type="text"
        label="Title" name="title"
        value={title}
        onChange={({ target }) => setTitle(target.value) }
      />
      <FormControl>
        <div className="checkbox">
          <input
            type="checkbox"
            checked={centered}
            name="centered"
            className="checkbox__input"
            id="centered"
            onChange={({ target }) => setCentered(target.checked) }
          />
          <label htmlFor="centered" className="checkbox__label cms-form__label">Center Items</label>
        </div>
      </FormControl>
      <div>
          {items?.map((resource, i) => {
            return (
              <div className="cms-form__group">
                <div className="cms-form__group-actions">
                  <Button
                    type="button"
                    className="button button--smallest button--error"
                    onClick={() => {
                      const update = items
                      update.splice(i, 1)
                      setItems([...update])
                    }}
                  >
                    Remove
                  </Button>
                </div>
                <FormControl
                  value={resource.value}
                  type="text"
                  label="Value"
                  onChange={e => {
                    const update = items
                    update[i].value = e.target.value
                    setItems([...update])
                  }}
                />
                <FormControl
                  value={resource.label}
                  type="text"
                  label="Label"
                  onChange={e => {
                    const update = items
                    update[i].label = e.target.value
                    setItems([...update])
                  }}
                />
                {resourceErrors.filter((r) => r.key === i).length > 0 &&
                  <p className="cms-form__error">
                    Please complete this field
                  </p>
                }
              </div>
            )
          })}
        </div>
        <div className="cms-form__actions">
          <Button
            className="button button--small"
            onClick={() => {
              setItems([...items, {value: '', label: ''}])
            }}
            type="button"
          >
            Add Item
          </Button>
        </div>
      <div className="cms-form__control cms-form__control--actions">
        <Button type="submit" className={buttonClasses}>
          Save Content Block
        </Button>
      </div>
    </form>
  )
}

export default withTheme(StatsForm)