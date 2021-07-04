import React from 'react'
import Select from 'react-select'
import styled from 'styled-components'

import { findAllByModel } from 'javascript/utils/apiMethods'
import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'

import { StoreErrors } from 'javascript/stores/helper'

import Button from 'javascript/components/button'
import ProgrammesActions from 'javascript/actions/programmes'
import Span from 'javascript/components/span'
import VideoActions from 'javascript/actions/videos'

import ProgrammesStore from 'javascript/stores/programmes'
import VideoStore from 'javascript/stores/videos'

import { LanguageMultiSelect } from 'javascript/components/admin/language-multi-select'
import AsyncSearchProgrammes from 'javascript/components/async-search-programmes'
import CustomCheckbox from 'javascript/components/custom-checkbox'
import FormControl from 'javascript/components/form-control'
import useBrightcoveUploader from 'javascript/utils/hooks/use-brightcove-uploader'

import {
  EpisodeType,
  ProductionCompanyType,
  ProgrammeType,
  SeriesType,
  VideoType,
  VideoTypesType,
  WistiaAccountType,
} from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import VideoProviders from 'javascript/types/VideoProviders'
import withWaitForLoadingDiv, { WithWaitForLoadingDivType } from 'javascript/components/hoc/with-wait-for-loading-div'

type PossibleAction =
  | 'upload-to-brightcove'
  | 'brightcove-id'
  | 'mp4-url'
  | 'wistia-id'
  | 'knox'
  | 'jwplayer-id'
  | 'comcast-platform-id'

type ApiStatus = 'idle' | 'loading' | 'errored' | 'fulfilled'

interface Props extends WithWaitForLoadingDivType {
  onSave: () => void
  programme?: ProgrammeType | { type: 'production-companies' }
  episode?: EpisodeType
  series?: SeriesType
  videoProviders: VideoProviders
  resource?: VideoType
  theme: ThemeType
  parent?: { type: 'production-companies'}
}

interface State {
  resource: Partial<VideoType> & { downloadable?: boolean }
  wistiaConfig?: WistiaAccountType
  errors: StoreErrors
  status: ApiStatus
  programmes: ProgrammeType[]
  selectedProgramme: ProgrammeType | { type: 'production-companies' }
  selectedSeries: SeriesType
  selectedEpisode: EpisodeType
  isEditing: boolean
  chosenAction: PossibleAction
  brightcoveUpload?: {
    percentComplete: number
    secondsLeft: number
    fileSize: number
    remainingSize: number
    timeBegun: number
  }
  videoTypes: VideoTypesType[]
}

const editResourceBlackList = [
  'episode-id',
  'episode-name',
  'programme-id',
  'programme-name',
  'series-id',
  'series-name',
  'upload-status',
  'parent-id',
  'parent-type',
]

class VideoForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    let chosenAction: PossibleAction = 'mp4-url'
    if (props.resource) {
      if (props.resource['brightcove-id']) {
        chosenAction = 'brightcove-id'
      } else if (props.resource['knox-uuid']) {
        chosenAction = 'knox'
      } else if (props.resource['wistia-id']) {
        chosenAction = 'wistia-id'
      } else if (props.resource['jwplayer-id']) {
        chosenAction = 'jwplayer-id'
      } else if (props.resource['comcast-platform-id']) {
        chosenAction = 'comcast-platform-id'
      }
    }
    let defaultRestricted = !props.programme || props.programme.type !== 'production-companies'
    if (props.resource) {
      defaultRestricted = props.resource?.hasOwnProperty('restricted')
      ? props.resource['restricted']
      : !props.resource?.['public-video']
    }

    this.state = {
      programmes: [],
      selectedProgramme: props.programme,
      selectedSeries: props.series,
      selectedEpisode: props.episode,
      resource: (props.resource && {
        id: props.resource.id,
        'brightcove-id': props.resource['brightcove-id'],
        'downloadable': props.resource['downloadable'],
        'knox-uuid': props.resource['knox-uuid'],
        'mp4-url': props.resource['mp4-url'],
        'parent': props.resource['parent'] || props.parent,
        'public-video': props.resource['public-video'] || false,
        'restricted': defaultRestricted,
        'wistia-id': props.resource['wistia-id'],
        'name': props.resource['name'],
        'languages' : props.resource.languages,
        'external-id': props.resource['external-id'],
        'jwplayer-id': props.resource['jwplayer-id'],
        'visibility': props.resource['visibility'],
        'comcast-platform-id': props.resource['comcast-platform-id'],
        'video-type': props.resource['video-type'],
      }) || {
        restricted: defaultRestricted,
        'public-video':
          props.programme && props.programme.type === 'production-companies',
        downloadable:
          props.theme.features.videos.watermarkedDownloadable || false,
        parent: props.episode || props.series || props.programme || props.parent,
      },
      isEditing: props.resource ? true : false,
      status: 'loading',//.'idle',
      errors: undefined,
      chosenAction,
      videoTypes: [],
    }
  }

  componentWillMount() {
    VideoStore.on('error', this.retrieveErrors)
    VideoStore.on('change', this.props.onSave)
    ProgrammesStore.on('change', this.setProgramme)
  }

  componentWillUnmount() {
    VideoStore.removeListener('error', this.retrieveErrors)
    VideoStore.removeListener('change', this.props.onSave)
    ProgrammesStore.removeListener('change', this.setProgramme)
  }

  componentDidMount() {
    const { waitForLoading } = this.props
    waitForLoading.onCompletion(() => {
      this.setState({
        status: 'idle'
      })
    })

    if (!this.props.programme && this.props.series?.programme?.id) {
      this.getProgrammeResources(this.props.series.programme.id)
      waitForLoading.waitFor('selectedProgramme')
    }

    if (this.props.videoProviders.wistia) {
      waitForLoading.waitFor('wistiaConfig')
      findAllByModel('wistia-accounts', {
        fields: ['wistia-token', 'wistia-project'],
      } as any).then(resources => {
        this.setState({
          wistiaConfig: resources?.[0],
        }, () => {
          waitForLoading.finished('wistiaConfig')
        })
      })
    }

    if (this.props.theme.features.videos.types) {
      waitForLoading.waitFor('video-types')
      findAllByModel('video-types', {
        fields: ['name'],
      }).then(response => {
        this.setState({
          videoTypes: response.map((videoType) => ({
            value: videoType.id,
            label: videoType.name,
            ...videoType
          })),
        }, () => {
          waitForLoading.finished('video-types')
        })
      })
    }
  }

  setProgramme = () => {
    const { waitForLoading } = this.props
    this.setState({
      selectedProgramme: ProgrammesStore.getResource(),
    }, () => {
      waitForLoading.finished('selectedProgramme')
    })
  }

  uploaderSuccess = (file, media) => {
    this.setState(({ resource }) => ({
      resource: Object.assign({}, resource, {
        name: media['attributes']['name'],
        'wistia-id': media['id'],
        'mp4-url': media['attributes']['url'],
      }),
    }))
  }

  retrieveErrors = () => {
    this.setState({
      errors: VideoStore.getErrors(),
      status: 'errored',
    })
  }

  renderErrors = () => {
    if (this.state.errors) {
      const { theme } = this.props
      const errorKeys = Object.keys(this.state.errors)
      if (errorKeys.find(key => key === 'parent-id')) {
        const update = { ...this.state.errors }
        delete update['parent-id']
        delete update['parent-type']
        update[theme.localisation.programme.upper] = "can't be blank"
        this.setState({
          errors: update,
        })
      }
      return (
        <ul className="cms-form__errors">
          {errorKeys.map((key, i) => {
            const error = this.state.errors[key]
            return <li key={i}>{`${key} - ${error}`}</li>
          })}
        </ul>
      )
    }
  }

  handleInputChange = e => {
    const update = this.state.resource
    update[e.target.name] = e.target.value
    this.setState({
      resource: update,
    })
  }

  handleCheckboxChange = e => {
    const update = this.state.resource
    update[e.target.name] = !update[e.target.name]
    this.setState({
      resource: update,
    })
  }

  handleFileChange = e => {
    const target = e.target.name
    const input: any = this.refs[target]
    let update = this.state.resource
    const file = input.files[0]
    const reader = new FileReader()
    const size = file.size
    const chunk_size = Math.pow(2, 13)
    const chunks = []

    let offset = 0
    reader.onloadend = e => {
      if (e.target.readyState == FileReader.DONE) {
        var chunk = e.target.result
        chunks.push(chunk)
        if (offset < size) {
          offset += chunk_size
          const blob = file.slice(offset, offset + chunk_size)
          reader.readAsArrayBuffer(blob)
        }
      }
    }
    reader.onerror = e => {
      this.setState({
        errors: [e.target.error.message],
      })
    }
    var blob = file.slice(offset, offset + chunk_size)
    update[target] = input.files[0]
    this.setState({ resource: update })
    reader.readAsArrayBuffer(blob)
  }

  saveResource = (e, create = false) => {
    const resourceToSave = { ...this.state.resource }
    e.preventDefault()
    this.setState({ status: 'loading' })
    let options = null
    if (resourceToSave['brightcove-video-file']) {
      this.uploadBrightcoveVideoFile()
    } else {
      if (!this.state.selectedProgramme) {
        options = { include: 'parent' }
      }

      // If chosen action has been changed but no corresponding id exists, force api to pass the correct error
      if (this.state.chosenAction === 'brightcove-id' && !this.state.resource['brightcove-id']) {
        resourceToSave['brightcove-id'] = '0'
      } else if (this.state.chosenAction === 'upload-to-brightcove' && !this.state.resource['brightcove-video-file']) {
        this.setState({
          errors: {
            'brightcove-video': 'Did not upload a video'
          },
          status: 'errored',
        })
        return false
      } else if (this.state.chosenAction === 'knox' && !this.state.resource['knox-uuid']) {
        resourceToSave['knox-uuid'] = '0'
      } else if (this.state.chosenAction === 'wistia-id' && !this.state.resource['wistia-id']) {
        resourceToSave['wistia-id'] = '0'
      } else if (this.state.chosenAction === 'jwplayer-id' && !this.state.resource['jwplayer-id']) {
        resourceToSave['jwplayer-id'] = '0'
      } else if (this.state.chosenAction === 'comcast-platform-id' && !this.state.resource['comcast-platform-id']) {
        resourceToSave['jwplayer-id'] = '0'
      }

      editResourceBlackList.forEach(key => {
        if (resourceToSave.hasOwnProperty(key)) {
          delete resourceToSave[key]
        }
      })
      if (create) {
        VideoActions.createResource(resourceToSave, options)
      } else {
        VideoActions.updateResource(resourceToSave)
      }
    }
  }

  cancelUploadFunc: () => Promise<void>

  setCancelUploadFunc = (func: () => Promise<void>) => {
    this.cancelUploadFunc = async () => {
      await func()
      this.setState({
        brightcoveUpload: undefined,
      })
    }
  }

  uploadBrightcoveVideoFile = () => {
    const { resource } = this.state

    useBrightcoveUploader(
      resource,
      this.reportUploadBrightcoveProgress,
      this.props.theme,
      this.setCancelUploadFunc,
    )
      .then(({ completed }) => {
        if (completed) {
          this.setState({ status: 'fulfilled' })
          this.props.onSave()
        } else {
          this.setState({ status: 'idle' })
        }
      })
      .catch(e => {
        if (e?.response?.data?.errors) {
          this.setState({
            status: 'errored',
            errors: e?.response?.data?.errors?.reduce(
              (obj, err) => ({
                ...obj,
                [err]: err,
              }),
              {},
            ),
          })
        } else {
          this.setState({ status: 'errored', errors: { error: e.toString() } })
        }
      })
  }

  reportUploadBrightcoveProgress: OnProgressHandler = ({
    fileSize,
    secondsLeft,
    remainingSize,
    percentComplete,
  }) => {
    this.setState({
      brightcoveUpload: {
        fileSize,
        secondsLeft,
        remainingSize,
        percentComplete,
        timeBegun:
          this.state.brightcoveUpload?.timeBegun || new Date().getTime(),
      },
    })
  }

  getProgrammeResources = programmeId => {
    ProgrammesActions.getResource(programmeId, {
      include: 'series,series.episodes',
      fields: {
        programmes: 'title-with-genre,series',
        series: 'name,episodes',
        episodes: 'name',
      },
    })
  }

  updateSelectedParent = (type, fallback, newState = {}) => parent => {
    if (type === 'selectedProgramme' && parent) {
      this.getProgrammeResources(parent.id)
    }
    this.setState(({ resource }) => {
      const update = {
        resource: Object.assign({}, resource, {
          parent: parent || fallback || false,
        }),
        ...newState,
        [type]: parent,
      }
      return update
    })
  }

  updatePublicAndRestricted = ({ target }) => {
    const otherRadio = target.name === 'public-video' ? 'restricted' : 'public-video'
    const resource = { ...this.state.resource }
    resource[target.name] = target.checked
    if (target.checked) {
      resource[otherRadio] = false
    }
    this.setState({
      resource
    })
  }

  render() {
    const { theme, videoProviders } = this.props
    const easytrack =
      theme.features.rightsManagement &&
      theme.features.rightsManagement.includes('easytrack')
    const {
      resource,
      isEditing,
      status,
      selectedProgramme,
      selectedSeries,
      selectedEpisode,
      chosenAction,
    } = this.state
    const buttonClasses = [
      'button',
      'filled',
      status === 'loading' && 'loading',
    ].join(' button--')
    const videoTxt = theme.localisation.video.upper
    const buttonText = isEditing ? `Save ${videoTxt}` : `Create ${videoTxt}`

    const actionOptions: { value: PossibleAction; label: string }[] = [
      {
        label: 'Add from MP4 URL',
        value: 'mp4-url',
      },
    ]

    if (videoProviders.wistia && this.state.wistiaConfig) {
      actionOptions.push({
        label: `Wistia ${videoTxt}`,
        value: 'wistia-id',
      })
    }

    if (videoProviders.brightcove) {
      actionOptions.push({
        label: `Existing Brightcove ${videoTxt}`,
        value: 'brightcove-id',
      })
    }

    if (theme.features.videos.brightcoveUploader && videoProviders.brightcove) {
      actionOptions.push({
        label: `Upload new Brightcove ${videoTxt}`,
        value: 'upload-to-brightcove',
      })
    }

    if (videoProviders.knox) {
      actionOptions.push({
        label: `Add existing Knox ${videoTxt}`,
        value: 'knox',
      })
    }

    if (videoProviders.jwplayer) {
      actionOptions.push({
        label: `Existing JW ${videoTxt}`,
        value: 'jwplayer-id',
      })
    }

    if (videoProviders.comcast) {
      actionOptions.push({
        label: `Existing Comcast ${videoTxt}`,
        value: 'comcast-platform-id',
      })
    }

    return (
      <form
        className="cms-form"
        onSubmit={e => {
          this.saveResource(e, !isEditing)
        }}
      >
        {this.props.parent?.type === 'production-companies' ? (
          <h3>
            Production Company:{' '}
            {((this.props.parent as unknown) as ProductionCompanyType).name}
          </h3>
        ) : (
          <>
            <FormControl label={theme.localisation.programme.upper} required>
              <AsyncSearchProgrammes
                value={selectedProgramme}
                onChange={this.updateSelectedParent('selectedProgramme', null, {
                  selectedSeries: false,
                  selectedEpisode: false,
                })}
                required
              />
            </FormControl>

            <FormControl label={theme.localisation.series.upper}>
              <Select
                value={selectedSeries}
                onChange={this.updateSelectedParent(
                  'selectedSeries',
                  selectedProgramme,
                  { selectedEpisode: false },
                )}
                options={
                  selectedProgramme &&
                  selectedProgramme.type !== 'production-companies'
                    ? (selectedProgramme as ProgrammeType).series
                    : []
                }
                labelKey="name"
                valueKey="id"
              />
            </FormControl>

            <FormControl label="Episode">
              <Select
                value={selectedEpisode}
                onChange={this.updateSelectedParent(
                  'selectedEpisode',
                  selectedSeries,
                )}
                options={selectedSeries ? selectedSeries.episodes : []}
                labelKey="name"
                valueKey="id"
              />
            </FormControl>
          </>
        )}

        <FormControl
          type="text"
          label="Name"
          name="name"
          value={resource.name}
          required
          onChange={this.handleInputChange}
        />

        {this.state.videoTypes.length > 0 && (
          <FormControl label={`${theme.localisation.video.upper} Type`}>
            <Select
              options={this.state.videoTypes}
              onChange={value => {
                this.setState({
                  resource: {
                    ...this.state.resource,
                    //@ts-ignore
                    'video-type': { id: value }
                  }
                })
              }}
              inputProps={{
                'data-testid': 'video-type-select'
              }}
              name="video-type"
              value={resource['video-type']?.id}
              clearable={true}
              simpleValue={true}
            />
          </FormControl>
        )}

        <FormControl label="Visibility">
          <Select
            options={[
              {value: 'visible', label: 'All Devices'},
              {value: 'web_only', label: 'Web Only'},
              {value: 'app_only', label: 'App Only'}
            ]}
            onChange={value =>
              this.handleInputChange({
                target: { name: 'visibility', value },
              })
            }
            name="visibility"
            value={resource['visibility'] || 'visible'}
            clearable={false}
            simpleValue={true}
          />
        </FormControl>

        {theme.features.videos.languages && (
          <FormControl label="Language(s)">
            <LanguageMultiSelect
              value={resource.languages || []}
              onChange={languages =>
                this.setState({
                  resource: { ...this.state.resource, languages },
                })
              }
            />
          </FormControl>
        )}

        <VideoSourceWrapper>
          <FormControl label={theme.localisation.video.upper + ' source'}>
            <Select
              options={actionOptions}
              labelKey="label"
              valueKey="value"
              value={this.state.chosenAction}
              onChange={({ value }) => {
                this.setState({ chosenAction: value })
              }}
              clearable={false}
            ></Select>
          </FormControl>

          {chosenAction === 'mp4-url' && (
            <FormControl
              type="text"
              label="MP4 URL"
              name="mp4-url"
              value={
                resource['mp4-url'] === 'undefined' ? '' : resource['mp4-url']
              }
              onChange={this.handleInputChange}
            />
          )}

          {chosenAction === 'brightcove-id' && (
            <FormControl
              key="brightcove_id"
              type="text"
              label="Brightcove ID"
              name="brightcove-id"
              value={resource['brightcove-id']}
              onChange={this.handleInputChange}
            />
          )}

          {chosenAction === 'upload-to-brightcove' && (
            <div key="brightcove_uploader" className="file-input cms-form__control">
              <label className="cms-form__label">{`Upload ${videoTxt}`}</label>
              <div className="cms-form__inner">
                <input
                  type="file"
                  ref="brightcove-video-file"
                  onChange={this.handleFileChange}
                  name="brightcove-video-file"
                  accept={theme.features.acceptedFileTypes.video}
                  className="file-input__input"
                />
                <Span className="button button--filled button--small" classesToPrefix={['button']}>
                  Select
                </Span>
                <span className="file-input__path">
                  {resource['brightcove-video-file'] &&
                    resource['brightcove-video-file'].name}
                </span>
              </div>
            </div>
          )}

          {chosenAction === 'wistia-id' && this.state.wistiaConfig && (
            <>
              <FormControl
                key="wistia_id"
                type="text"
                label="Wistia ID"
                name="wistia-id"
                value={resource['wistia-id']}
                onChange={this.handleInputChange}
              />
              <WistiaUploader
                wistiaConfig={this.state.wistiaConfig}
                onUploadSuccess={this.uploaderSuccess}
                videoProviders={this.props.videoProviders}
              />
            </>
          )}

          {chosenAction === 'knox' && (
            <FormControl
              key="knox_uuid"
              type="text"
              label="Knox ID"
              name="knox-uuid"
              value={resource['knox-uuid'] || ''}
              onChange={this.handleInputChange}
            />
          )}

          {chosenAction === 'jwplayer-id' && (
            <FormControl
              key="jwplayer_id"
              type="text"
              label="JW Video ID"
              name="jwplayer-id"
              value={resource['jwplayer-id']}
              onChange={this.handleInputChange}
            />
          )}

          {chosenAction === 'comcast-platform-id' && (
            <FormControl
              key="comcast_platform_id"
              type="text"
              label="Comcast ID"
              name="comcast-platform-id"
              value={resource['comcast-platform-id']}
              onChange={this.handleInputChange}
            />
          )}

        </VideoSourceWrapper>
        {((isEditing && !easytrack) || (easytrack && (chosenAction === 'brightcove-id' || chosenAction === 'upload-to-brightcove'))) &&
          <FormControl
            key="external_id"
            type="text"
            label={easytrack ? 'EasyTrack ID' : 'External ID'}
            name="external-id"
            readonly={!easytrack}
            required={easytrack}
            value={resource['external-id'] || ''}
            onChange={this.handleInputChange}
          />
        }

        {(!this.props.parent ||
          // @ts-ignore
          this.props.parent?.type !== 'production-companies') && (
          <>
            <FormControl
              type="checkbox"
              modifiers={['top']}
              id="public-video"
              name="public-video"
              label="Public"
              checkboxLabeless={true}
              checked={resource['public-video']}
              onChange={this.updatePublicAndRestricted}
            />
            <FormControl
              type="checkbox"
              modifiers={['top']}
              id="restricted"
              name="restricted"
              label="Restricted"
              checkboxLabeless={true}
              checked={resource['restricted']}
              onChange={this.updatePublicAndRestricted}
            />
          </>
        )}

        {theme.features.videos.watermarked && (
          <FormControl label="Downloadable" modifiers={['top']}>
            <CustomCheckbox
              checked={this.state.resource['downloadable']}
              labeless="true"
              onChange={this.handleCheckboxChange}
              id="downloadable"
              name="downloadable"
            />
          </FormControl>
        )}

        {this.renderErrors()}
        {status === 'loading' &&
          theme.features.videos.brightcoveUploader &&
          this.state.brightcoveUpload && (
            <UploadIndicator>
              <h4>Uploading {theme.localisation.video.upper}</h4>
              <div className="progress">
                <span className="progress__bar">
                  <span
                    className="progress__loaded"
                    style={{
                      width: `${this.state.brightcoveUpload?.percentComplete *
                        100}%`,
                    }}
                  ></span>
                </span>
              </div>
              <p>
                {new Date().getTime() - this.state.brightcoveUpload?.timeBegun <
                5000
                  ? 'Calculating time remaining...'
                  : getTimeRemaining(this.state.brightcoveUpload?.secondsLeft)}
              </p>
            </UploadIndicator>
          )}

        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={buttonClasses}>
            {buttonText}
          </Button>
          {status === 'loading' &&
            this.state.brightcoveUpload &&
            this.cancelUploadFunc && (
              <Button
                type="button"
                className="button"
                onClick={this.cancelUploadFunc}
              >
                Cancel Upload
              </Button>
            )}
        </div>
      </form>
    )
  }
}

class WistiaUploader extends React.Component<{
  onUploadSuccess: (file: any, media: any) => void
  videoProviders: VideoProviders
  wistiaConfig: WistiaAccountType
}> {
  createUploader = () => {
    const { wistiaConfig, onUploadSuccess } = this.props
    // @ts-ignore
    window._wapiq = window._wapiq || []

    // @ts-ignore
    _wapiq.push(W => {
      new W.Uploader({
        accessToken: wistiaConfig['wistia-token'],
        projectId: wistiaConfig['wistia-project'],
        dropIn: 'wistia_uploader',
      }).bind('uploadsuccess', onUploadSuccess)
    })
  }
  componentDidMount() {
    this.createUploader()
  }
  render() {
    return (
      <div
        key="uploader"
        id="wistia_uploader"
        style={{ height: `${250}px` }}
      ></div>
    )
  }
}

const enhance = compose(
  withTheme,
  withVideoProviders,
  withWaitForLoadingDiv,
)

export default enhance(VideoForm)

const VideoSourceWrapper = styled.div`
  margin: 4rem 0rem;
`

type OnProgressHandler = (params: {
  percentComplete: number
  secondsLeft: number
  fileSize: number
  remainingSize: number
}) => void


const getTimeRemaining = (seconds: number) => {
  if (!seconds) {
    return ''
  }
  if (seconds > 120) {
    return `Approximately ${(seconds / 60).toFixed(0)} minutes remaining`
  }
  return `Approximately ${seconds.toFixed(0)} seconds remaining`
}

const UploadIndicator = styled.div`
  background-color: #fafafa;
  border-left: 4px solid #aaa;
  padding: 1.5rem;
  p {
    margin: 0;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    opacity: 0.7;
  }
  h4 {
    margin: 0px;
    margin-bottom: 0.75rem;
  }
`
