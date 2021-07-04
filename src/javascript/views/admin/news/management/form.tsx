import React, { useEffect, useState } from 'react'
import moment from 'moment'

// Components
import Button from 'javascript/components/button'
import CustomCheckbox from 'javascript/components/custom-checkbox'
import DatePicker from 'javascript/components/datepicker'
import FormControl from 'javascript/components/form-control'
import Select from 'javascript/components/select'


import useResource from 'javascript/utils/hooks/use-resource'
import useTheme from 'javascript/utils/theme/useTheme'

import { NewsArticleType } from 'javascript/types/ModelTypes'

const initialResource: Partial<NewsArticleType> = {
  'enable-sharing': false,
  'featured': false,
  'introduction': '',
  'news-categories': [],
  'status': 1,
  'publish-date': null,
  'slug': '',
  'title': '',
}

interface Props {
  onSubmitted?: () => void
  resource?: NewsArticleType
}

const NewsForm: React.FC<Props> = ({
  onSubmitted = () => {},
  resource
}) => {
  const { features, localisation, variables } = useTheme()
  const formAction = resource ? 'updateResource' : 'createResource'
  const [article, setArticle] = useState<Partial<NewsArticleType>>(resource || initialResource)
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState(null)
  const [newsCategories, setNewsCategories] = useState([])

  const newsArticleResource = useResource('news-article')
  const newsCategoryResource = useResource('news-category')
  useEffect(() => {
    newsCategoryResource.findAll({
      fields: {
        'news-categories': 'name'
      }
    })
    .then((response) => {
      setNewsCategories(response.map(createCategoryOption))
    })
  }, [])

  useEffect(() => {
    if (resource?.id) {
      newsArticleResource.findOne(resource.id, {
        include: 'news-categories',
        fields: {
          'news-articles': 'enable-sharing,featured,introduction,publish-date,slug,status,title,news-categories',
          'news-categories': 'name'
        }
      })
      .then((response) => {
        const update = {
          id: response.id
        }
        Object.keys(initialResource).forEach((key) => {
          update[key] = response[key]
        })
        update['news-categories'] = update['news-categories'].map(createCategoryOption)
        setArticle(update as NewsArticleType)
      })
    }
  }, [resource])

  const createCategoryOption = (category) => ({
    value: category.id,
    label: category.name,
    category,
  })

  const updateBool = ({ target }) => {
    setArticle((article) => ({
      ...article,
      [target.name]: !article[target.name]
    }))
  }

  const updatePublished = ({ target }) => {
    setArticle((article) => ({
      ...article,
      status: target.checked ? 'published' : 'draft'
    }))
  }

  const handleTitleChange = ({ target }) => {
    const update = {...article}
    update.title = target.value
    update.slug = target.value.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')
    setArticle(update)
  }

  const handleSlugChange = ({ target }) => {
    const update = {...article}
    update.slug = target.value.toLowerCase().replace(/[^\w\s\-]/gi, '').replace(/\s+/g, '-')
    setArticle(update)
  }

  const handleDateChange = (value) => {
    const update = {...article}
    update['publish-date'] = moment(value).toDate().toString()
    setArticle(update)
  }

  const handleInputChange = (e) => {
    const update = {...article }
    update[e.target.name] = e.target.value
    setArticle(update)
  }

  const renderErrors = () => {
    if (apiErrors) {
      return (
        <ul className="cms-form__errors">
          { Object.keys(apiErrors).map((key, i) => {
            const error = apiErrors[key]
            return (
              <li key={ i }>{ key.charAt(0).toUpperCase() + key.slice(1) } { error }</li>
            )
          }) }
        </ul>
      )
    }
  }

  const handleCategoryChange = (values) => {
    setArticle((article) => ({
      ...article,
      'news-categories': values
    }))
  }

  const saveArticle = (e) => {
    e.preventDefault()
    setIsLoading(true)
    const update = {...article}
    //@ts-ignore
    update['news-categories'] = (update['news-categories'] || []).map((option) => option.category)
    newsArticleResource[formAction](update)
    .then((response) => {
      onSubmitted()
    })
    .catch((errors) => {
      setApiErrors(errors)
      setIsLoading(false)
    })
  }

  let date = article['publish-date']
  const buttonClasses = ['button', 'filled', isLoading && 'loading'].join(' button--')

  return (
    <form onSubmit={saveArticle} >
      { formAction == 'updateResource' &&
        <FormControl label={`${localisation.news.upper} URL`}>
          <span className="cms-form__copy">
            <a href={`/${variables.SystemPages.news.path}/${resource.slug}`} target="_blank">
              {`${window.location.origin}/${variables.SystemPages.news.path}/${resource.slug}`}
            </a>
          </span>
        </FormControl>
      }
      <FormControl label="Title" type="text" name="title" value={ article.title } required onChange={ handleTitleChange } />
      <FormControl label="Slug" type="text" name="slug" value={ article.slug } required onChange={ handleSlugChange } />
      <FormControl label={`${localisation.news.upper} ${localisation.newsCategory.lower}`}>
        <Select options={ newsCategories } value={ article['news-categories'] } onChange={ handleCategoryChange } clearable={true} multi={true} />
      </FormControl>
      <FormControl type="textarea" name="introduction" label="Introduction" value={ article.introduction } maxLength="255" onChange={ handleInputChange } />
      <FormControl label="Publish Date">
        <DatePicker onChange={ handleDateChange } selected={ date } dateFormat={features.formats.longDate} />
      </FormControl>
      <FormControl>
        <div className="cms-form__collection">
          <CustomCheckbox label="Enable Sharing" id="enable-sharing" name="enable-sharing" onChange={ updateBool } checked={ article['enable-sharing'] } />
        </div>
      </FormControl>
      <FormControl>
        <div className="cms-form__collection">
          <CustomCheckbox label="Published" id="published" name="published" onChange={ updatePublished } checked={ article.status === 'published'  } />
        </div>
      </FormControl>
      <FormControl>
        <div className="cms-form__collection">
          <CustomCheckbox label="Featured" id="featured" name="featured" onChange={ updateBool } checked={ article.featured } />
        </div>
      </FormControl>


      { renderErrors() }
      <div className="cms-form__control cms-form__control--actions">
        <Button type="submit" className={ buttonClasses }>Save Article</Button>
      </div>
    </form>
  )
}

export default NewsForm
