import React from 'react'
import { StaticPageProps } from 'javascript/views/admin/pages/static-page-forms'

import CustomCheckbox from 'javascript/components/custom-checkbox'
import FormControl from 'javascript/components/form-control'

const MyProgrammesStaticForm: React.FC<StaticPageProps> = ({
  resource,
  updateResource,
  theme
}) => {

  const updateBool = ({ target }) => {
    updateResource({
      ...resource,
      [target.name]: !resource[target.name]
    })
  }

  return (
    <>
      <FormControl>
        <div className="cms-form__collection">
          <CustomCheckbox label="Display in Main Navigation" id="show-in-nav" name="show-in-nav" onChange={ updateBool } checked={ resource['show-in-nav'] } />
        </div>
      </FormControl>
      {theme.features.navigation.centeredNav &&
        <FormControl>
          <div className="cms-form__collection">
            <CustomCheckbox label="Display in Featured Navigation" id="show-in-featured-nav" name="show-in-featured-nav" onChange={ updateBool } checked={ resource['show-in-featured-nav'] } />
          </div>
        </FormControl>
      }
      {theme.features.navigation.megaNav &&
        <FormControl>
          <div className="cms-form__collection">
            <CustomCheckbox label="Display in Mega Navigation" id="show-in-mega-nav" name="show-in-mega-nav" onChange={ updateBool } checked={ resource['show-in-mega-nav'] } />
          </div>
        </FormControl>
      }
    </>
  )
}

export default MyProgrammesStaticForm
