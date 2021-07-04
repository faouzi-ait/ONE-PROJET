import React from 'react'
import Meta from 'react-document-meta'

import { ConfigSaveButton } from 'javascript/components/tabbed-config-form'
import FormControl from 'javascript/components/form-control'
import PageHeader from 'javascript/components/admin/layout/page-header'

import useConfiguration from 'javascript/utils/hooks/use-configuration'
import useThemeForm from 'javascript/utils/hooks/use-theme-form'

interface Values {
  displaySeries: boolean
  displayNumberOfEpisodesPerSeries: boolean
  displaySeriesImages: boolean
  displayTotalSeriesCount: boolean
  displayEpisodes: boolean
}

const ConfigProgrammesForm = props => {
  const {
    haveChangesBeenMade,
    makeCheckboxOnChange,
    onSubmit,
    submitStatus,
    values,
  } = useThemeForm<Values>({
    inputs: {
      displayEpisodes: {
        selector: theme => theme.features.programmeOverview.episodes,
        reverseSelector: episodes => ({
          features: {
            programmeOverview: {
              episodes,
            },
          },
        }),
      },
      displayNumberOfEpisodesPerSeries: {
        selector: theme => theme.features.programmeOverview.seriesEpisodeCount,
        reverseSelector: seriesEpisodeCount => ({
          features: {
            programmeOverview: {
              seriesEpisodeCount,
            },
          },
        }),
      },
      displaySeries: {
        selector: theme => theme.features.programmeOverview.series,
        reverseSelector: series => ({
          features: {
            programmeOverview: {
              series,
            },
          },
        }),
      },
      displaySeriesImages: {
        selector: theme => theme.features.programmeOverview.seriesImages,
        reverseSelector: seriesImages => ({
          features: {
            programmeOverview: {
              seriesImages,
            },
          },
        }),
      },
      displayTotalSeriesCount: {
        selector: theme => theme.features.programmeOverview.seriesCount,
        reverseSelector: seriesCount => ({
          features: {
            programmeOverview: {
              seriesCount,
            },
          },
        }),
      },
    },
    handleSubmit: values => useConfiguration('features').save(values),
  })

  return (
    <Meta>
      <main>
        <PageHeader title={`${props.theme.localisation.programme.upper} options`} />
        <div className="container">
          <form className="cms-form cms-form--large" onSubmit={onSubmit}>
            <h3 className="cms-form__title">{props.theme.localisation.series.upper}</h3>
            <FormControl
              type="checkbox"
              label={`Display ${props.theme.localisation.series.lower}`}
              id="series"
              name="series"
              checkboxLabeless={true}
              onChange={makeCheckboxOnChange('displaySeries')}
              checked={values.displaySeries}
            />
            {values.displaySeries && (
              <>
                <FormControl
                  type="checkbox"
                  label={`Display number of episodes per ${props.theme.localisation.series.lower}`}
                  id="seriesEpisodeCount"
                  name="seriesEpisodeCount"
                  checkboxLabeless={true}
                  onChange={makeCheckboxOnChange('displayNumberOfEpisodesPerSeries')}
                  checked={values.displayNumberOfEpisodesPerSeries}
                />
                <FormControl
                  type="checkbox"
                  label={`Display ${props.theme.localisation.series.lower} images`}
                  id="seriesImages"
                  name="seriesImages"
                  checkboxLabeless={true}
                  onChange={makeCheckboxOnChange('displaySeriesImages')}
                  checked={values.displaySeriesImages}
                />
              </>
            )}
            <FormControl
              type="checkbox"
              label={`Display total ${props.theme.localisation.series.lower} count`}
              id="seriesCount"
              name="seriesCount"
              checkboxLabeless={true}
              onChange={makeCheckboxOnChange('displayTotalSeriesCount')}
              checked={values.displayTotalSeriesCount}
            />
            <h3 className="cms-form__title">{props.theme.localisation.episodes.upper}</h3>
            <FormControl
              type="checkbox"
              label={`Display ${props.theme.localisation.episodes.lower}`}
              id="episodes"
              name="episodes"
              checkboxLabeless={true}
              onChange={makeCheckboxOnChange('displayEpisodes')}
              checked={values.displayEpisodes}
            />
            <div className="cms-form__control cms-form__control--actions">
              <ConfigSaveButton
                haveChangesBeenMade={haveChangesBeenMade}
                submitStatus={submitStatus}
                buttonText="Save Config"
              />
            </div>
          </form>
        </div>
      </main>
    </Meta>
  )
}

export default ConfigProgrammesForm
