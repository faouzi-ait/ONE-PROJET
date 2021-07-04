import React from 'react'
import usePrefix from 'javascript/utils/hooks/use-prefix'

import 'stylesheets/admin/components/cms-custom-checkbox'
import 'stylesheets/core/components/custom-checkbox'

const CustomCheckbox = (props) =>  {
  const { label, toggle, id, labeless, disabled = false, radio } = props
  const { prefix } = usePrefix()

  const classes = [`${prefix}custom-checkbox`, toggle && 'toggle', labeless && 'no-label', radio && 'radio'].join(` ${prefix}custom-checkbox--`)
  const labelClasses = `${prefix}custom-checkbox__label ${disabled ? `${prefix}custom-checkbox__label--disabled` : ''}`
  return (
    <div className={ classes }>
      <input id={id} type={radio ? 'radio' : 'checkbox'}
        className={`${prefix}custom-checkbox__input`}
        name={props.name}
        aria-label={props.name}
        onChange={props.onChange}
        checked={props.checked}
        value={props.value}
        disabled={disabled}
        data-parent={props['data-parent']}
      />
      <label htmlFor={id} className={labelClasses} dangerouslySetInnerHTML={{ __html: label }}></label>
    </div>
  )
}

export default CustomCheckbox
