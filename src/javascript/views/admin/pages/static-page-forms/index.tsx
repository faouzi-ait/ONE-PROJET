import React, { useState } from 'react'

import CatalogueStaticForm from 'javascript/views/admin/pages/static-page-forms/catalogue'
import MyProgrammesStaticForm from 'javascript/views/admin/pages/static-page-forms/my-programmes'
import NewsStaticForm from 'javascript/views/admin/pages/static-page-forms/news'
import TeamStaticForm from 'javascript/views/admin/pages/static-page-forms/team'

import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

export interface StaticPageProps {
  resource: any
  slug: string
  updateResource: (resource: any) => void,
  theme: ThemeType
}

type StaticPageFormType = (theme: ThemeType) => {
  [path: string]: React.FC
}

export const getStaticPageForm: StaticPageFormType = ({ variables }) => ({
  // Add any new static page forms here... mapped via slug
  // Will use this mapping to render any forms as well as creating edit option in ActionMenu
  [variables.SystemPages.catalogue.path]: CatalogueStaticForm,
  [variables.SystemPages.news.path]: NewsStaticForm,
  [variables.SystemPages.myProgrammes.path]: MyProgrammesStaticForm,
  [variables.SystemPages.team.path]: TeamStaticForm,
})

const StaticPageForm: React.FC<StaticPageProps> = (props) => {
  const [originalSlug] = useState(props.slug || props.resource.slug)
  const StaticForm = getStaticPageForm(props.theme)[originalSlug]
  return StaticForm ? <StaticForm {...props} /> : null
}

export default StaticPageForm
