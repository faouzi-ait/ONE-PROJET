import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'

import { createOneByModel, updateOneByModel } from 'javascript/utils/apiMethods'
import {useWistiaMultiVideoUploadState, useBrightcoveMultiVideoUploadState} from 'javascript/utils/hooks/use-multi-video-upload-state'

// Components
import AsyncSearchProgrammes from 'javascript/components/async-search-programmes'
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'
import CustomCheckbox from 'javascript/components/custom-checkbox'
// HOC

import { EpisodeType, ProgrammeType, SeriesType } from 'javascript/types/ModelTypes'
import useTheme from 'javascript/utils/theme/useTheme'

interface Props {
  onResourcesCreated: () => void
  parent: ProgrammeType | SeriesType | EpisodeType
  programme?: ProgrammeType
  series?: SeriesType
  videoProvider: 'wistia' | 'brightcove'
}

const MultipleVideoForm: React.FC<Props> = ({
  onResourcesCreated,
  parent,
  programme,
  series,
  videoProvider
}) => {
  const { localisation } = useTheme()
  const [resources, setResources] = useState(null)
  const selectedProgramme = programme || parent
  const selectedSeries = parent.type === 'series' ? parent : series
  const selectedEpisode= parent.type === 'episodes' ? parent : null

  const [restricted, setRestricted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState(null)

  const multiWistiaUploads = useWistiaMultiVideoUploadState()
  const multiBrightcoveUploads = useBrightcoveMultiVideoUploadState()
  let videos = []
  let lastVideoCompleted = null
  if(videoProvider === 'wistia') {
    videos = multiWistiaUploads.videos()
    lastVideoCompleted = multiWistiaUploads.lastVideoCompleted()
  }
  if(videoProvider === 'brightcove') {
    videos = multiBrightcoveUploads.videos()
    lastVideoCompleted = multiBrightcoveUploads.lastVideoCompleted()
  }

  useEffect(() => {
    if (lastVideoCompleted?.id === null || !resources) return
    const update = [...resources].map((resource) => ({
      ...resource,
      ...(lastVideoCompleted.id === resource.id && videoProvider === 'wistia' && {
        'wistia-id': lastVideoCompleted['wistia-id']
      }),
      ...(lastVideoCompleted.key === resource.key && videoProvider === 'brightcove' && {
        'brightcove-id': lastVideoCompleted['brightcove-id'],
        id: lastVideoCompleted.id
      })
    }))
    setResources(update)
  }, [lastVideoCompleted.id])

  useEffect(() => {
    setResources(videos.map((video) => {
      const options = {
        ...video,
        parent: parent,
        programme: selectedProgramme,
        series: selectedSeries,
        episode: selectedEpisode,
        restricted: false,
        'public-video': false
      }
      if(videoProvider === 'wistia') {
        options['mp4-url'] = `https://api.wistia.com/v1/medias/${video[ 'wistia-id' ]}`
      }
      return options
    }))
  }, [])

  const renderErrors = () => {
    if (errors) {
      return (
        <ul className="cms-form__errors">
          {Object.keys(errors).map((key, i) => {
            const error = errors[key]
            return (
              <li key={i}>{key.charAt(0).toUpperCase() + key.slice(1)} {error}</li>
            )
          })}
        </ul>
      )
    }
  }

  const handleInputChange = (e, id) => {
    const update = [...resources]
    update[id][ e.target.name ] = e.target.value
    setResources(update)
  }

  const createResources = (e) => {
    e.preventDefault()
    if (!isLoading) {
      setIsLoading(true)
      const savingResources = resources.map((resource) => {
        if(videoProvider === 'brightcove') {
          //Brightcove videos are already created by BE
          return updateOneByModel('video', resource)
        } else {
          delete resource.id
          return createOneByModel('video', resource)
        }
      })
      Promise.all(savingResources)
        .then((responses) => {
          onResourcesCreated()
        })
        .catch((errors) => {
          setErrors(errors)
          setIsLoading(false)
        })
    }
  }

  const updateSelectedParent = (id, type, fallback, newState = {}) => (parent) => {
    const update = [...resources]
    update[ id ] = {
      ...update[id],
      [ type ]: parent,
      parent: parent || fallback || false,
      ...newState
    }
    setResources(update)
  }

  const updatePublic = (id) => {
    const update = [...resources]
    update[id] = {
      ...update[id],
      'public-video': !resources[id]['public-video'],
      restricted: !resources[id]['public-video'] ? false : resources[id].restricted
    }
    setResources(update)
    toggleAllRestriction(update)
  }

  const updateAllRestriction = () => {
    const update = resources.map((resource) => ({
      ...resource,
      restricted: !restricted,
      'public-video': restricted ? resource['public-video'] : false
    }))
    setResources(update)
    setRestricted((restricted) => !restricted)
  }

  const updateRestriction = (id) => {
    const update = [...resources]
    update[id] = {
      ...update[id],
      restricted: !resources[id].restricted,
      'public-video': resources[id][ 'restricted' ] ? resources[id]['public-video'] : false
    }
    setResources(update)
    toggleAllRestriction(update)
  }

  const toggleAllRestriction = (updatedResources) => {
    const restrictedResources = updatedResources.filter(resource => resource.restricted)
    setRestricted(updatedResources.length === restrictedResources.length)
  }

  const renderForms = () => {
    const forms = (resources || []).map((resource, index) => (
      <div key={index}>
        <h3>{resource.name}</h3>
        <FormControl label={localisation.programme.upper} required>
          <AsyncSearchProgrammes
            value={resource.programme || {}}
            onChange={updateSelectedParent(index, 'programme', null, { series: false, episode: false })}
            required
          />
        </FormControl>

        <FormControl label={localisation.series.upper}>
          <Select
            value={resource.series}
            onChange={updateSelectedParent(index, 'series', resource.programme, { episode: false })}
            options={resource.programme ? resource.programme.series : []}
            labelKey="name"
            valueKey="id" />
        </FormControl>

        <FormControl label="Episode">
          <Select
            value={resource.episode}
            onChange={updateSelectedParent(index, 'episode', resource.series)}
            options={resource.series ? resource.series.episodes : []}
            labelKey="name"
            valueKey="id" />
        </FormControl>

        <FormControl type="text" label="Name" name="name" value={resource.name} onChange={(e) => handleInputChange(e, index)} required />
        <FormControl label="Public" modifiers={[ 'top' ]}>
          <CustomCheckbox checked={resource[ 'public-video' ]} id={resource.id} labeless onChange={() => updatePublic(index)} />
          {!resource.restricted && resource[ 'public-video' ] &&
            <p className="cms-form__error" style={{ maxWidth: 285 }}>Warning: making this video public will make it no longer restricted.</p>
          }
        </FormControl>
        <FormControl label="Restricted" modifiers={[ 'top' ]}>
          <CustomCheckbox labeless id={`restriction ${resource.id}`} checked={resource.restricted} onChange={() => updateRestriction(index)} />
          {!resource[ 'public-video' ] && resource.restricted &&
            <p className="cms-form__error">Warning: restricting this video will make it no longer public.</p>
          }
        </FormControl>
        {videoProvider === 'wistia' &&
          <FormControl key="wistia_id" type="text" label="Wistia ID" name="wistia-id" value={resource[ 'wistia-id' ]} onChange={(e) => handleInputChange(e, index)} readOnly />
        }
        {videoProvider === 'brightcove' &&
          <FormControl key="brightcove_id" type="text" label="Brightcove ID" name="brightcove-id" value={resource[ 'brightcove-id' ]} onChange={(e) => handleInputChange(e, index)} readOnly />
        }
        <hr />
      </div>
    ))
    return forms.length ? forms : null
  }

  const buttonClasses = [ 'button', 'filled', isLoading && 'loading' ].join(' button--')
  let isFormDisabled = true
  if(videoProvider === 'wistia') {
    isFormDisabled = !multiWistiaUploads.allUploadsCompleted()
  }
  if(videoProvider === 'brightcove') {
    isFormDisabled = !multiBrightcoveUploads.allUploadsCompleted()
  }
  return (
    <form className="cms-form" onSubmit={createResources}>
      <FormControl label={restricted ? `Unrestrict video access` : `Restrict video access`} modifiers={[ 'top' ]}>
        <CustomCheckbox checked={restricted} id="restricted" labeless onChange={updateAllRestriction} />
      </FormControl>
      {renderForms()}
      {renderErrors()}
      <div className="cms-form__control cms-form__control--actions">
        <Button
          type="submit"
          className={buttonClasses}
          disabled={isFormDisabled}>Save {pluralize(localisation.video.lower)}</Button>
      </div>
    </form>
  )

}

export default MultipleVideoForm
